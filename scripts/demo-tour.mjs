// The README demo: the tutorial's broken wire, then Strategy plugged into level 1. Recorded by record-demo.mjs.
export const launchOptions = {};

export async function prepare(page) {
  await page.addInitScript(() => localStorage.setItem('pattern-circuit:locale', 'en'));
}

export default async function tour(page) {
  const pause = (ms) => page.waitForTimeout(ms);
  const play = () => page.getByRole('toolbar', { name: 'Playback' }).getByRole('button', { name: 'Play' }).click();
  const until = (text) => page.getByText(text).first().waitFor({ timeout: 60_000 });

  await pause(1500);
  await play();
  await until('Something went wrong');
  await pause(1800);
  await page.getByRole('button', { name: /without dragging/ }).click();
  await until('Level complete');
  await pause(2000);
  await page.getByRole('button', { name: 'Next level →' }).click();
  await pause(1800);

  await play();
  await until('Problem found');
  await pause(1800);
  await page.getByRole('button', { name: /^Strategy, behavioral/ }).focus();
  await page.keyboard.press('Enter');
  await pause(1200);
  await page.getByRole('button', { name: 'It solves the problem' }).click();
  await until('Solves it!');
  await pause(4000);
}
