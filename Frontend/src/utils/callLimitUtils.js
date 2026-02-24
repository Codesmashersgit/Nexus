import axios from "axios";

const CALL_LIMIT = 2;
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/** Returns how many calls remain today for a free user */
export const getCallsRemaining = (user) => {
    if (!user || !user.callUsage) return CALL_LIMIT;
    return Math.max(0, CALL_LIMIT - user.callUsage.count);
};

/** Whether the user has exceeded today's call limit */
export const isCallLimitExceeded = (user) => {
    if (isProUser(user)) return false;
    return getCallsRemaining(user) === 0;
};

/** Call this when user successfully joins/creates a room (API call) */
export const incrementCallCount = async () => {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        await axios.post(`${backendUrl}/api/auth/increment-call`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error("Failed to increment call count on server:", error);
    }
};

/** Total daily call limit (for UI display) */
export const DAILY_CALL_LIMIT = CALL_LIMIT;

/** Checks if the user has an active Pro or Enterprise plan */
export const isProUser = (user) => {
    if (!user || !user.subscription) return false;
    const { planType, active, expiresAt } = user.subscription;
    return active && (planType === 'pro' || planType === 'enterprise') && new Date(expiresAt) > new Date();
};

