<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">NFT Minting Dashboard</h1>

    <!-- Section to Create Collection -->
    <div class="mb-4">
      <h3>Create NFT Collection</h3>
      <form @submit.prevent="createCollection" class="mb-3">
        <div class="mb-3">
          <label for="file" class="form-label">Upload Image</label>
          <input type="file" class="form-control" id="file" ref="fileInput" @change="handleFileChange" />
        </div>
        <div class="mb-3">
          <label for="metadata" class="form-label">Collection Metadata (JSON format)</label>
          <textarea v-model="metadata" class="form-control" id="metadata" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary w-100">Create Collection</button>
      </form>

      <!-- Display QR Code for Created Collection -->
      <div v-if="collectionTransaction" class="alert alert-success">
        Collection created successfully! Transaction:
        <a :href="collectionTransaction" target="_blank">
          {{ collectionTransaction }}
        </a>
      </div>
    </div>

    <!-- Section to Create Merkle Tree -->
    <div class="mb-4">
      <h3>Create Merkle Tree</h3>
      <button @click="createMerkleTree" class="btn btn-secondary w-100 mb-3">Create Merkle Tree</button>

      <!-- Display Merkle Tree Transaction Result -->
      <div v-if="merkleTreeTransaction" class="alert alert-success">
        Merkle Tree created successfully! Transaction:
        <a :href="merkleTreeTransaction" target="_blank">
          {{ merkleTreeTransaction }}
        </a>
      </div>
    </div>

    <!-- Section to Mint Compressed NFTs -->
    <div class="mb-4">
      <h3>Mint Compressed NFTs</h3>
      <form @submit.prevent="mintCompressedNFTs">
        <div class="mb-3">
          <label for="collectionAddress" class="form-label">Collection Address</label>
          <input v-model="collectionAddress" type="text" class="form-control" id="collectionAddress"
                 placeholder="Enter collection address" />
        </div>
        <div class="mb-3">
          <label for="wallets" class="form-label">Wallets (comma-separated)</label>
          <textarea v-model="wallets" class="form-control" id="wallets" rows="4"></textarea>
        </div>
        <div class="mb-3">
          <label for="nftFile" class="form-label">Upload File for NFT</label>
          <input type="file" class="form-control" id="nftFile" ref="nftFileInput" @change="handleNFTFileChange" />
        </div>
        <button type="submit" class="btn btn-success w-100">Mint Compressed NFTs</button>
      </form>

      <!-- Display Mint Transaction Result -->
      <div v-if="mintTransaction" class="alert alert-success">
        Compressed NFTs minted successfully! Transaction:
        <a :href="mintTransaction" target="_blank">
          {{ mintTransaction }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// State variables
const fileInput = ref(null);
const selectedFile = ref(null);
const nftFileInput = ref(null);
const selectedNFTFile = ref(null);
const metadata = ref(`{
  "name": "S8-Fellowship",
  "symbol": "S8F",
  "description": "A unique collection of NFTs from the S8 Fellowship program.",
  "attributes": [
    { "trait_type": "Type", "value": "Fellowship" },
    { "trait_type": "Social Media", "value": "https://x.com/@_0xjesus" }
  ]
}`);
const collectionTransaction = ref('');
const collectionAddress = ref('');
const wallets = ref(`7jQFJLS3QRGJyshYkLgp4QQH8D5c9qym2LQzkhag38UD,...`);
const mintTransaction = ref('');
const merkleTreeTransaction = ref('');

// Handle file changes
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const handleNFTFileChange = (event) => {
  selectedNFTFile.value = event.target.files[0];
};

// Create a new NFT Collection
const createCollection = async () => {
  try {
    if (!selectedFile.value) {
      alert('Please select an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('metadata', metadata.value);
    formData.append('fromPubKey', useSolanaStore().wallet);

    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.baseURL}/solana/create-collection`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to create collection');

    const { data } = await response.json();
    const txResult = await useSolanaStore().signEncodedTransaction(data.transaction);
    collectionTransaction.value = txResult;
    console.log(txResult);
  } catch (error) {
    console.error('Error creating collection:', error);
    alert('Failed to create collection. Please try again.');
  }
};

// Create Merkle Tree
const createMerkleTree = async () => {
  try {
    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.baseURL}/solana/create-merkle-tree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPubKey: useSolanaStore().wallet }),
    });

    if (!response.ok) throw new Error('Failed to create Merkle Tree');
    const { data } = await response.json();
	console.log("Transaction...", data.transaction);
    const txResult = await useSolanaStore().signEncodedTransaction(data.transaction);
    merkleTreeTransaction.value = txResult;
    console.log(txResult);
  } catch (error) {
    console.error('Error creating Merkle Tree:', error);
    alert('Failed to create Merkle Tree. Please try again.');
  }
};

// Mint compressed NFTs
const mintCompressedNFTs = async () => {
  try {
    if (!selectedNFTFile.value) {
      alert('Please select a file for NFT.');
      return;
    }

    const walletsArray = wallets.value.split(',').map((wallet) => wallet.trim());

    const formData = new FormData();
    formData.append('file', selectedNFTFile.value);
    formData.append('fromPubKey', collectionAddress.value);
    formData.append('wallets', JSON.stringify(walletsArray));

    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.baseURL}/solana/mint-compressed-nfts`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to mint compressed NFTs');

    const { data } = await response.json();
    const txResult = await useSolanaStore().signEncodedTransaction(data.transaction);
    mintTransaction.value = txResult;
    console.log(txResult);
  } catch (error) {
    console.error('Error minting compressed NFTs:', error);
    alert('Failed to mint NFTs. Please try again.');
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
