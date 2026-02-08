import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/dashboard/",
  plugins: [
    tailwindcss({
      configPath: "./tailwind.config.ts",
    }),
    vue(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "/src/apps": path.resolve(__dirname, "../../"),
    },
  },
  server: {
    port: 5173,
    middlewareMode: false,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("[Proxy] API Request:", req.method, req.url);
          });
        },
      },
      "/method": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/method/, "/method"),
      },
      "/assets": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/upload_file": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/api/resource": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:9000",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/socket.io/, "/socket.io"),
      },
      "/src/apps": {
        target: "http://localhost:5173",
        bypass: (req) => {
          const match = req?.url?.match(/^\/src\/apps\/([^\/]+)\//);
          if (match) {
            const filePath = path.resolve(
              __dirname,
              `../../${req?.url?.substring(10)}`,
            );
            return filePath;
          }
          return null;
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["@vite/client", "@vite/env"],
    include: ["socket.io-client"],
  },
  build: {
    outDir: path.resolve(__dirname, "../../desktop/desktop/public/dashboard"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("node_modules/vue") ||
            id.includes("node_modules/vue-router") ||
            id.includes("node_modules/pinia")
          ) {
            return "vendor-vue";
          }

          if (id.includes("node_modules/socket.io-client")) {
            return "vendor-socketio";
          }

          const parts = id.split("node_modules/")[1]?.split("/") || [];
          const pkg = parts[0]?.startsWith("@")
            ? `${parts[0]}/${parts[1]}`
            : parts[0];
          return pkg ? `vendor-${pkg}` : "vendor";
        },
      },
    },
  },
});
