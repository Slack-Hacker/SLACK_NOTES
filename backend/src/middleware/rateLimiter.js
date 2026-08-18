import ratelimit from "../config/upstash.js"

const rateLimiter = async (req, res, next) => {
    try {
        const identifier = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
        const { success } = await ratelimit.limit(identifier);

        if (!success) {
            return res.status(429).json({ success: false, message: "Too many requests. Please try again in a few seconds." });
        }
        next();
    } catch (error) {
        console.warn("Ratelimit error (failing open):", error.message);
        // Fail-open: allow request to proceed if ratelimiter service encounters an issue
        next();
    }
};

export default rateLimiter;