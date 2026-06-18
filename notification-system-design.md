# Notification System Design

## Stage 1

### Core Actions
- Fetch notifications
- Mark notification as read
- Mark all as read
- Receive real-time notifications

### Endpoints

#### GET /api/notifications
Fetch paginated notifications for the authenticated user.

Headers: 
Authorization: Bearer <token>

Query params: 
?limit=10&page=1&notification_type=Placement

Response 200:
```json
{
  "notifications": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### PATCH /api/notifications/:id/read
Mark a single notification as read.

Response 200: `{ "success": true }`

#### PATCH /api/notifications/read-all
Mark all unread notifications as read.

### Real-Time Mechanism
WebSocket endpoint: `ws://localhost:4000/notifications`
- Server emits event on new notification
- Client subscribes on login
- Payload: `{ type: "NEW_NOTIFICATION", data: { id, type, message, timestamp } }`

---

## Stage 2

### Database: PostgreSQL

### Schema

```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   INTEGER NOT NULL,
  type         notification_type NOT NULL,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_student_unread
  ON notifications(student_id, is_read, created_at DESC);
```

### Scale Problems at 50k students / 5M notifications
- `SELECT *` without index = full table scan = O(5M) rows read
- Solution: composite index on `(student_id, is_read, created_at)`
- Partition table by `student_id` range for very large scale (maybe later if needed)

### SQL for Stage 1 APIs

```sql
-- GET /notifications (paginated)
SELECT id, type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- PATCH /:id/read
UPDATE notifications
SET is_read = true
WHERE id = $1 AND student_id = $2;
```

---

## Stage 3

### Query Optimization

The given slow query:
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

Key points:
- `SELECT *` fetches all columns including large message TEXT — use column projection instead (just select what u need)
- No index on `(studentID, isRead, createdAt)` — full table scan at 5M rows
- "Index every column" advice is wrong — indexes slow down INSERT/UPDATE (write amplification), consume storage, and the query planner may choose wrong index
- Composite index strategy: cover the WHERE clause columns and the ORDER BY column together

Placement notification query:
```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4

### Caching Strategy

Problem: DB queried on every page load for every student = `O(concurrent_users × query_cost)`

**Solution 1: Redis per-student cache with TTL of 60 seconds**
- Key: `notifications:{student_id}:page:{page}`
- Invalidate on new notification (pub/sub or cache-aside)
- Tradeoff: up to 60s stale data; acceptable for notifications

**Solution 2: Pagination** 
- don't load all 5M rows, load 10-20 at a time

**Solution 3: Read replicas for DB** 
- route GET queries to replica

Tradeoffs to mention: Redis memory cost (can crash if we dont clear), cache invalidation complexity, cold start on first load

---

## Stage 5

### Reliability

Problems with the given pseudocode:
- `send_email` and `save_to_db` called sequentially in a loop — if email fails at student 200, the remaining 49,800 get no email AND the loop exits
- DB save and email should NOT be atomic — they have different failure modes and retry strategies
- No retry mechanism — transient email API failures cause permanent failures

**Revised approach:**
- Save to DB first (fast, reliable, idempotent with `ON CONFLICT DO NOTHING`)
- Enqueue email task to a job queue (Bull/BullMQ with Redis)
- Queue worker retries failed emails with exponential backoff
- DB insert is the source of truth; email is best-effort with retry

**Revised pseudocode:**

```typescript
async function notify_all(student_ids: string[], message: string) {
  Log("backend", "info", "service", `notify_all called for ${student_ids.length} students`);

  // Step 1: Bulk insert to DB (fast, atomic, idempotent)
  await db.bulkInsert(student_ids.map(id => ({
    student_id: id, message, type: "Placement", is_read: false
  })));
  Log("backend", "info", "db", "Bulk insert completed for all students");

  // Step 2: Enqueue emails separately (non-blocking)
  for (const student_id of student_ids) {
    await emailQueue.add("send-placement-email", { student_id, message }, {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 }
    });
  }
  Log("backend", "info", "service", "All email jobs enqueued successfully");
}

// Queue worker (separate process):
emailQueue.process("send-placement-email", async (job) => {
  const { student_id, message } = job.data;
  await sendEmail(student_id, message);
  Log("backend", "info", "service", `Email sent to student ${student_id}`);
});
```

Why separate? DB insert Vgives immediate in-app notification. Email delivery is async and can retry independently without blocking the whole batch.

---

## Stage 6

### Priority Inbox Approach
Priority is determined by: typeWeight (Placement=3, Result=2, Event=1) combined with
recency (Unix timestamp in ms as tiebreaker). Score = weight × 10^13 + timestamp_ms.

### Efficient top-N maintenance
For real-time streams, a min-heap of capacity N is used:
- Push if heap size < N
- Replace root if new score > root score
- O(log N) per insertion, O(1) to read current top N

### Code location
notification-app-be/src/priority.ts
Screenshots in notification-app-be/screenshots/
