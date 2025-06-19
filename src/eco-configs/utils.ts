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
  return false
  // return (
  //   getNodeEnv() === NodeEnv.preproduction ||
  //   getNodeEnv() === NodeEnv.development ||
  //   getNodeEnv() === NodeEnv.staging
  // )
}

/**
 * Gets the chain configuration for the given chain id from the
 * eco protocol addresses library
 * @param chainID the chain id
 * @returns
 */
export function getChainConfig(chainID: number | string): EcoChainConfig {
  const id = isPreEnv() ? `${chainID}-${ChainPrefix}` : chainID.toString()
  return getCalderaChainConfig()
  // const config = EcoProtocolAddresses[id]
  // if (config === undefined) {
  //   throw EcoError.ChainConfigNotFound(id)
  // } else {
  //   return CALDERA_CHAIN_CONFIG
  // }
}

function getCalderaChainConfig(): EcoChainConfig {
  const env = getNodeEnv()
  if (env === NodeEnv.production) {
    return {
      IntentSource: '0x17683C781adb1CD185B08041dA61b02a2DF65538',
      Inbox: '0xE02A17467Df7b1950C8849dA226844e5d3Db781a',
      HyperProver: '0x0000000000000000000000000000000000000000',
      MetaProver: '0x3d529eFAEDb3B999A404c1B8543441aE616cB914',
    }
  } else {
    return {
      IntentSource: '0x17683C781adb1CD185B08041dA61b02a2DF65538',
      Inbox: '0xE02A17467Df7b1950C8849dA226844e5d3Db781a',
      HyperProver: '0x0000000000000000000000000000000000000000',
      MetaProver: '0xb130cd8e1cb3DA9f8BC583e2A7Bb603c11b61d5A',
    }
  }
}
