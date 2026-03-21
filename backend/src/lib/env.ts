import { z } from 'zod';

const envSchema = z.object({
    PORT: z.string().optional().transform(val => val ? parseInt(val, 10) : 4000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),
    CSRF_SECRET: z.string().min(16, 'CSRF_SECRET must be at least 16 characters'),
    JWT_SECRET: z.string().optional(),
    JWT_REFRESH_SECRET: z.string().optional(),
    CORS_ORIGIN: z.string().optional(),
    REDIS_URL: z.string().url().optional().or(z.literal('')),
    BREVO_API_KEY: z.string().optional(),
    EMAIL_FROM_NAME: z.string().optional(),
    EMAIL_FROM_ADDRESS: z.string().email().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

export function validateEnvironment(): EnvConfig {
    if (cachedConfig) {
        return cachedConfig;
    }

    const env = {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI,
        SESSION_SECRET: process.env.SESSION_SECRET,
        CSRF_SECRET: process.env.CSRF_SECRET,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        REDIS_URL: process.env.REDIS_URL,
        BREVO_API_KEY: process.env.BREVO_API_KEY,
        EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
        EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    };

    const result = envSchema.safeParse(env);

    if (!result.success) {
        const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        throw new Error(`Environment validation failed: ${errors}`);
    }

    cachedConfig = result.data;
    return cachedConfig;
}

export function getEnv(key: keyof EnvConfig): string | number | undefined {
    if (!cachedConfig) {
        validateEnvironment();
    }
    return cachedConfig?.[key];
}

export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
}
