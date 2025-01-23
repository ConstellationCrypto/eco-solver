export const PROOF_STORAGE = 0
export const PROOF_HYPERLANE = 1
export const PROOF_METALAYER = 2

export type ProofType = typeof PROOF_STORAGE | typeof PROOF_HYPERLANE | typeof PROOF_METALAYER

export const Proofs: Record<string, ProofType> = {
  Storage: PROOF_STORAGE,
  Hyperlane: PROOF_HYPERLANE,
  Metalayer: PROOF_METALAYER,
}
