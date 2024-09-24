import { defineStore } from 'pinia';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from "solana-wallets-vue";
import { ref, computed } from 'vue';

export const useSolanaStore = defineStore('solanaStore', () => {

    const wallet = ref('');
    const connectedWallet = computed(() => wallet.value?.adapter?.name);
    const { successToast, errorToast } = usePrettyToast();

    /**
     * Handles errors by logging and showing a toast message.
     * @param {Error} error - The error object.
     * @param {string} userMessage - The message to display to the user.
     */
    const handleError = (error, userMessage) => {
        console.error(userMessage, error);
        errorToast(`${userMessage}: ${error.message || error}`);
    };

    /**
     * Fetches and displays transaction details.
     * @param {string} txid - The transaction ID.
     */
    const getTransactionDetails = async (txid) => {
        try {
            const rpcUrl = useRuntimeConfig().public.solanaRPC;
            const connection = new Connection(rpcUrl, 'confirmed');
            const txDetails = await connection.getTransaction(txid, { commitment: 'confirmed' });
            console.log('Transaction Details:', txDetails);

            if (txDetails?.meta?.err) {
                console.error('Transaction Error:', txDetails.meta.err);
                handleError(new Error(JSON.stringify(txDetails.meta.err)), 'Transaction failed');
            } else {
                successToast('Transaction confirmed successfully');
            }
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            handleError(error, 'Error fetching transaction details');
        }
    };

    /**
     * Simulates a transaction to ensure it will execute correctly.
     * @param {Uint8Array} transactionBytes - The serialized transaction bytes.
     * @returns {Promise<boolean>} - Returns true if simulation is successful, false otherwise.
     */
    const simulateTransaction = async (transactionBytes) => {
        try {
            const rpcUrl = useRuntimeConfig().public.solanaRPC;
            const connection = new Connection(rpcUrl, 'confirmed');
            const transaction = VersionedTransaction.deserialize(transactionBytes);

            const simulationResult = await connection.simulateTransaction(transaction, {
                commitment: 'confirmed',
            });

            if (simulationResult.value.err) {
                throw new Error('Transaction simulation failed: ' + JSON.stringify(simulationResult.value.err));
            }

            console.log('Simulation successful:', simulationResult);
            return true;
        } catch (err) {
            console.error('Error simulating transaction:', err);
            handleError(new Error(JSON.stringify(err)), 'Transaction simulation failed');
            return false;
        }
    };

    /**
     * Signs and sends a transaction.
     * @param {string} encodedTransaction - The Base64 encoded transaction.
     * @returns {Promise<string|null>} - Returns the transaction signature link if successful, null otherwise.
     */
    const signEncodedTransaction = async (encodedTransaction) => {
        try {
            const { signTransaction } = useWallet();

            if (!signTransaction) {
                throw new Error('Wallet does not support signTransaction');
            }

            const { Buffer } = await import('buffer');
            const rpcUrl = useRuntimeConfig().public.solanaRPC;
            console.log('Connecting to Solana RPC:', rpcUrl);
            const connection = new Connection(rpcUrl, 'confirmed');

            // Decode the Base64 transaction
            const transactionBytes = Buffer.from(encodedTransaction, 'base64');
            console.log('Serialized Transaction (Buffer):', transactionBytes);

            // Deserialize the transaction as a VersionedTransaction
            let transaction;
            try {
                transaction = VersionedTransaction.deserialize(transactionBytes);
                console.log('Deserialized VersionedTransaction:', transaction);
            } catch (deserializeError) {
                throw new Error('Failed to deserialize transaction: ' + deserializeError.message);
            }


            // Sign the transaction using the wallet adapter
            const signedTransaction = await signTransaction.value(transaction);
            console.log('Signed Transaction:', signedTransaction);

            // Serialize the signed transaction
            const serializedSignedTransaction = signedTransaction.serialize();
            console.log('Serialized Signed Transaction:', serializedSignedTransaction);

            // Send the signed transaction to the network
            const txid = await connection.sendRawTransaction(serializedSignedTransaction, {
                skipPreflight: false, // Enable preflight for better error reporting
                preflightCommitment: 'confirmed',
            });
            console.log('Transaction sent with txid:', txid);
            successToast('Transaction signed successfully');

            // Fetch transaction details
            await getTransactionDetails(txid);

            // Return the Solscan link
            return `https://solscan.io/tx/${txid}`;
        } catch (error) {
            console.error('Error signing transaction', error);
            handleError(error, 'Error signing transaction');
            throw error;
        }
    };

    /**
     * Builds the swap transaction by calling the backend.
     * @param {string} inputMint - The input mint address.
     * @param {string} outputMint - The output mint address.
     * @param {number} amount - The amount to swap.
     * @param {number} slippageBps - The slippage in basis points.
     * @returns {Promise<string>} - The encoded transaction.
     */
    const swap = async (inputMint, outputMint, amount, slippageBps) => {
        try {
            const publicKey = wallet.value;
            const response = await fetch(`${useRuntimeConfig().public.baseURL}/solana/swap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicKey, inputMint, outputMint, amount, slippageBps }),
            });

            if (!response.ok) {
                const errorText = `Failed to build swap transaction: ${response.statusText}`;
                throw new Error(errorText);
            }

            const jsonResponse = await response.json();
            return jsonResponse.data.transaction;

        } catch (error) {
            handleError(error, 'Error building swap transaction');
            throw error; // Rethrow only if necessary
        }
    };

    /**
     * Performs the swap and signs the transaction.
     * @param {string} inputMint - The input mint address.
     * @param {string} outputMint - The output mint address.
     * @param {number} amount - The amount to swap.
     * @param {number} slippageBps - The slippage in basis points.
     * @returns {Promise<string>} - The Solscan transaction link.
     */
    const swapAndSign = async (inputMint, outputMint, amount, slippageBps) => {
        try {
            const transaction = await swap(inputMint, outputMint, amount, slippageBps);
            return await signEncodedTransaction(transaction);

        } catch (error) {
            handleError(error, 'Error during swap and sign');
            throw error; // Rethrow only if necessary
        }
    };

    return {
        connectedWallet,
        wallet,
        swap,
        swapAndSign,
        signEncodedTransaction
    };
});
