import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: "file:./test.db",
      TURSO_DATABASE_URL: "file:./test.db",
      TURSO_DATABASE_TOKEN: "test-token",
      NODE_ENV: "test",
      NEXTAUTH_SECRET: "test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "test-key",
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: "test-preset",
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      GOOGLE_CLIENT_ID: "test-client-id",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      AUTH_TOKEN: "test-auth-token",
      IG_USERNAME: "test-ig-user",
      IG_PASSWORD: "test-ig-pass",
      CI: process.env.CI ?? "",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
