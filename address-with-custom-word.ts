import { Keypair } from '@solana/web3.js';

type SearchStrategy = 'fromSeed' | 'fromRandom';

const searchStrategy: Record<SearchStrategy, Function> = {
  fromSeed: foundPublicKeyWithWordBySeed,
  fromRandom: foundPublicKeyWithWord,
};

// esrun address-with-custom-word.ts <word> <strategy> <seed>
// <word> - the word to search for in the public key
// <strategy> - Optional. Default strategy: fromRandom. The search strategy to use. One of: fromSeed, fromRandom
// <seed> - Optional. Used when strategy is 'fromSeed'. Default value is Uint8Array of zeros. The seed to use for the search. Required for the fromSeed strategy

// Examples:
// esrun address-with-custom-word.ts UKR
// esrun address-with-custom-word.ts UKR fromSeed
// esrun address-with-custom-word.ts UKR fromSeed '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]'

run();

function run() {
  const { word, strategy, seed } = parseArguments();
  const { keypair, searchTimeSeconds, attempts } = searchStrategy[strategy](word, seed);

  console.log(`Public Key: ${keypair.publicKey.toBase58()}`);
  console.log(`Secret Key: ${keypair.secretKey}`);
  console.log(`✅ Finished in ${searchTimeSeconds} seconds, ${attempts} attempts!`);
}

function parseArguments() {
  const word = process.argv[2];
  const strategy: SearchStrategy = process.argv[3] as SearchStrategy || 'fromRandom';
  const seedInput = process.argv[4];

  validateArguments(word, strategy);

  const seed = getSeedFromInput(seedInput, strategy);

  return { word, strategy, seed };
}

function getSeedFromInput(seedInput: string, strategy: SearchStrategy) {
  try {
    if (strategy !== 'fromSeed') {
      return null;
    }

    if (!seedInput) {
      return new Uint8Array(32).fill(0);
    }

    const seedArray = JSON.parse(seedInput);
    const seed = new Uint8Array(seedArray);
    if (seed.length !== 32) {
      console.error('Seed must be exactly 32 bytes long');
      process.exit(1);
    }
    return seed;
  } catch (error) {
    console.error(`Invalid seed format: ${error.message}`);
    process.exit(1);
  }
}

function validateArguments(word: string, strategy: SearchStrategy) {
  if (!word) {
    console.error('Please provide a word to search for in the public key');
    process.exit(1);
  }

  if (/[OIl0]/.test(word)){
    console.error(`Word cannot contain the letters 'O', 'l', 'I' or number '0'`);
    process.exit(1);
  }

  if (!searchStrategy[strategy]) {
    console.error(`Invalid strategy. Use one of: ${Object.keys(searchStrategy).join(', ')}`);
    process.exit(1);
  }
}

function foundPublicKeyWithWordBySeed(word: string, seed: Uint8Array) {
  return searchKeyWithWord(
    () => Keypair.fromSeed(seed),
    word,
    seed,
    (i: number, array: { [x: number]: number; }) => array[i] < 255,
    (i: number, array: { [x: number]: number; }) => array[i]++
  );
}

function foundPublicKeyWithWord(word: string) {
  return searchKeyWithWord(
    Keypair.generate,
    word
  );
}

function searchKeyWithWord(generator: Function, word: string, seed: Uint8Array = null, condition: Function = null, increment: Function = null) {
  let attempts = 0;
  const startTimestamp = Date.now();

  while (true) {
    const keypair: Keypair = generator();
    const publicKeyBase58 = keypair.publicKey.toBase58();

    if (publicKeyBase58.startsWith(word) || publicKeyBase58.endsWith(word)) {
      const searchTimeSeconds = (Date.now() - startTimestamp) / 1000;
      return { keypair, searchTimeSeconds, attempts };
    }

    if (seed) {
      for (let i = seed.length - 1; i >= 0; i--) {
        if (condition(i, seed)) {
          increment(i, seed);
          break;
        } else {
          seed[i] = 0;
        }
      }
    }

    attempts++;
    if (attempts % 100000 === 0) {
      console.log(`Generating... ${attempts} attempts for now`);
    }
  }
}
