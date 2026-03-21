import { Request } from 'express';
import { Model, Query } from 'mongoose';
import { PaginationMeta } from './apiResponse';

export interface PaginationOptions {
    page?: number;
    limit?: number;
    maxLimit?: number;
    defaultLimit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationMeta;
}

export function getPaginationParams(req: Request, options: PaginationOptions = {}): {
    page: number;
    limit: number;
    skip: number;
} {
    const {
        maxLimit = 100,
        defaultLimit = 20
    } = options;

    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || defaultLimit;

    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), maxLimit);

    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

export function buildPagination<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}

export async function paginateQuery<T>(
    query: Query<T[], T>,
    req: Request,
    options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = getPaginationParams(req, options);

    const [data, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        query.model.countDocuments(query.getQuery())
    ]);

    return buildPagination(data, total, page, limit);
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}
