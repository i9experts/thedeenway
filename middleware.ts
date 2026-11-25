import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n";

function preferredLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get("lang")?.value;
  if (cookie && isLocale(cookie)) return cookie;
  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (locales.some((l) => l === first)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (images, PDFs, the SPD page).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
