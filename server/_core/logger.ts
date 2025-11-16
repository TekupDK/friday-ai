import path from "path";
import { fileURLToPath } from "url";

import pino from "pino";

import { redact } from "./redact";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV !== "production";

// Determine log file path
const logDir = path.join(__dirname, "../../logs");
const logFile = path.join(
  logDir,
  isDevelopment ? "dev-server.log" : "prod-server.log"
);

// ✅ SECURITY FIX: Create redacting serializers for pino
const redactingSerializers = {
  req: (req: any) => {
    const redacted = redact({
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      params: req.params,
    });
    return redacted;
  },
  res: (res: any) => {
    const redacted = redact({
      statusCode: res.statusCode,
      headers: res.headers,
    });
    return redacted;
  },
  err: (err: any) => {
    return redact(err);
  },
  // Redact any object passed to logger
  "*": (obj: any) => redact(obj),
};

export const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: undefined, // omit pid, hostname to keep logs cleaner
  // ✅ SECURITY FIX: Add redacting serializers to sanitize sensitive data
  serializers: redactingSerializers,
  transport: {
    targets: [
      // Console output with pretty formatting in development
      {
        target: "pino-pretty",
        level: isDevelopment ? "debug" : "info",
        options: {
          destination: 1, // stdout
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false,
        },
      },
      // File output (always JSON format for parsing)
      {
        target: "pino/file",
        level: isDevelopment ? "debug" : "info",
        options: {
          destination: logFile,
          mkdir: true,
        },
      },
    ],
  },
});
