import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { message: 'Unauthorized: Missing or invalid token' },
      meta: null
    });
  }

  const token = authHeader.split(' ')[1];

  // Using supabase-js client to verify user via the Supabase API
  // as per the latest auth integration architecture.
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      req.log.error({ err: error }, 'Supabase Auth Verification failed');
      return res.status(401).json({
        success: false,
        data: null,
        error: { message: 'Unauthorized: Invalid token' },
        meta: null
      });
    }

    // Attach user payload to request
    (req as any).user = user;
    next();
  } catch (error) {
    req.log.error({ err: error }, 'Authentication process failed');
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Internal Server Error during authentication' },
      meta: null
    });
  }
};
