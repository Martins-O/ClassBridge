import { Response } from 'express';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    message?: string;
    meta?: {
        pagination?: PaginationMeta;
        [key: string]: any;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    return res.status(statusCode).json({
        success: true,
        data,
        ...(message && { message }),
    });
}

export function sendPaginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    statusCode = 200
): Response {
    return res.status(statusCode).json({
        success: true,
        data,
        meta: {
            pagination,
        },
    });
}

export function sendError(
    res: Response,
    message: string,
    statusCode = 400,
    code?: string
): Response {
    return res.status(statusCode).json({
        success: false,
        error: message,
        code,
    });
}

export function sendCreated<T>(res: Response, data: T, message?: string): Response {
    return res.status(201).json({
        success: true,
        data,
        ...(message && { message }),
    });
}

export function sendNoContent(res: Response): Response {
    return res.status(204).send();
}

export function sendMessage(res: Response, message: string, statusCode = 200): Response {
    return res.status(statusCode).json({
        success: true,
        message,
    });
}

export function sendUnauthorized(res: Response, message = 'Unauthorized'): Response {
    return sendError(res, message, 401, 'UNAUTHORIZED');
}

export function sendForbidden(res: Response, message = 'Forbidden'): Response {
    return sendError(res, message, 403, 'FORBIDDEN');
}

export function sendNotFound(res: Response, message = 'Resource not found'): Response {
    return sendError(res, message, 404, 'NOT_FOUND');
}

export function sendConflict(res: Response, message: string, code = 'CONFLICT'): Response {
    return sendError(res, message, 409, code);
}

export function sendValidationError(
    res: Response,
    errors: { field: string; message: string }[],
    message = 'Validation failed'
): Response {
    return res.status(400).json({
        success: false,
        error: message,
        code: 'VALIDATION_ERROR',
        meta: { errors },
    });
}
