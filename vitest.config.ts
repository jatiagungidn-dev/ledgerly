import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: { NODE_ENV: "test" },
    setupFiles: ["./src/tests/setup.ts"],
  },
});
