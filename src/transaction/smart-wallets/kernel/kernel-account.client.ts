import {
  Account,
  Chain,
  createPublicClient,
  Hex,
  http,
  Prettify,
  RpcSchema,
  Transport,
  WalletRpcSchema,
} from 'viem'
import { ExecuteSmartWalletArgs, SmartWalletClient } from '../smart-wallet.types'
import { ToEcdsaKernelSmartAccountReturnType } from 'permissionless/accounts'
import { KernelWalletActions } from './kernel-account.config'
import { encodeKernelExecuteCallData } from './actions/encodeData.kernel'

export type DeployFactoryArgs = {
  factory?: Hex | undefined
  factoryData?: Hex | undefined
  deployReceipt?: Hex | undefined
  chainID?: number
}

export type SimpleAccountClient<
  entryPointVersion extends '0.6' | '0.7',
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  SmartWalletClient<
    transport,
    chain,
    account,
    rpcSchema extends RpcSchema ? [...WalletRpcSchema, ...rpcSchema] : WalletRpcSchema
  > & {
    simpleAccount: ToEcdsaKernelSmartAccountReturnType<entryPointVersion>
    simpleAccountAddress: Hex
  }
>

export function SimpleAccountActions<
  entryPointVersion extends '0.6' | '0.7',
  transport extends Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(client: SimpleAccountClient<entryPointVersion, transport, chain, account>): KernelWalletActions {
  return {
    execute: (args) => execute(client, args),
    deploySimpleAccount: () => deploySimpleAccount(client),
  }
}

async function execute<
  entryPointVersion extends '0.6' | '0.7',
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: SimpleAccountClient<entryPointVersion, Transport, chain, account>,
  transactions: ExecuteSmartWalletArgs,
): Promise<Hex> {
  const calls = transactions.map((tx) => ({ to: tx.to, data: tx.data, value: tx.value }))
  const kernelVersion = client.simpleAccount.entryPoint.version == '0.6' ? '0.2.4' : '0.3.1'
  const data = encodeKernelExecuteCallData({ calls, kernelVersion })
  return client.sendTransaction({
    data: data,
    kzg: undefined,
    to: client.simpleAccount.address,
    chain: client.chain as Chain,
    account: client.account as Account,
  })
}

async function deploySimpleAccount<
  entryPointVersion extends '0.6' | '0.7',
  transport extends Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: SimpleAccountClient<entryPointVersion, transport, chain, account>,
): Promise<DeployFactoryArgs> {
  const args: DeployFactoryArgs = {}

  const publicClient = createPublicClient({
    chain: client.chain,
    transport: http(),
  })
  const code = await publicClient.getCode({ address: client.simpleAccount.address })

  if (!code) {
    const fa = await client.simpleAccount.getFactoryArgs()
    args.factory = fa.factory
    args.factoryData = fa.factoryData
    args.chainID = client.chain?.id
    args.deployReceipt = await client.sendTransaction({
      data: args.factoryData,
      kzg: undefined,
      to: args.factory,
      chain: client.chain as Chain,
      account: client.account as Account,
    })
  }
  return args
}
