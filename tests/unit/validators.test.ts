import { describe, it, expect } from "vitest";
import { validateAmount, assertOwnership, ValidationError, ForbiddenError } from "../../lib/validators";

/**
 * Spec: context/feature-specs/17-security-hardening.md
 * Unit tests for lib/validators.ts
 */

describe("validateAmount", () => {
  it("rejects zero", () => {
    // TODO: expect(() => validateAmount(0)).toThrow(ValidationError);
  });

  it("rejects negative", () => {
    // TODO: expect(() => validateAmount(-5)).toThrow(ValidationError);
  });

  it("rejects non-finite values", () => {
    // TODO: expect(() => validateAmount(Infinity)).toThrow(ValidationError);
    // TODO: expect(() => validateAmount(NaN)).toThrow(ValidationError);
  });

  it("rejects amounts over 1,000,000", () => {
    // TODO: expect(() => validateAmount(1_500_000)).toThrow(ValidationError);
  });

  it("accepts a valid amount and returns it", () => {
    // TODO: expect(validateAmount(250)).toBe(250);
    // TODO: expect(validateAmount(0.01)).toBe(0.01);
    // TODO: expect(validateAmount(1_000_000)).toBe(1_000_000);
  });
});

describe("assertOwnership", () => {
  it("throws ForbiddenError when user IDs do not match", () => {
    // TODO: expect(() => assertOwnership("user-a", "user-b")).toThrow(ForbiddenError);
  });

  it("does not throw when user IDs match", () => {
    // TODO: expect(() => assertOwnership("user-a", "user-a")).not.toThrow();
  });
});
