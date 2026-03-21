import { defineConfig, devices } from "@playwright/test";

const port = 3205;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm dev --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/dev/lexical-ssr-compare`,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
