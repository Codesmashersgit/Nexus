/**
 * callLimitUtils.js
 * Tracks daily video call usage for free-plan users.
 * Limit: 2 calls per day (resets at midnight).
 */

const CALL_LIMIT = 2;
const STORAGE_KEY = "freeCallUsage"; // { date: "YYYY-MM-DD", count: number }

/** Returns today's date string in YYYY-MM-DD format */
const getTodayStr = () => new Date().toISOString().slice(0, 10);

/** Returns the current usage object { date, count } or a fresh one */
const getUsage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Reset if it's a new day
            if (parsed.date === getTodayStr()) return parsed;
        }
    } catch (_) { /* ignore */ }
    return { date: getTodayStr(), count: 0 };
};

/** How many calls remain today for a free user */
export const getCallsRemaining = () => {
    const usage = getUsage();
    return Math.max(0, CALL_LIMIT - usage.count);
};

/** Whether the user has exceeded today's call limit */
export const isCallLimitExceeded = () => getCallsRemaining() === 0;

/** Call this when user successfully joins/creates a room */
export const incrementCallCount = () => {
    const usage = getUsage();
    usage.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
};

/** Total daily call limit (for UI display) */
export const DAILY_CALL_LIMIT = CALL_LIMIT;

/** Checks if the user has an active Pro or Enterprise plan */
export const isProUser = () => {
    try {
        const rawPlan = localStorage.getItem("userPlan");
        if (rawPlan) {
            const plan = JSON.parse(rawPlan);
            // Check if plan is active and not expired
            if (plan.active && new Date(plan.expiresAt) > new Date()) {
                return true;
            }
        }
    } catch (_) { /* ignore */ }
    return false;
};
