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
      IntentSource: "0x587FF7656A0Da8b17Ff861caD7B8DFAB51c113f8",
      Inbox: "0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e",
      HyperProver: "0xEADCeB003Cde57B7F0025baF2A1C29efaB497D53",
      //MetalayerProver: "0xC4d6985b9b333F333F78e4Cae5563BB009595A6C",
    };
  } else if (id === "3441006-pre") {
    return {
      IntentSource: "0x587FF7656A0Da8b17Ff861caD7B8DFAB51c113f8",
      Inbox: "0x578CCAd6a274fDE97c09D439e1E94D4FcE33328e",
      HyperProver: "0x907fE7e7B3a42f6ef447A401224F2927921FEA12", // this is the metalayerprover: "0xCd906dD3b534a7ab400F510f4F951ca07357a7Bc",
      //MetalayerProver: "0xC4d6985b9b333F333F78e4Cae5563BB009595A6C",
    };
  }
  const config = EcoProtocolAddresses[id]
  if (config === undefined) {
    throw EcoError.ChainConfigNotFound(id)
  }
  return config
}
