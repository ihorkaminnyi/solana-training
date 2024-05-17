import { mintTo } from '@solana/spl-token';
import 'dotenv/config';
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'));

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const sender = getKeypairFromEnvironment('SECRET_KEY');

// Substitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey(
  '3J358haraA3qJNmT5z6YbtCtcjHNcwdAQFUh5mnJufxx'
);

// Subtitute in a recipient token account you just made
const recipientAssociatedTokenAccount = new PublicKey(
  '9P99si4MFCCLRZxeUWvSFb4ZFo6zZkbMwovoegpPK85f'
);

const transactionSignature = await mintTo(
  connection,
  sender,
  tokenMintAccount,
  recipientAssociatedTokenAccount,
  sender,
  10 * MINOR_UNITS_PER_MAJOR_UNITS
);

const link = getExplorerLink('transaction', transactionSignature, 'devnet');

console.log(`✅ Success! Mint Token Transaction: ${link}`);
