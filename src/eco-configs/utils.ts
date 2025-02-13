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
      IntentSource: "0xD7f316e387107b90dFBBDCb07bEC7280A729ce88",
      Inbox: "0x04fA0CeB5eaAf33084DDd4A7cda74F01767B4507",
      HyperProver: "0x3e27B444B5E543cbFF449115DE4a36705a891F82",
    };
  } else if (id === "3441006-pre") {
    return {
      IntentSource: "0x7e0400Eb1508f4c8A2C33a46c7Ce308C650ccDe6",
      Inbox: "0xC8CFd1aA8153Ec5F41d8F6FBCf8ec4B1AD8b779c",
      HyperProver: "0x7d89991BFF4B2665f7Ace724789Cf2ACBBF46A39", // this is the metalayerprover: "0xCd906dD3b534a7ab400F510f4F951ca07357a7Bc",
    };
  }
  const config = EcoProtocolAddresses[id]
  if (config === undefined) {
    throw EcoError.ChainConfigNotFound(id)
  }
  return config
}
