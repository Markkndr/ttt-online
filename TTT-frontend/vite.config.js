import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "http://localhost:8080";
  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },

        "/user": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    define: {
      global: "window",
    },
  });
};
