import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "blueharbor-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
