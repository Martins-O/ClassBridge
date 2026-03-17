import { Response } from 'express';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
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

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({
        success: true,
        data,
    });
}

export function sendPaginated<T>(
    res: Response,
    data: T[],
    pagination: PaginatedResponse<T>['pagination'],
    statusCode = 200
): Response {
    return res.status(statusCode).json({
        success: true,
        data,
        pagination,
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

export function sendCreated<T>(res: Response, data: T): Response {
    return sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): Response {
    return res.status(204).send();
}
