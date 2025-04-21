

// // components/StripePaymentForm.js
// import React from 'react';
// import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// const StripePaymentForm = ({ amount, onSuccess, onError }) => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleSubmit = async (event) => {
//     event.preventDefault();
    
//     if (!stripe || !elements) {
//       return;
//     }

//     const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: {
//         card: elements.getElement(CardElement),
//       },
//     });

//     if (error) {
//       onError(error.message);
//     } else if (paymentIntent.status === 'succeeded') {
//       onSuccess(paymentIntent);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <CardElement />
//       <button type="submit" disabled={!stripe}>
//         Pay ${amount}
//       </button>
//     </form>
//   );
// };

// export default StripePaymentForm;