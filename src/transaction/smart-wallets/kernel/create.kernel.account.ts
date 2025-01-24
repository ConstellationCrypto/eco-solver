import {
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  decodeFunctionResult,
  encodeFunctionData,
  Hex,
  parseAbi,
  publicActions,
  zeroAddress,
} from 'viem'
import { SimpleAccountClientConfig } from './kernel-account.config'
import {
  DeployFactoryArgs,
  SimpleAccountActions,
  SimpleAccountClient,
} from './kernel-account.client'
import { KernelVersion, toEcdsaKernelSmartAccount } from 'permissionless/accounts'

export type entryPointV_0_7 = '0.7'

export async function createSimpleAccountClient<
  entryPointVersion extends '0.6' | '0.7' = entryPointV_0_7,
>(
  parameters: SimpleAccountClientConfig<entryPointVersion, KernelVersion<entryPointVersion>>,
): Promise<{ client: SimpleAccountClient<entryPointVersion>; args: DeployFactoryArgs }> {
  const { key = 'simpleAccountClient', name = 'Kernel Account Client', transport } = parameters
  const { account } = parameters

  let client = createWalletClient({
    ...parameters,
    account,
    key,
    name,
    transport,
  }) as SimpleAccountClient<entryPointVersion>

  const simpleAccount = await toEcdsaKernelSmartAccount<
    entryPointVersion,
    KernelVersion<entryPointVersion>
  >({
    ...parameters,
    client,
  })

  if (simpleAccount.address === zeroAddress) {
    const { factoryData: factoryStakerData } = await simpleAccount.getFactoryArgs()

    if (factoryStakerData) {
      const { args } = decodeFunctionData({
        abi: parseAbi([
          'function deployWithFactory(address factory, bytes calldata createData, bytes32 salt) external payable returns (address)',
        ]),
        data: factoryStakerData,
      })

      const [factory, createdData, salt] = args

      const publicClient = createPublicClient({
        ...parameters,
      })

      const KernelFactoryABI = parseAbi([
        'function getAddress(bytes calldata data, bytes32 salt) view returns (address)',
      ])

      const { data } = await publicClient.call({
        to: factory,
        data: encodeFunctionData({
          functionName: 'getAddress',
          abi: KernelFactoryABI,
          args: [createdData, salt],
        }),
      })

      const address = decodeFunctionResult({
        abi: KernelFactoryABI,
        functionName: 'getAddress',
        data: data!,
      })

      simpleAccount.address = address as Hex
    }
  }

  client.simpleAccount = simpleAccount
  client.simpleAccountAddress = simpleAccount.address
  client = client.extend(SimpleAccountActions).extend(publicActions) as any

  //conditionally deploys kernel account if it doesn't exist
  const args = await client.deploySimpleAccount()
  return { client, args }
}
