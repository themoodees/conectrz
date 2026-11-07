import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isEnabledLocale, LOCALE_COOKIE, pickFromAcceptLanguage } from "./config";

/** The visitor's language: their saved choice, otherwise what their browser asks for. */
export default getRequestConfig(async () => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isEnabledLocale(saved)
    ? saved
    : pickFromAcceptLanguage((await headers()).get("accept-language"));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
