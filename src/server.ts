import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} [${env.NODE_ENV}]`);
});

const handleshutdown = (signal: string) => {
  console.log(`\nReceived signal ${signal}. Gracefully shutdown server...`);

  server.close(async () => {
    try {
      console.log("Server closed successfully");
      process.exit(0);
    } catch (err) {
      console.error("Error while shutting down server", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forcefully shutting down due to timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGINT", () => handleshutdown("SIGINT"));
process.on("SIGTERM", () => handleshutdown("SIGTERM"));
