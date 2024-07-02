import { expect, Locator } from '@playwright/test';

export async function hasMargin(locator: Locator) {
  return expect(locator).toHaveCSS('margin', /^[^0]+/);
}

export async function hasNoMargin(locator: Locator) {
  return expect(locator).toHaveCSS('margin', '0px');
}

const tailwindTransparent = 'rgba(0, 0, 0, 0)';

export async function transparentBg(locator: Locator) {
  return expect(locator).toHaveCSS('background-color', tailwindTransparent);
}

export async function coloredBg(locator: Locator) {
  return expect(locator).toHaveCSS('background-color', new RegExp(`^(?!${tailwindTransparent})`));
}
