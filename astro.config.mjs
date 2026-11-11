// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import siteContent from "./content/site.json" with { type: "json" };

const fileEnv = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
process.env.CONTENT_API ??= fileEnv.CONTENT_API;

const CONTENT_UPDATED_AT = new Date(siteContent.updatedAt);

const CHANGEFREQ = {
  "": "weekly",
  "/schedule": "weekly",
  "/register": "monthly",
  "/courses": "monthly",
  "/practice": "monthly",
  "/library": "monthly",
  "/trial": "monthly",
};

export default defineConfig({
  site: "https://trungtamhoavansaigonhsk.edu.vn",

  output: "server",
  adapter: node({ mode: "standalone" }),

  integrations: [
    sitemap({
      changefreq: "monthly",
      lastmod: CONTENT_UPDATED_AT,
      filter: (page) => !page.includes("/login") && !page.includes("/hero-v3"),
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, "");
        if (path === "") item.priority = 1;
        else if (["/courses", "/register", "/schedule", "/about"].includes(path))
          item.priority = 0.9;
        else if (path.split("/").length === 2) item.priority = 0.8;
        else item.priority = 0.6;

        const changefreq = CHANGEFREQ[path];
        if (changefreq) item.changefreq = changefreq;

        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
