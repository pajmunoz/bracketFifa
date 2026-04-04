import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  defaultLocale: "es",
  localePrefix: "as-needed",
  locales: ["es", "en"],
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
