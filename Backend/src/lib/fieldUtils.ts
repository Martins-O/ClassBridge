export function whitelistFields<T extends Record<string, unknown>>(
    data: T,
    allowedFields: string[]
): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
        if (field in data && data[field] !== undefined) {
            result[field] = data[field];
        }
    }
    
    return result;
}

export function removeSensitiveFields<T extends Record<string, unknown>>(
    data: T,
    sensitiveFields: string[] = ['password', 'token', 'secret', 'backupCodes', 'twoFactorSecret']
): Record<string, unknown> {
    const result: Record<string, unknown> = { ...data };
    
    for (const field of sensitiveFields) {
        delete result[field];
    }
    
    return result;
}
