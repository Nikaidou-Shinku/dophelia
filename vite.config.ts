import { resolve } from "node:path";
import child_process from "node:child_process";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [tailwindcss(), solid()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:9961",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    GIT_HASH: JSON.stringify(
      child_process.execSync("git rev-parse HEAD").toString(),
    ),
  },
});
