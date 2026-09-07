/** HTTP error with a stable machine-readable code for the client to switch on. */
export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(code: string, message: string, details?: unknown) {
    return new HttpError(400, code, message, details);
  }
  static unauthorized(message = "You need to sign in to do that.", code = "unauthorized") {
    return new HttpError(401, code, message);
  }
  static forbidden(message = "You don't have permission for that.", code = "forbidden") {
    return new HttpError(403, code, message);
  }
  static notFound(message = "That doesn't exist (or was removed).", code = "not_found") {
    return new HttpError(404, code, message);
  }
  static conflict(code: string, message: string) {
    return new HttpError(409, code, message);
  }
  static gone(message = "That item is no longer available.", code = "gone") {
    return new HttpError(410, code, message);
  }
  static unprocessable(code: string, message: string, details?: unknown) {
    return new HttpError(422, code, message, details);
  }
  static tooMany(message = "Slow down — try again shortly.", code = "rate_limited") {
    return new HttpError(429, code, message);
  }
}

/** Wrap async route handlers so thrown errors reach the error middleware (Express 4). */
export function wrap(fn: (req: any, res: any, next: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
}
