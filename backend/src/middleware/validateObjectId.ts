import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate that a route parameter is a valid MongoDB ObjectId
 * @param paramName - The name of the parameter to validate (default: 'id')
 */
export function validateObjectId(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    if (!id) {
      res.status(400).json({
        error: `${paramName} parameter is required`,
        code: 'MISSING_PARAMETER'
      });
      return;
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdRegex.test(id)) {
      res.status(400).json({
        error: `Invalid ${paramName} format. Must be a valid 24-character hex string.`,
        code: 'INVALID_ID_FORMAT',
        provided: id
      });
      return;
    }

    next();
  };
}

/**
 * Validate multiple ObjectId parameters
 * @param paramNames - Array of parameter names to validate
 */
export function validateObjectIds(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      
      if (!id) {
        res.status(400).json({
          error: `${paramName} parameter is required`,
          code: 'MISSING_PARAMETER'
        });
        return;
      }

      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      
      if (!objectIdRegex.test(id)) {
        res.status(400).json({
          error: `Invalid ${paramName} format`,
          code: 'INVALID_ID_FORMAT',
          provided: id
        });
        return;
      }
    }

    next();
  };
}
