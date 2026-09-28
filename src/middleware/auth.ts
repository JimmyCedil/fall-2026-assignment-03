import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.get('X-User-Id');
  const userId = Number(header);

  if (!header || !/^[1-9]\d*$/.test(header) || !Number.isSafeInteger(userId)) {
    res.status(401).json({ error: 'Valid X-User-Id header required' });
    return;
  }

  res.locals.userId = userId;
  next();
  // TODO: Student implementation - Part 1: Authentication Middleware
  // Store the authenticated userId on res.locals.userId
}

export default authMiddleware;
