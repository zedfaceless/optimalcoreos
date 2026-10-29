/**
 * Whether `<Analytics />` and `<SpeedInsights />` mount (PRD §14.3's optional toggle).
 *
 * On by default, because both packages are cookieless and inert outside Vercel: a deploy
 * that never looks at the variable loses nothing by carrying two no-op script tags, and a
 * deploy that turns it off gets the switch it was promised. `off`, `false`, `0` and `no`
 * turn it off; anything else — including an empty string, a typo, or a value somebody
 * invented — leaves it on, because "off" is the deliberate act and a misspelling is not.
 */
const OFF = new Set(["off", "false", "0", "no"]);

export function vercelAnalyticsEnabled(value: string | undefined = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS): boolean {
  return !OFF.has((value ?? "").trim().toLowerCase());
}
