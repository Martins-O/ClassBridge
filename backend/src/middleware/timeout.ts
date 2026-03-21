import { Request, Response, NextFunction } from 'express';

const DEFAULT_TIMEOUT = 30000;

export interface TimeoutOptions {
    timeout?: number;
    message?: string;
}

export function requestTimeout(options: TimeoutOptions = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const message = options.message || 'Request timeout';

    return (req: Request, res: Response, next: NextFunction) => {
        const timeoutId = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    error: message,
                    code: 'REQUEST_TIMEOUT',
                });
            }
        }, timeout);

        res.on('finish', () => {
            clearTimeout(timeoutId);
        });

        res.on('close', () => {
            clearTimeout(timeoutId);
        });

        next();
    };
}

export function abortOnTimeout(req: Request, res: Response, next: NextFunction) {
    req.setTimeout(DEFAULT_TIMEOUT, () => {
        if (!res.headersSent) {
            res.status(408).json({
                success: false,
                error: 'Request timeout',
                code: 'REQUEST_TIMEOUT',
            });
        }
    });
    next();
}
