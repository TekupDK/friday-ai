import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  const isProduction = process.env.NODE_ENV === "production";
  let isSecure = isSecureRequest(req);

  // If we're on a local host or IP we must *not* mark cookie as secure, otherwise
  // the browser will refuse to set it over HTTP.
  const hostname = req.hostname || "";
  if (LOCAL_HOSTS.has(hostname) || isIpAddress(hostname)) {
    isSecure = false;
  }

  // ✅ SECURITY FIX: Enforce HTTPS in production
  if (isProduction && !isSecure) {
    throw new Error("HTTPS required in production for secure cookies");
  }

  // ✅ SECURITY FIX: Use "strict" for better CSRF protection in production
  // Note: "strict" blocks all cross-site requests. If you need cross-site functionality,
  // consider "lax" instead (allows top-level navigation but blocks POST requests from other sites)
  const sameSite = isProduction && isSecure ? "strict" : "lax";

  return {
    httpOnly: true,
    path: "/",
    domain: undefined,
    sameSite,
    secure: isSecure || isProduction, // ✅ SECURITY FIX: Always secure in production
  };
}
