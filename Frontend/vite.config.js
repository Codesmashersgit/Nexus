// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   base: '/',
//   plugins: [react()],
//   define: {
//     global: 'window'
//   }
// })


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 0.0.0.0 pe listen kare
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".trycloudflare.com" // <-- Ye line important hai
    ],
  },
});
