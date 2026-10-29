/**
 * Tiny class-name joiner. There is no `clsx` in the locked stack (§14.1), and the
 * whole need is "drop the falsy parts".
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
