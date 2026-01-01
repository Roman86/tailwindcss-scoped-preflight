import { Locator, Page, TestInfo } from '@playwright/test';

interface TestScenario {
  url: string;
  rules: Record<string, (locator: Locator) => Promise<void>>;
}

export async function testTheScenario(scenario: TestScenario, page: Page, testInfo?: TestInfo) {
  testInfo?.setTimeout(10000);
  page.setDefaultNavigationTimeout(5000);
  page.setDefaultTimeout(1000);

  await page.goto(scenario.url);

  for (const [
    selector,
    validator,
  ] of Object.entries(scenario.rules)) {
    await validator(page.locator(selector));
  }
}
