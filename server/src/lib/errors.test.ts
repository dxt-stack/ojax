import { describe, expect, it } from "vitest";
import { HttpError } from "./errors.js";

describe("HttpError", () => {
  it("carries status + machine code", () => {
    const e = HttpError.unauthorized("Sign in first.", "session_expired");
    expect(e.status).toBe(401);
    expect(e.code).toBe("session_expired");
    expect(e.message).toBe("Sign in first.");
    expect(e).toBeInstanceOf(HttpError);
    expect(e).toBeInstanceOf(Error);
  });

  it("shortcuts common cases", () => {
    expect(HttpError.notFound().status).toBe(404);
    expect(HttpError.conflict("email_taken", "taken").code).toBe("email_taken");
    expect(HttpError.gone().code).toBe("gone");
  });
});
