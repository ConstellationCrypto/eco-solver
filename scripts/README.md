# KMS Kernel Account Transfer

Transfer tokens from a kernel account using AWS KMS signing.

## Quick Start

```bash
# 1. Set your KMS key
export KMS_KEY_ID="alias/your-key-alias"
export AWS_REGION="us-east-1"

# 2. Check balance
npx tsx scripts/kms-transfer.ts balance

# 3. Transfer tokens
npx tsx scripts/kms-transfer.ts transfer
```

## Configuration

Edit `scripts/kms-transfer.ts`:

```typescript
const CONFIG = {
  KMS_KEY_ID: process.env.KMS_KEY_ID || 'alias/your-key-alias',
  RECIPIENT: '0x...', // Address to send to
  TRANSFER_TYPE: 'native' as 'native' | 'token',
  ETH_AMOUNT: '0.5', // For native transfers
  TOKEN_ADDRESS: '0x...', // For ERC20 transfers
  TOKEN_AMOUNT: '1000000', // For ERC20 transfers
}
```
