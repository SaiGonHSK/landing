import type { MiddlewareHandler } from "astro";

import { refreshContent } from "@/data/refresh";

export const onRequest: MiddlewareHandler = async (context, next) => {
  await refreshContent();

  const response = await next();

  const isHtml = response.headers.get("content-type")?.includes("text/html");
  if (context.request.method === "GET" && isHtml) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    );
  }

  return response;
};
