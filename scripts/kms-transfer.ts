#!/usr/bin/env tsx

/**
 * KMS-Enabled Kernel Account Transfer Script
 *
 * A script to transfer funds from a kernel account using AWS KMS for signing.
 * Set your KMS key alias and ensure AWS credentials are configured.
 */

import { http, parseEther, encodeFunctionData, erc20Abi, getAddress, Hex } from 'viem'
import { createKernelAccountClient } from '../src/transaction/smart-wallets/kernel/create.kernel.account'
import { entryPoint07Address } from 'viem/account-abstraction'
import { Signer } from '@web3-kms-signer/core'
import { KMSProviderAWS } from '@web3-kms-signer/kms-provider-aws'
import { KMSWallets } from '@web3-kms-signer/kms-wallets'
import { kmsToAccount } from '../src/sign/kms-account/kmsToAccount'

// 🔧 CONFIGURATION - Update these values
const CONFIG = {
  CHAIN_ID: 1,
  RPC_URL: '',
  KMS_KEY_ID: process.env.KMS_KEY_ID || '',
  AWS_REGION: process.env.AWS_REGION || '',

  // Transfer settings
  RECIPIENT: '', // Address to send funds to

  // Choose ONE of these transfer types:
  TRANSFER_TYPE: 'native' as 'native' | 'token',

  // For native transfers:
  ETH_AMOUNT: '0.5', // Amount in native token

  // For ERC20 token transfers:
  TOKEN_ADDRESS: '', // Token address
  TOKEN_AMOUNT: '', // Amount in token's smallest unit
}

// Chain configuration for chain 478
const CUSTOM_CHAIN = {
  id: CONFIG.CHAIN_ID,
  name: 'Ethereum',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [CONFIG.RPC_URL],
    },
  },
}

async function initKMS() {
  // eslint-disable-next-line no-console
  console.log('🔐 Initializing AWS KMS...')

  const provider = new KMSProviderAWS({
    region: CONFIG.AWS_REGION,
  })

  const wallets = new KMSWallets(provider)
  const signer = new Signer(wallets)

  // eslint-disable-next-line no-console
  console.log(`🔑 Using KMS Key: ${CONFIG.KMS_KEY_ID}`)

  // Create KMS account
  const account = await kmsToAccount(signer, wallets, {
    keyID: CONFIG.KMS_KEY_ID,
  })

  const kmsAddress = await wallets.getAddressHex(CONFIG.KMS_KEY_ID)
  // eslint-disable-next-line no-console
  console.log(`🏦 KMS Account Address: ${kmsAddress}`)

  return account
}

async function transferFunds() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting KMS Kernel Account Transfer...')

  // Validate configuration
  if (!CONFIG.KMS_KEY_ID || CONFIG.KMS_KEY_ID === 'alias/your-key-alias') {
    throw new Error('❌ Please set a valid KMS key ID in KMS_KEY_ID environment variable')
  }

  if (!CONFIG.RECIPIENT.startsWith('0x') || CONFIG.RECIPIENT === '0x...') {
    throw new Error('❌ Please set a valid recipient address in CONFIG.RECIPIENT')
  }

  // Initialize KMS and create account
  const account = await initKMS()

  // eslint-disable-next-line no-console
  console.log(`🔗 Connecting to chain ${CONFIG.CHAIN_ID}...`)

  // Create kernel client with KMS account
  const { client } = await createKernelAccountClient({
    account,
    chain: CUSTOM_CHAIN,
    transport: http(CONFIG.RPC_URL),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7' as const,
    },
    owners: [account],
    index: 0n,
  } as any)

  // eslint-disable-next-line no-console
  console.log(`🏦 Kernel Account: ${client.kernelAccountAddress}`)
  // eslint-disable-next-line no-console
  console.log(`📍 Recipient: ${CONFIG.RECIPIENT}`)

  let txHash: Hex

  if (CONFIG.TRANSFER_TYPE === 'native') {
    // Transfer native tokens
    // eslint-disable-next-line no-console
    console.log(`💰 Transferring ${CONFIG.ETH_AMOUNT} native tokens...`)

    txHash = await client.execute([
      {
        to: getAddress(CONFIG.RECIPIENT),
        value: parseEther(CONFIG.ETH_AMOUNT),
      },
    ])
  } else if (CONFIG.TRANSFER_TYPE === 'token') {
    // Transfer ERC20 token
    // eslint-disable-next-line no-console
    console.log(`🪙 Transferring ${CONFIG.TOKEN_AMOUNT} tokens...`)
    // eslint-disable-next-line no-console
    console.log(`📜 Token: ${CONFIG.TOKEN_ADDRESS}`)

    const transferData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [getAddress(CONFIG.RECIPIENT), BigInt(CONFIG.TOKEN_AMOUNT)],
    })

    txHash = await client.execute([
      {
        to: getAddress(CONFIG.TOKEN_ADDRESS),
        data: transferData,
        value: 0n,
      },
    ])
  } else {
    throw new Error('❌ Invalid transfer type. Use "native" or "token".')
  }

  // eslint-disable-next-line no-console
  console.log(`✅ Transfer completed!`)
  // eslint-disable-next-line no-console
  console.log(`📄 Transaction Hash: ${txHash}`)
  // eslint-disable-next-line no-console
  console.log(`🔗 Transaction submitted to chain ${CONFIG.CHAIN_ID}`)

  // Wait for confirmation
  // eslint-disable-next-line no-console
  console.log('⏳ Waiting for confirmation...')
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 3,
  })

  // eslint-disable-next-line no-console
  console.log(`🎉 Confirmed in block: ${receipt.blockNumber}`)
  // eslint-disable-next-line no-console
  console.log(`💰 Gas Used: ${receipt.gasUsed}`)
}

// Function to check balances
async function checkBalance() {
  // eslint-disable-next-line no-console
  console.log('🔍 Checking KMS account balance...')

  const account = await initKMS()

  const { client } = await createKernelAccountClient({
    account,
    chain: CUSTOM_CHAIN,
    transport: http(CONFIG.RPC_URL),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7' as const,
    },
    owners: [account],
    index: 0n,
  } as any)

  const kernelAddress = client.kernelAccountAddress!
  // eslint-disable-next-line no-console
  console.log(`🏦 Kernel Account: ${kernelAddress}`)

  // Get native balance
  const nativeBalance = await client.getBalance({ address: kernelAddress })
  // eslint-disable-next-line no-console
  console.log(`💰 Native Balance: ${Number(nativeBalance) / 1e18} ETH`)

  // Check if the kernel account is deployed
  const code = await client.getBytecode({ address: kernelAddress })
  if (code && code !== '0x') {
    // eslint-disable-next-line no-console
    console.log(`✅ Kernel account is deployed`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`⚠️  Kernel account is not yet deployed`)
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  try {
    switch (command) {
      case 'balance':
        await checkBalance()
        break

      case 'transfer':
        await transferFunds()
        break

      default:
        // eslint-disable-next-line no-console
        console.log(`
🚀 KMS Kernel Account Transfer Script

Usage Examples:

📊 Check Balance:
  npx tsx scripts/kms-transfer.ts balance

💸 Transfer Funds:
  npx tsx scripts/kms-transfer.ts transfer

Environment Variables:
  KMS_KEY_ID     - AWS KMS key ID or alias (required)
  AWS_REGION     - AWS region (default: us-east-1)

AWS Configuration:
  Ensure AWS credentials are configured via:
  - AWS credentials file (~/.aws/credentials)
  - IAM role (if running on EC2)
  - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  - AWS CLI profile

Required KMS Permissions:
  - kms:Sign
  - kms:GetPublicKey
  - kms:DescribeKey

⚠️  Make sure your KMS key is configured for signing (ECC_SECG_P256K1)
`)
        process.exit(1)
    }
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('❌ Operation failed:', error.message)
    // eslint-disable-next-line no-console
    console.error('💡 Check AWS credentials and KMS key permissions')
    process.exit(1)
  }
}

// Run the script
main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('🎊 Operation completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  })
