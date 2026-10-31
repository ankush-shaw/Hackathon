import type { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  company: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
    }
  }
}

/**
 * Parses user identity from Authorization Bearer token or custom headers
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers['x-user-role'] as string | undefined;
  const emailHeader = req.headers['x-user-email'] as string | undefined;
  const nameHeader = req.headers['x-user-name'] as string | undefined;
  const companyHeader = req.headers['x-user-company'] as string | undefined;

  let user: AuthUser | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed && (parsed.email || parsed.role || parsed.name)) {
        user = {
          id: parsed.id,
          name: parsed.name || 'Authorized User',
          email: parsed.email || 'user@brandguard.ai',
          role: parsed.role || 'Brand Marketing Lead',
          company: parsed.company || 'Enterprise'
        };
      }
    } catch {
      // Ignore token parse failure and try direct headers
    }
  }

  if (!user && (roleHeader || emailHeader || nameHeader)) {
    user = {
      name: nameHeader || 'Authorized User',
      email: emailHeader || 'user@brandguard.ai',
      role: roleHeader || 'Brand Marketing Lead',
      company: companyHeader || 'Enterprise'
    };
  }

  req.user = user;
  next();
}

/**
 * Strict authentication guard: returns 401 if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please provide a valid Authorization header or session credentials.',
      code: 'UNAUTHENTICATED'
    });
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) guard: returns 403 if user lacks required role
 */
export function requireRoles(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required for this operation.',
        code: 'UNAUTHENTICATED'
      });
    }

    const userRole = req.user.role.toLowerCase();
    const isAllowed = allowedRoles.some(
      r => r.toLowerCase() === userRole || userRole === 'admin' || userRole.includes('admin')
    );

    if (!isAllowed) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission for this action. Allowed roles: ${allowedRoles.join(', ')}`,
        code: 'FORBIDDEN'
      });
    }

    next();
  };
}

