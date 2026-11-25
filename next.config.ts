import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const config: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    // Old WordPress addresses that may be bookmarked or indexed by Google.
    return [
      { source: "/wp-admin/:path*", destination: "/en", permanent: false },
      { source: "/wp-login.php", destination: "/en", permanent: false },
      { source: "/about-us", destination: "/en/about", permanent: true },
      { source: "/admissions", destination: "/en/admissions", permanent: true },
      { source: "/contact-us", destination: "/en/contact", permanent: true },
      { source: "/spd-2026", destination: "/spd-2026/index.html", permanent: false },
    ];
  },
};

export default config;
