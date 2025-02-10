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
      IntentSource: "0xf2d066292Aa5Ab276EB40ac94735DFF9458C30A8",
      Inbox: "0xDE58509Af9CFDDde46cfcb7856D64ebDd6e76Dd4",
      HyperProver: "0x658AFcae7bB1342E4A9C363F86706Fb3B8A703EA",
    };
  } else if (id === "3441006-pre") {
    return {
      IntentSource: "0x7e0400Eb1508f4c8A2C33a46c7Ce308C650ccDe6",
      Inbox: "0xC8CFd1aA8153Ec5F41d8F6FBCf8ec4B1AD8b779c",
      HyperProver: "0xCd906dD3b534a7ab400F510f4F951ca07357a7Bc",
    };
  }
  const config = EcoProtocolAddresses[id]
  if (config === undefined) {
    throw EcoError.ChainConfigNotFound(id)
  }
  return config
}
