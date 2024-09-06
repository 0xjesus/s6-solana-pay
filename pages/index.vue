<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">Point of Sale</h1>

    <!-- Product List -->
    <div class="row mb-3">
      <div class="col-md-8">
        <h3>Add Products</h3>
        <ul class="list-group">
          <li
            v-for="(product, index) in products"
            :key="index"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            {{ product.name }} - ${{ product.price }}
            <button class="btn btn-primary btn-sm" @click="addToCart(product)">
              Add to Cart
            </button>
          </li>
        </ul>
      </div>

      <!-- Cart -->
      <div class="col-md-4">
        <h3>Cart</h3>
        <ul class="list-group mb-3">
          <li
            v-for="(item, index) in cart"
            :key="index"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            {{ item.name }} - ${{ item.price }}
            <button class="btn btn-danger btn-sm" @click="removeFromCart(index)">
              Remove
            </button>
          </li>
        </ul>
        <h4>Total: ${{ total }}</h4>
        <button
          class="btn btn-success w-100"
          @click="checkout"
          :disabled="cart.length === 0"
        >
          Checkout
        </button>
      </div>
    </div>

    <!-- QR Code Display -->
    <div v-if="qrCodeDataURL" class="mt-3 text-center">
      <h3>Scan to Pay</h3>
      <img :src="qrCodeDataURL" alt="QR Code" />
      <p>Waiting for the transaction to be confirmed...</p>
    </div>

    <!-- Payment Confirmation -->
    <div v-if="paymentSuccess" class="alert alert-success mt-3">
      Payment successful! Transaction Hash:
      <a :href="'https://solscan.io/tx/' + transactionHash" target="_blank">
        {{ transactionHash }}
      </a>
    </div>
  </div>
</template>

<script setup>

// Lista de productos de ejemplo
const products = ref([
  { name: 'Product 1', price: 0.00002 },
  { name: 'Product 2', price: 0.00003 },
  { name: 'Product 3', price: 0.00005 },
]);

// Lógica del carrito y estados de la transacción
const cart = ref([]);
const qrCodeDataURL = ref('');
const paymentSuccess = ref(false);
const transactionHash = ref('');
const referenceKey = ref('');

const addToCart = (product) => {
  cart.value.push(product);
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const total = computed(() => cart.value.reduce((sum, item) => sum + item.price, 0));

const checkout = async () => {
  try {
    const config = useRuntimeConfig();

    // Llamada al backend para crear la URL de Solana Pay y obtener el QR code
    const response = await fetch(`${config.public.baseURL}/solana/create-pay-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total.value }),
    });

    if (!response.ok) throw new Error('Failed to create Solana Pay URL');

    // Obtener la URL del código QR y la referencia para monitorear la transacción
    const { data } = await response.json();
    qrCodeDataURL.value = data.qrCodeData;
    referenceKey.value = data.reference; // Guardar la referencia para monitorear la transacción

    // Iniciar el proceso de polling para verificar el estado de la transacción
    pollTransactionStatus();
  } catch (error) {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  }
};

// Función de polling para verificar el estado de la transacción
const pollTransactionStatus = async () => {
  try {
    const config = useRuntimeConfig();

    const interval = setInterval(async () => {
      // Llamada al backend para verificar el estado de la transacción usando la referencia
      const response = await fetch(`${config.public.baseURL}/solana/get-transaction-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: referenceKey.value }),
      });

      if (!response.ok) throw new Error('Failed to fetch transaction status');

      const { data } = await response.json();

      if (data) {
        clearInterval(interval); // Detener el polling una vez que la transacción se confirme
        transactionHash.value = data; // Establecer el hash de la transacción
        paymentSuccess.value = true;
        cart.value = []; // Vaciar el carrito después de la confirmación
      }
    }, 5000); // Polling cada 5 segundos
  } catch (error) {
    console.error('Error checking transaction status:', error);
  }
};
</script>
