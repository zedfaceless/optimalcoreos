/**
 * §7.8 / §14.2: `content/proof.ts` is the one place real credibility lives.
 *
 * It is empty because the company is new and §8 forbids inventing testimonials,
 * client logos, counts or review scores. `<ProofSection />` renders nothing while
 * this array is empty, so adding the first real, permissioned quote is a data
 * change and not a layout change.
 */
export type Proof = {
  quote: string;
  attribution: string;
  /** Written permission on file, with the date it was given. */
  permissionOn: string;
};

export const proof: Proof[] = [];

export function hasProof(): boolean {
  return proof.length > 0;
}
