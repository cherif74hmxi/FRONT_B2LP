import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://monblog.cherifhammani.fr/api";

function getApiOrigin() {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return "https://monblog.cherifhammani.fr";
  }
}

const isDev = process.env.NODE_ENV !== "production";
const devConnectSources = isDev
  ? " http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*"
  : "";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `connect-src 'self' ${getApiOrigin()}${devConnectSources}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const noStoreHeaders = [
  { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/login",
        headers: noStoreHeaders,
      },
      {
        source: "/register",
        headers: noStoreHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
