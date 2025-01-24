import { EcoChainConfig, EcoProtocolAddresses } from '@eco-foundation/routes-ts'
import * as config from 'config'
import { EcoError } from '../common/errors/eco-error'

/**
 * The prefix for non-production deploys on a chain
 */
export const ChainPrefix = 'pre'

export enum NodeEnv {
  production = 'production',
  preproduction = 'preproduction',
  staging = 'staging',
  development = 'development',
}

/**
 * Returns the NodeEnv enum value from the string node env, defaults to Development
 *
 * @param env the string node env
 * @returns
 */
export function getNodeEnv(): NodeEnv {
  const env: string = config.util.getEnv('NODE_ENV')
  const normalizedEnv = env.toLowerCase() as keyof typeof NodeEnv
  return NodeEnv[normalizedEnv] || NodeEnv.development
}

/**
 * @returns true if the node env is preproduction or development
 */
export function isPreEnv(): boolean {
  return getNodeEnv() === NodeEnv.preproduction || getNodeEnv() === NodeEnv.development
}

/**
 * Gets the chain configuration for the given chain id from the
 * eco protocol addresses library
 * @param chainID the chain id
 * @returns
 */
export function getChainConfig(chainID: number | string): EcoChainConfig {
  const id = isPreEnv() ? `${chainID}-${ChainPrefix}` : chainID.toString()
  if (id === "33111-pre") {
    return {
      // Prover: "0xac3f4357d650109a94c4a977f6c327b140cbac37";
      IntentSource: "0x885e2917f4Ab2669D2A87cd8B0EFd4B51BD763d2",
      Inbox: "0x9fb8BB3A79515Ec6E755b833e2c178ed775FD95E",
      HyperProver: "0x436E7056A47AD2F1e2C788a26e6b8350AA4B7302",
    };
  } else if (id === "3441006-pre") {
    return {
      IntentSource: "0x885e2917f4Ab2669D2A87cd8B0EFd4B51BD763d2",
      Inbox: "0x885e2917f4Ab2669D2A87cd8B0EFd4B51BD763d2",
      HyperProver: "0xac3f4357d650109a94c4a977f6c327b140cbac37",
    };
  }
  const config = EcoProtocolAddresses[id]
  if (config === undefined) {
    throw EcoError.ChainConfigNotFound(id)
  }
  return config
}
