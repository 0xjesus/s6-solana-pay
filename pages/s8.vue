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
        <button type="submit" class="btn btn-success w-100">Mint Compressed NFTs</button>
      </form>

      <!-- Display Mint Transaction Result -->
      <div v-if="mintTransaction" class="alert alert-success">
        Compressed NFTs minted successfully! Transaction:
        <a :href="'https://solscan.io/tx/' + mintTransaction" target="_blank">
          {{ mintTransaction }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Hardcoded metadata and wallets
const fileInput = ref(null);
const selectedFile = ref(null);
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
const wallets = ref(`7jQFJLS3QRGJyshYkLgp4QQH8D5c9qym2LQzkhag38UD,
8J9Hz2tfFLDhE5vcdbinCMug4xqyBCfQCoi4QYfVapEn,
A1mq3dn2tUBfJB6WjnL4XtVQgGLGAUD3FeiMLuUQoRMu,
HjJQdfTHgC3EBX3471w4st8BXbBmtbaMyCAXNgcUb7dq,
BtSTqq27A7xTMaCPWEhNwdf4eHsLWiWZvhQS2ABMd1Y4,
9riZWGcTFTLoBpmRM5xfYXCrHsxoqL4ynqBYtNxskYHV,
H3QFot1G5Xe8wAjkQbLLt5dEYsHBsicKLHL1aSBv2H2d,
G1ZRP9Sz87SZJ6ZdsqaK8QxbXGTwCFv1SYnheRtY63DW,
8MgdhXTpfWp5k2m1Q2CxMkETgenkYasNqGW88nUANRkR,
6X4G9p5kiE6tDXkBHfpqispJ2B6YfAA3tBGcKvaXaht2,
8HWXSHAngoGE9dudeZUcvnP7xRr9Wb4gy7H8VS5GRo7N,
9BbWp6tcX9MEGSUEpNXfspYxYsWCxE9FgRkAc3RpftkT,
3dfxtPdadK4CdHC1HjcD6Fc2J3x3REy55RyDxAfYuf1d,
Fhrr8gFyNAASoCM2GprrjaNahgCJyb5SVV6V5oHr72Fj,
DVxLfD4BFF3dLUtpvDZ5jbZExjknE1m2WwH2axz2J6ge,
3o5cfcL9VS31T9N5ZbQgLTHokpxiWbTtjoAMjUp2SNey,
9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3,
3dTSLCGStegkuoU6dc75DbRdJk4rKV3d5ZCZdSWbTcQv,
6ggGtCSpE6moyjDhQQ7MfQ8cw89DcgtYJhaKZaKJ59CQ,
9riZWGcTFTLoBpmRM5xfYXCrHsxoqL4ynqBYtNxskYHV,
JCsFjtj6tem9Dv83Ks4HxsL7p8GhdLtokveqW7uWjGyi,
DH9oe9rfZWkRfBVWvib11ihrgCaYP1jGrD9fXcvhun37,
7jQFJLS3QRGJyshYkLgp4QQH8D5c9qym2LQzkhag38UD,
HdaKENyK8fxod85QipFYZffC82PmsM8XEW4prcZbeQiK,
EcrHvqa5Vh4NhR3bitRZVrdcUGr1Z3o6bXHz7xgBU2FB,
GyETGp22PjuTTiQJQ2P9oAe7oioFjJ7tbTBr1qiXZoa8,
frae7AtwagcebTnNNFaobGH2haFUGNpFniKELbuBi2z,
38rc27bLd73QUDKmiDBQjsmbXpxinx8metaPFsRPSCWi,
4syk2oXfU7kgpAPAxsyBv47FHeNuVz5WGc2x8atGNDd2,
HFJEhqTUPKKWvhwVeQS5qjSP373kMUFpNuiqMMyXZ2Gr,
72hBoHW3TDBHH8vASheaqwVAb8ez3SJAhwtegN5UQvJ9,
CxjawXnJxAyb7Zx3xCkSD3nxamdpcfSikvnnC7C8RMHh,
A1mq3dn2tUBfJB6WjnL4XtVQgGLGAUD3FeiMLuUQoRMu,
2hNdA3G3hfwUN6z28mgFTAjmkXdTvHsRiTXQP3AZjaij,
ji1E9W3P4Yesmwcv6m5rgBs6dGnshaTcfaFoRW6qcjL,
HT8DNntQe2ZN1v763zUqPou5wwNGTg6xBPCDg31vhjrv,
BsdgGRzDmVTM8FBepRXrQixMZgjP6smsSbuDb1Y7VJB6`);
const mintTransaction = ref('');

// Function to handle file input change
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

// Function to create a new NFT Collection
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

// Function to mint compressed NFTs using the created collection
const mintCompressedNFTs = async () => {
  try {
    const walletsArray = wallets.value.split(',').map((wallet) => wallet.trim());

    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.baseURL}/solana/mint-compressed-nfts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromPubKey: collectionAddress.value,
        wallets: walletsArray,
      }),
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
