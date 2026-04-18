import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function shouldRedirectRootToWelcome(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }
  return pathname === "/en" || pathname === "/en/";
}

function welcomePathFor(pathname: string): string {
  if (pathname.startsWith("/en")) {
    return "/en/bienvenida";
  }
  return "/bienvenida";
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldRedirectRootToWelcome(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = welcomePathFor(pathname);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
