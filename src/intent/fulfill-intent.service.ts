import { Injectable, Logger } from '@nestjs/common'
import {
  ContractFunctionArgs,
  ContractFunctionName,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  Hex,
  pad,
  zeroAddress,
} from 'viem'
import {
  IntentProcessData,
  TransactionTargetData,
  UtilsIntentService,
} from './utils-intent.service'
import { getERC20Selector } from '../contracts'
import { EcoError } from '../common/errors/eco-error'
import { EcoLogMessage } from '../common/logging/eco-log-message'
import { Solver } from '../eco-configs/eco-config.types'
import { IntentSourceModel } from './schemas/intent-source.schema'
import { EcoConfigService } from '../eco-configs/eco-config.service'
import { ProofService } from '../prover/proof.service'
import { ExecuteSmartWalletArg } from '../transaction/smart-wallets/smart-wallet.types'
import { KernelAccountClientService } from '../transaction/smart-wallets/kernel/kernel-account-client.service'
//import { InboxAbi } from './inbox-abi' //'@eco-foundation/routes-ts'
import { getTransactionTargetData } from '@/intent/utils'
import { FeeService } from '@/fee/fee.service'
import { IntentDataModel } from '@/intent/schemas/intent-data.schema'

let InboxAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_isSolvingPublic',
        type: 'bool',
      },
      {
        internalType: 'address[]',
        name: '_solvers',
        type: 'address[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'AddressEmptyCode',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AddressInsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CallToMailbox',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedInnerCall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_requiredFee',
        type: 'uint256',
      },
    ],
    name: 'InsufficientFee',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
    ],
    name: 'IntentAlreadyFulfilled',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_addr',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_returnData',
        type: 'bytes',
      },
    ],
    name: 'IntentCallFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'IntentExpired',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
    ],
    name: 'IntentNotFulfilled',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_expectedHash',
        type: 'bytes32',
      },
    ],
    name: 'InvalidHash',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_inbox',
        type: 'address',
      },
    ],
    name: 'InvalidInbox',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NativeTransferFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_solver',
        type: 'address',
      },
    ],
    name: 'UnauthorizedSolveAttempt',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnauthorizedTransferNative',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroClaimant',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_prover',
        type: 'address',
      },
    ],
    name: 'AddToBatch',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32[]',
        name: '_hashes',
        type: 'bytes32[]',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
    ],
    name: 'BatchSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
    ],
    name: 'Fulfillment',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
    ],
    name: 'HyperInstantFulfillment',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_mailbox',
        type: 'address',
      },
    ],
    name: 'MailboxSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
    ],
    name: 'MetalayerInstantFulfillment',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_router',
        type: 'address',
      },
    ],
    name: 'RouterSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_solver',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bool',
        name: '_canSolve',
        type: 'bool',
      },
    ],
    name: 'SolverWhitelistChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'SolvingIsPublic',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
    ],
    name: 'ToBeProven',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_solver',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_canSolve',
        type: 'bool',
      },
    ],
    name: 'changeSolverWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_prover',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: '_messageBody',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: '_metadata',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_postDispatchHook',
        type: 'address',
      },
    ],
    name: 'fetchFee',
    outputs: [
      {
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'salt',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'source',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destination',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'inbox',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
            ],
            internalType: 'struct TokenAmount[]',
            name: 'tokens',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
            ],
            internalType: 'struct Call[]',
            name: 'calls',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Route',
        name: '_route',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_rewardHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_expectedHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_prover',
        type: 'address',
      },
    ],
    name: 'fulfillHyperBatched',
    outputs: [
      {
        internalType: 'bytes[]',
        name: '',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'salt',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'source',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destination',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'inbox',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
            ],
            internalType: 'struct TokenAmount[]',
            name: 'tokens',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
            ],
            internalType: 'struct Call[]',
            name: 'calls',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Route',
        name: '_route',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_rewardHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_expectedHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_prover',
        type: 'address',
      },
    ],
    name: 'fulfillHyperInstant',
    outputs: [
      {
        internalType: 'bytes[]',
        name: '',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'salt',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'source',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destination',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'inbox',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
            ],
            internalType: 'struct TokenAmount[]',
            name: 'tokens',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
            ],
            internalType: 'struct Call[]',
            name: 'calls',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Route',
        name: '_route',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_rewardHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_expectedHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_prover',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_metadata',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_postDispatchHook',
        type: 'address',
      },
    ],
    name: 'fulfillHyperInstantWithRelayer',
    outputs: [
      {
        internalType: 'bytes[]',
        name: '',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'salt',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'source',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destination',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'inbox',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
            ],
            internalType: 'struct TokenAmount[]',
            name: 'tokens',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
            ],
            internalType: 'struct Call[]',
            name: 'calls',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Route',
        name: '_route',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_rewardHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_expectedHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_prover',
        type: 'address',
      },
    ],
    name: 'fulfillMetalayerInstant',
    outputs: [
      {
        internalType: 'bytes[]',
        name: '',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'salt',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'source',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destination',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'inbox',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
            ],
            internalType: 'struct TokenAmount[]',
            name: 'tokens',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
            ],
            internalType: 'struct Call[]',
            name: 'calls',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Route',
        name: '_route',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_rewardHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_claimant',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_expectedHash',
        type: 'bytes32',
      },
    ],
    name: 'fulfillStorage',
    outputs: [
      {
        internalType: 'bytes[]',
        name: '',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'fulfilled',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isSolvingPublic',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mailbox',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'makeSolvingPublic',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'router',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_prover',
        type: 'address',
      },
      {
        internalType: 'bytes32[]',
        name: '_intentHashes',
        type: 'bytes32[]',
      },
    ],
    name: 'sendBatch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_sourceChainID',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_prover',
        type: 'address',
      },
      {
        internalType: 'bytes32[]',
        name: '_intentHashes',
        type: 'bytes32[]',
      },
      {
        internalType: 'bytes',
        name: '_metadata',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_postDispatchHook',
        type: 'address',
      },
    ],
    name: 'sendBatchWithRelayer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_mailbox',
        type: 'address',
      },
    ],
    name: 'setMailbox',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_router',
        type: 'address',
      },
    ],
    name: 'setRouter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'solverWhitelist',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
]

// TODO: Remove this once the updated routes-ts package is published
type FulfillmentMethod = ContractFunctionName<typeof InboxAbi> | 'fulfillMetalayerInstant'

/**
 * This class fulfills an intent by creating the transactions for the intent targets and the fulfill intent transaction.
 */
@Injectable()
export class FulfillIntentService {
  private logger = new Logger(FulfillIntentService.name)

  constructor(
    private readonly kernelAccountClientService: KernelAccountClientService,
    private readonly proofService: ProofService,
    private readonly feeService: FeeService,
    private readonly utilsIntentService: UtilsIntentService,
    private readonly ecoConfigService: EcoConfigService,
  ) {}

  /**
   * Executes the fulfill intent process for an intent. It creates the transaction for fulfillment, and posts it
   * to the chain. It then updates the db model of the intent with the status and receipt.
   *
   * @param intentHash the intent hash to fulfill
   * @returns
   */
  async executeFulfillIntent(intentHash: Hex) {
    const data = await this.utilsIntentService.getIntentProcessData(intentHash)
    const { model, solver, err } = data ?? {}
    if (!data || !model || !solver) {
      if (err) {
        throw err
      }
      return
    }
    // If the intent is already solved, return
    // Could happen if redis has pending job while this is still executing
    if (model.status === 'SOLVED') {
      return
    }

    const kernelAccountClient = await this.kernelAccountClientService.getClient(solver.chainID)

    // Create transactions for intent targets
    const targetSolveTxs = this.getTransactionsForTargets(data)

    // Create fulfill tx
    const fulfillTx = await this.getFulfillIntentTx(solver.inboxAddress, model)

    // Combine all transactions
    const transactions = [...targetSolveTxs, fulfillTx]

    this.logger.debug(
      EcoLogMessage.fromDefault({
        message: `Fulfilling ${this.getFulfillment()} transaction`,
        properties: {
          transactions,
        },
      }),
    )

    try {
      await this.finalFeasibilityCheck(model.intent)

      const transactionHash = await kernelAccountClient.execute(transactions)

      const receipt = await kernelAccountClient.waitForTransactionReceipt({ hash: transactionHash })

      // set the status and receipt for the model
      model.receipt = receipt as any
      if (receipt.status === 'reverted') {
        throw EcoError.FulfillIntentRevertError(receipt)
      }
      model.status = 'SOLVED'

      this.logger.debug(
        EcoLogMessage.fromDefault({
          message: `Fulfilled transactionHash ${receipt.transactionHash}`,
          properties: {
            userOPHash: receipt,
            destinationChainID: model.intent.route.destination,
            sourceChainID: model.event.sourceChainID,
          },
        }),
      )
    } catch (e) {
      model.status = 'FAILED'
      model.receipt = model.receipt ? { previous: model.receipt, current: e } : e

      this.logger.error(
        EcoLogMessage.withError({
          message: `fulfillIntent: Invalid transaction`,
          error: EcoError.FulfillIntentBatchError,
          properties: {
            model: model,
            flatExecuteData: transactions,
            errorPassed: e,
          },
        }),
      )

      // Throw error to retry job
      throw e
    } finally {
      // Update the db model
      await this.utilsIntentService.updateIntentModel(model)
    }
  }

  /**
   * Checks that the intent is feasible for the fulfillment. This
   * could occur due to changes to the fees/limits of the intent. A failed
   * intent might retry later when its no longer profitable, etc.
   * Throws an error if the intent is not feasible.
   * @param intent the intent to check
   */
  async finalFeasibilityCheck(intent: IntentDataModel) {
    const { error } = await this.feeService.isRouteFeasible(intent)
    if (error) {
      throw error
    }
  }

  /**
   * Checks if the transaction is feasible for an erc20 token transfer.
   *
   * @param tt the transaction target data
   * @param solver the target solver
   * @param target the target ERC20 address
   * @returns
   */
  handleErc20(tt: TransactionTargetData, solver: Solver, target: Hex) {
    switch (tt.selector) {
      case getERC20Selector('transfer'):
        const dstAmount = tt.decodedFunctionData.args?.[1] as bigint
        // Approve the inbox to spend the amount, inbox contract pulls the funds
        // then does the transfer call for the target
        const transferFunctionData = encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [solver.inboxAddress, dstAmount], //spender, amount
        })

        return [{ to: target, data: transferFunctionData }]
      default:
        return []
    }
  }

  /**
   * Returns the transactions for the intent targets
   * @param intentProcessData
   * @private
   */
  private getTransactionsForTargets(intentProcessData: IntentProcessData) {
    const { model, solver } = intentProcessData
    if (!model || !solver) {
      return []
    }

    // Create transactions for intent targets
    return model.intent.route.calls.flatMap((call) => {
      const tt = getTransactionTargetData(solver, call)
      if (tt === null) {
        this.logger.error(
          EcoLogMessage.withError({
            message: `fulfillIntent: Invalid transaction data`,
            error: EcoError.FulfillIntentNoTransactionError,
            properties: {
              model: model,
            },
          }),
        )
        return []
      }

      switch (tt.targetConfig.contractType) {
        case 'erc20':
          return this.handleErc20(tt, solver, call.target)
        case 'erc721':
        case 'erc1155':
        default:
          return []
      }
    })
  }

  /**
   * Returns the fulfill intent data
   * @param inboxAddress
   * @param model
   * @private
   */
  private async getFulfillIntentTx(
    inboxAddress: Hex,
    model: IntentSourceModel,
  ): Promise<ExecuteSmartWalletArg> {
    /*
        function fulfillMetalayerInstant(
        Route calldata _route,
        bytes32 _rewardHash,
        address _claimant,
        bytes32 _expectedHash,
        address _prover
        */
    console.log('in fulfill intent')
    const claimant = this.ecoConfigService.getEth().claimant
    const isHyperlane = this.proofService.isHyperlaneProver(model.intent.reward.prover)
    const isMetalayer = this.proofService.isMetalayerProver(model.intent.reward.prover)
    const functionName: FulfillmentMethod = this.proofService.isStorageProver(
      model.intent.reward.prover,
    )
      ? 'fulfillStorage'
      : isMetalayer
        ? 'fulfillMetalayerInstant'
        : this.getFulfillment()

    const args = [
      model.intent.route,
      // @ts-expect-error we dynamically set the args
      model.intent.reward.getHash(),
      claimant,
      // @ts-expect-error we dynamically set the args
      model.intent.getHash().intentHash,
    ]

    if (isHyperlane) {
      args.push(model.intent.reward.prover)
      if (functionName === 'fulfillHyperInstantWithRelayer') {
        args.push('0x0')
        args.push(zeroAddress)
      }
    } else if (isMetalayer) {
      args.push(model.intent.reward.prover)
      //args.push([]) // Empty reads array for now - can be enhanced later if needed
    }
    let fee = 0n
    if (isHyperlane && functionName === 'fulfillHyperInstantWithRelayer') {
      fee = BigInt((await this.getHyperlaneFee(inboxAddress, model)) || '0x0')
    }
    // TODO: Add Metalayer fee support once available
    // if (isMetalayer) {
    //   fee = await this.getMetalayerFee(solverAddress, model)
    // }

    console.log(args)
    console.log(functionName)
    console.log(typeof InboxAbi)
    //console.log(InboxAbi.length)
    console.log(InboxAbi)
    const fulfillIntentData = encodeFunctionData({
      abi: InboxAbi,
      // // @ts-expect-error temporary hack to amend the upstream types - can be removed once the updated routes-ts package is published
      functionName,
      // // @ts-expect-error we dynamically set the args
      args,
    })
    console.log('successfully generated fulfill intent data')

    return {
      to: inboxAddress,
      data: fulfillIntentData,
      // ...(isHyperlane && fee > 0 && { value: fee }),
      value: fee,
    }
  }

  /**
   * Returns the hyperlane fee
   * @param prover
   * @private
   */
  private async getHyperlaneFee(
    inboxAddress: Hex,
    model: IntentSourceModel,
  ): Promise<Hex | undefined> {
    const client = await this.kernelAccountClientService.getClient(
      Number(model.intent.route.destination),
    )
    const encodedMessageBody = encodeAbiParameters(
      [{ type: 'bytes[]' }, { type: 'address[]' }],
      [[model.intent.hash], [this.ecoConfigService.getEth().claimant]],
    )
    const functionName = 'fetchFee'
    const args: ContractFunctionArgs<typeof InboxAbi, 'view', typeof functionName> = [
      model.event.sourceChainID, //_sourceChainID
      pad(model.intent.reward.prover), //_prover
      encodedMessageBody, //_messageBody
      '0x0', //_metadata
      zeroAddress, //_postDispatchHook
    ]
    const callData = encodeFunctionData({
      abi: InboxAbi,
      functionName,
      args,
    })
    const proverData = await client.call({
      to: inboxAddress,
      data: callData,
    })
    return proverData.data
  }

  /**
   * @returns the fulfillment method
   */
  private getFulfillment(): FulfillmentMethod {
    switch (this.ecoConfigService.getFulfill().run) {
      case 'batch':
        return 'fulfillHyperBatched'
      case 'single':
      default:
        return 'fulfillHyperInstantWithRelayer'
    }
  }
}
