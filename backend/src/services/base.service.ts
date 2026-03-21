export abstract class BaseService {
  protected async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage = 'Operation failed'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`${errorMessage}: ${error.message}`);
      }
      throw error;
    }
  }

  protected sanitizeObject<T extends Record<string, any>>(
    obj: T,
    fieldsToRemove: (keyof T)[]
  ): Omit<T, (typeof fieldsToRemove)[number]> {
    const sanitized = { ...obj };
    fieldsToRemove.forEach(field => {
      delete sanitized[field];
    });
    return sanitized;
  }
}
