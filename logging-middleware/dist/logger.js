"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const LOG_API = "http://4.224.186.213/evaluation-service/logs";
async function Log(stack, level, pkg, message) {
    const token = process.env.AFFORDMED_TOKEN ||
        (typeof import.meta !== "undefined"
            ? import.meta.env?.VITE_TOKEN
            : "");
    try {
        await fetch(LOG_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ stack, level, package: pkg, message }),
        });
    }
    catch {
        // silent fail — never console.log
    }
}
