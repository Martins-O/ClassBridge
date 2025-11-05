import type { Request, Response } from 'express';

export interface NextResponseInit {
  status?: number;
  headers?: Record<string, string>;
}

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

interface CookieRecord extends CookieOptions {
  value: string;
}

export class NextResponse {
  private body: unknown;
  private statusCode: number;
  private headers: Record<string, string>;
  private cookieJar: Record<string, CookieRecord> = {};

  private constructor(body: unknown, init?: NextResponseInit) {
    this.body = body;
    this.statusCode = init?.status ?? 200;
    this.headers = init?.headers ? { ...init.headers } : {};
  }

  static json(body: unknown, init?: NextResponseInit) {
    const response = new NextResponse(body, init);
    response.headers['Content-Type'] = 'application/json';
    return response;
  }

  get cookies() {
    return {
      set: (name: string, value: string, options: CookieOptions = {}) => {
        this.cookieJar[name] = { value, ...options };
      },
      delete: (name: string) => {
        delete this.cookieJar[name];
      }
    };
  }

  apply(res: Response) {
    Object.entries(this.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    Object.entries(this.cookieJar).forEach(([name, record]) => {
      res.cookie(name, record.value, record);
    });

    if (this.headers['Content-Type'] === 'application/json') {
      res.status(this.statusCode).json(this.body);
    } else {
      res.status(this.statusCode).send(this.body);
    }
  }
}

class CookieAdapter {
  constructor(private readonly req: Request) {}

  get(name: string) {
    const value = this.req.cookies?.[name];
    if (value === undefined) {
      return undefined;
    }
    return { value };
  }
}

class HeaderAdapter {
  constructor(private readonly req: Request) {}

  get(name: string) {
    const header = this.req.get(name);
    return header ?? undefined;
  }
}

export class NextRequest {
  private readonly req: Request;
  readonly url: string;
  readonly cookies: CookieAdapter;
  readonly headers: HeaderAdapter;

  constructor(req: Request) {
    this.req = req;
    const proto = req.protocol;
    const host = req.get('host');
    this.url = `${proto}://${host}${req.originalUrl}`;
    this.cookies = new CookieAdapter(req);
    this.headers = new HeaderAdapter(req);
  }

  get nextUrl() {
    return new URL(this.url);
  }

  async json() {
    return this.req.body;
  }

  async text() {
    if (typeof this.req.body === 'string') {
      return this.req.body;
    }
    return JSON.stringify(this.req.body);
  }
}

export type NextRouteHandler<Context = unknown> = (
  req: NextRequest,
  context: Context,
) => Promise<NextResponse> | NextResponse;

export function adaptRoute<Context = unknown>(
  handler: NextRouteHandler<Context>,
  paramMapper?: (req: Request) => Record<string, string>,
) {
  return async (req: Request, res: Response) => {
    try {
      const nextReq = new NextRequest(req);
      const context = (paramMapper
        ? { params: Promise.resolve(paramMapper(req)) }
        : undefined) as Context;
      const response = await handler(nextReq, context);
      response.apply(res);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Handler execution failed', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
