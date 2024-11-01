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

export async function hasHeight(locator: Locator) {
  return expect(locator).toHaveCSS('height', /^[^0]+/);
}

export async function hasNoHeight(locator: Locator) {
  return expect(locator).toHaveCSS('height', '0px');
}
