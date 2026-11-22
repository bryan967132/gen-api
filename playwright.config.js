import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    workers: 1,
    fullyParallel: false,

    reporter: [['list'], ['./tests/reporters/customReporter.js']],

    use: {
        baseURL: 'http://127.0.0.1:5173',
        browserName: 'chromium',
        headless: true,
        screenshot: 'off',
        trace: 'retain-on-failure',
        viewport: {
            width: 2560,
            height: 1440,
        },
    },

    webServer: {
        command: 'pnpm exec vite --host 127.0.0.1 --port 5173 --strictPort',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
    },
});
