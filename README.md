# Solana Pay Frontend

This is the frontend application for a Point of Sale (POS) system utilizing **Solana Pay**, a decentralized, instant, and low-cost payments protocol built on the Solana blockchain. Solana Pay allows merchants and customers to exchange digital assets in a secure and permissionless manner using QR codes for seamless transactions.

## What is Solana Pay?

Solana Pay is a payment protocol that enables merchants to receive payments in digital assets directly on the Solana blockchain. It's designed for instant and feeless transactions, providing a fast and efficient alternative to traditional payment systems. Using QR codes, customers can easily pay for goods and services directly from their wallets.

## Application Overview

This application allows users to add products to their cart and generate a Solana Pay QR code for payment. The QR code can be scanned to complete the transaction directly on the Solana blockchain.

### Key Features:

- **Add Products to Cart:** Users can add products to their shopping cart. There are three example products available.
- **Generate Payment QR Code:** When the cart contains items, a QR code is generated for the total amount.
- **Payment Amount:** If all three example products are added, the total payment will be **0.0001 SOL**.
- **Transaction Confirmation:** Once the payment is made, a transaction link to Solscan will be provided for verification.

### How It Works:

1. **Add Products:** Click on the "Add to Cart" button to add products to your cart.
2. **Checkout:** When ready, click "Checkout" to generate the QR code for payment.
3. **Scan QR Code:** Scan the QR code with a compatible Solana wallet to initiate the payment.
4. **Confirm Payment:** After the transaction is confirmed, a link to the transaction details on Solscan will be displayed.

## Example:

If you add the three available products to your cart, the total amount will be **0.0001 SOL**. After scanning the QR code, the application will display a confirmation with a transaction hash linked to Solscan, where you can verify the payment details.

## Technologies Used:

- **Vue.js:** For building the user interface.
- **Solana Pay:** For generating the payment links and QR codes.
- **Solscan:** For viewing transaction details on the blockchain.

## Getting Started

1. Clone the repository.
2. Install dependencies: `yarn install`
3. Run the application: `yarn run dev`

## Contact

For any questions, feel free to reach out or create an issue in the repository.
