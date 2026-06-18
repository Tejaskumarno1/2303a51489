"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";
const AUTH_TOKEN = process.env.AFFORDMED_TOKEN || "";
async function Log(stack, level, pkg, message) {
    try {
        const response = await fetch(LOG_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AUTH_TOKEN}`,
            },
            body: JSON.stringify({ stack, level, package: pkg, message }),
        });
        if (!response.ok) {
            // Silently fail — never use console here
        }
    }
    catch {
        // Network error — swallow silently
    }
}
