import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app";

describe("GET /health", () => {
  it("should return 200 when the database is connected", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "success",
      service: "Ledgerly",
      database: "connected",
    });
    expect(response.body.timestamp).toBeDefined();
  });
});
