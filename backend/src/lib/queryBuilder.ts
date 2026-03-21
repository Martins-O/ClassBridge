import { Request } from 'express';

export interface QueryOptions {
    defaultSort?: string;
    allowedSortFields?: string[];
    allowedFilterFields?: string[];
}

export function getQueryParams(req: Request, options: QueryOptions = {}) {
    const { defaultSort = '-createdAt', allowedSortFields = [], allowedFilterFields = [] } = options;

    const sort = parseSort(req.query.sort as string, defaultSort, allowedSortFields);
    const filters = parseFilters(req.query.filter as string, allowedFilterFields);
    const search = parseSearch(req.query.search as string);

    return { sort, filters, search };
}

function parseSort(sortParam: string | undefined, defaultSort: string, allowedFields: string[]): Record<string, 1 | -1> {
    if (!sortParam) {
        return parseSortValue(defaultSort, allowedFields);
    }
    return parseSortValue(sortParam, allowedFields);
}

function parseSortValue(sortValue: string, allowedFields: string[]): Record<string, 1 | -1> {
    const sort: Record<string, 1 | -1> = {};
    
    if (sortValue.startsWith('-')) {
        const field = sortValue.slice(1);
        if (allowedFields.length === 0 || allowedFields.includes(field)) {
            sort[field] = -1;
        }
    } else {
        if (allowedFields.length === 0 || allowedFields.includes(sortValue)) {
            sort[sortValue] = 1;
        }
    }
    
    return sort;
}

function parseFilters(filterParam: string | undefined, allowedFields: string[]): Record<string, any> {
    const filters: Record<string, any> = {};
    
    if (!filterParam) {
        return filters;
    }

    try {
        const filterObj = JSON.parse(filterParam);
        
        for (const [key, value] of Object.entries(filterObj)) {
            if (allowedFields.length === 0 || allowedFields.includes(key)) {
                filters[key] = value;
            }
        }
    } catch {
        // If not valid JSON, try parsing as key=value pairs
        const pairs = filterParam.split(',');
        for (const pair of pairs) {
            const [key, value] = pair.split(':');
            if (key && value && (allowedFields.length === 0 || allowedFields.includes(key))) {
                filters[key] = value;
            }
        }
    }

    return filters;
}

function parseSearch(searchParam: string | undefined): { $or: Record<string, any>[] } | null {
    if (!searchParam || searchParam.trim().length < 2) {
        return null;
    }

    const searchRegex = { $regex: searchParam.trim(), $options: 'i' };

    return {
        $or: [
            { name: searchRegex },
            { email: searchRegex },
            { title: searchRegex },
            { description: searchRegex }
        ]
    };
}

export function buildQuery(filters: Record<string, any>, search: { $or: Record<string, any>[] } | null): Record<string, any> {
    const query: Record<string, any> = { ...filters };
    
    if (search) {
        query.$or = search.$or;
    }

    return query;
}
