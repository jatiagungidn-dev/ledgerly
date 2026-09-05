import path from "path";
import dotenv from "dotenv";
import { afterAll, beforeAll, beforeEach, vi } from "vitest";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
  override: true,
});

const { env } = await import("../config/env");

console.log(
  `[TEST SUITE] Running in ${env.NODE_ENV} mode against DB: ${env.DATABASE_URL}`,
);

beforeAll(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
});

beforeEach(async () => {
  vi.clearAllMocks();
});

afterAll(async () => {
  vi.useRealTimers();
});
