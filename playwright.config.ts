import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./e2e/tests",
  timeout: 30000,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",

  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev:test",
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "test",
      DOTENV_CONFIG_PATH: ".env.e2e",
    },
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    browserName: "chromium",
  },
};

export default config;
