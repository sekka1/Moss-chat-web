/**
 * Authentication routes
 *
 * Provides login, logout, and auth-status endpoints.
 *
 * @module auth-routes
 */

import { Router, Request, Response } from 'express';
import { verifyLogin, verifyToken } from './auth-service.js';
import { SESSION_COOKIE, loginRateLimiter } from './auth-middleware.js';

/** 30 days in milliseconds */
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

/**
 * Request body for the login endpoint
 */
interface LoginBody {
  email: string;
  passwordHash: string;
}

/**
 * Creates and returns the auth Router.
 * @returns Express Router with /api/login, /api/logout, /api/auth/status
 */
export function createAuthRouter(): Router {
  const router = Router();

  /**
   * POST /api/login
   * Authenticates a user with email + client-side SHA-256 password hash.
   * On success, sets an HTTP-only cookie with a 30-day JWT.
   */
  router.post(
    '/api/login',
    loginRateLimiter,
    async (req: Request<object, unknown, LoginBody>, res: Response) => {
      const { email, passwordHash } = req.body;

      if (!email || !passwordHash) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      try {
        const token = await verifyLogin(email, passwordHash);

        if (!token) {
          res.status(401).json({ error: 'Invalid email or password' });
          return;
        }

        // Set HTTP-only, secure cookie
        res.cookie(SESSION_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: COOKIE_MAX_AGE,
          path: '/',
        });

        res.json({ success: true });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
      }
    }
  );

  /**
   * POST /api/logout
   * Clears the session cookie.
   */
  router.post('/api/logout', (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.json({ success: true });
  });

  /**
   * GET /api/auth/status
   * Returns 200 if the session cookie contains a valid JWT, 401 otherwise.
   * Used by the frontend on page load to decide whether to show the chat or redirect to login.
   */
  router.get('/api/auth/status', (req: Request, res: Response) => {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;

    if (!token) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ authenticated: false });
      return;
    }

    res.json({ authenticated: true, email: payload.email });
  });

  return router;
}
