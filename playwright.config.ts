import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * LambdaTest Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 * @see https://www.lambdatest.com/support/docs/playwright-testing/
 */

// Determine execution mode based on environment flags
const isLambdaTestMode = process.env.EXECUTION_MODE === 'lambdatest';
const isLocalMode = process.env.EXECUTION_MODE === 'local';

// Load LambdaTest credentials only when in LambdaTest mode
const isLambdaTest = isLambdaTestMode && !!(process.env.LT_USERNAME && process.env.LT_ACCESS_KEY);

// Default to local mode if no execution mode is specified
const shouldRunHeaded = isLocalMode || (!isLambdaTestMode && !process.env.CI);

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 15000,
  },

  // Enable parallel execution for LambdaTest, sequential for local
  fullyParallel: isLambdaTest,
  workers: isLambdaTest ? undefined : 1,

  // Retry configuration
  retries: isLambdaTest ? 1 : 0,

  reporter: [
    ['html'],
    ['list'],
    // Add JUnit reporter for CI/CD integration
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  use: {
    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,

    // Base URL
    baseURL: 'https://www.lambdatest.com',

    // Headed/Headless configuration based on execution mode
    headless: !shouldRunHeaded,

    // Test artifacts - Different settings for local vs cloud
    ...(isLambdaTest ? {
      // LambdaTest handles video/screenshots directly
      screenshot: 'off',
      video: 'off',
      trace: 'off',
    } : {
      // Local settings with full artifacts
      screenshot: 'on',
      video: 'on',
      trace: 'on',
    }),

    // Network and console logs
    ...(isLambdaTest && {
      // LambdaTest specific capabilities
      connectOptions: {
        wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify({
          'LT:Options': {
            platform: 'Windows 10',
            build: 'LambdaTest Playwright Assignment',
            name: 'Selenium Playground Tests',
            user: process.env.LT_USERNAME,
            accessKey: process.env.LT_ACCESS_KEY,
            network: true, // Network logs
            video: true, // Video recording
            screenshot: true, // Screenshots
            console: true, // Console logs
            tunnel: false,
            tunnelName: '',
            geoLocation: 'US',
          }
        }))}`,
      }
    })
  },

  projects: isLambdaTest ? [
    // LambdaTest Cloud - Multiple browser/OS combinations
    {
      name: 'Windows-10-Chrome',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify({
            browserName: 'Chrome',
            browserVersion: 'latest',
            'LT:Options': {
              platform: 'Windows 10',
              build: 'LambdaTest Playwright Assignment',
              name: 'Windows 10 - Chrome Tests',
              user: process.env.LT_USERNAME,
              accessKey: process.env.LT_ACCESS_KEY,
              network: true,
              video: true,
              screenshot: true,
              console: true,
              tunnel: false,
              geoLocation: 'US',
            }
          }))}`,
        }
      }
    },
    {
      name: 'Windows-11-Chrome',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify({
            browserName: 'Chrome',
            browserVersion: 'latest',
            'LT:Options': {
              platform: 'Windows 11',
              build: 'LambdaTest Playwright Assignment',
              name: 'Windows 11 - Chrome Tests',
              user: process.env.LT_USERNAME,
              accessKey: process.env.LT_ACCESS_KEY,
              network: true,
              video: true,
              screenshot: true,
              console: true,
              tunnel: false,
              geoLocation: 'US',
            }
          }))}`,
        }
      }
    }
  ] : [
    // Local execution - responsive to headed/headless setting
    {
      name: 'chromium-local',
      use: {
        ...devices['Desktop Chrome'],
        headless: !shouldRunHeaded,
        viewport: { width: 1280, height: 720 },
        ...(shouldRunHeaded && {
          launchOptions: {
            slowMo: 300, // Slow down for better visibility when headed
          }
        })
      },
    },
  ],
});
