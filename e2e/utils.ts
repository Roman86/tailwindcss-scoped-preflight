import { Locator, Page, TestInfo } from '@playwright/test';

interface TestScenario {
  url: string;
  rules: Record<string, (locator: Locator) => Promise<void>>;
}

export async function testTheScenario(scenario: TestScenario, page: Page, testInfo?: TestInfo) {
  testInfo?.setTimeout(2000);
  page.setDefaultNavigationTimeout(1000);
  page.setDefaultTimeout(100);

  await page.goto(scenario.url);

  for (const [
    selector,
    validator,
  ] of Object.entries(scenario.rules)) {
    await validator(page.locator(selector));
  }
}
