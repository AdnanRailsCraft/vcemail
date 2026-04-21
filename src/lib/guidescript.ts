import { Redis } from "@upstash/redis";

const REDIS_KEY = "guidescript";

function getRedisClient(): Redis | null {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.warn("GuidescriptService: Upstash Redis credentials missing.", { 
            hasUrl: !!url, 
            hasToken: !!token 
        });
        return null;
    }

    try {
        return new Redis({ url, token });
    } catch (err) {
        console.error("GuidescriptService: Failed to initialize Redis client:", err);
        return null;
    }
}

export class GuidescriptService {
    async getGuidescript(): Promise<string> {
        try {
            const redis = getRedisClient();
            if (redis) {
                const stored = await redis.get<string>(REDIS_KEY);
                if (stored) return stored;
            } else {
                console.info("GuidescriptService: Redis not available, using environment fallback.");
            }
        } catch (err) {
            console.error("GuidescriptService: Redis read error, falling back to env:", err);
        }

        // Fallback to environment variable
        return process.env.GUIDESCRIPT || "";
    }

    async setGuidescript(content: string): Promise<void> {
        const redis = getRedisClient();
        if (!redis) {
            const errorMsg = "Upstash Redis is not configured. Please ensure KV_REST_API_URL and KV_REST_API_TOKEN are set in your environment variables without leading spaces.";
            console.error("GuidescriptService: " + errorMsg);
            throw new Error(errorMsg);
        }
        
        try {
            await redis.set(REDIS_KEY, content);
        } catch (err: any) {
            console.error("GuidescriptService: Failed to save to Redis:", err);
            throw new Error(`Failed to save to Redis: ${err.message || 'Unknown error'}`);
        }
    }
}
