import { createMint } from '@solana/spl-token';
import 'dotenv/config';
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from '@solana-developers/helpers';
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'));

const sender = getKeypairFromEnvironment('SECRET_KEY');

console.log(
  `✅ Finished! We've loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`
);

const tokenMint = await createMint(
  connection,
  sender,
  sender.publicKey,
  null,
  2
);

const link = getExplorerLink('address', tokenMint.toString(), 'devnet');

console.log(`✅ Token Mint: ${link}`);

