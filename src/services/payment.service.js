const config = require('../config/config');
const { Transaction, Contract, Ticket, User } = require('../models');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(config.stripe.test_secret);

const mailer = require('../mailer');
const LinkEmailTemplate = require('../mailer/templates/PaymentLink');
const PaymentCompletedEmailTemplate = require('../mailer/templates/PaymentCompleted');

/**
 * Payment Intent save for 10% payment
 * @param {number} amount
 * @param {string} id
 */

const savePaymentIntentType1 = async ({ amount, id }) => {
  console.log('stripe | amount and id', amount, id);
  try {
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'USD',
      description: 'Automaar car rental services',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log('stripe | payment', payment);
    return {
      payment,
      success: true,
    };
  } catch (error) {
    console.log('stripe | error', error);
    return {
      message: 'Payment Failed',
      success: false,
    };
  }
};

const savePaymentIntentType2 = async (data) => {
  try {
    const customer = await stripe.customers.create({
      name: data.name,
      address: data.address,
      description: `Test customer for payment on ${new Date()}`,
    });

    const payment = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'INR',
      description: 'Automaar car rental services',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { payment, success: true };
  } catch (error) {
    console.log('stripe | error', error);
    return {
      message: 'Payment Failed',
      success: false,
    };
  }
};

const createPaymentLink = async (data, owner_id) => {
  try {
    const contractDetails = await Contract.findById(data.contract_id).populate('car_id owner_id');

    if (!contractDetails || contractDetails.owner_id._id.toString() != owner_id) {
      return {
        message: 'Payment Failed',
        success: false,
        case: 'invalid_contract',
      };
    }

    if (!contractDetails.owner_id.payment || !contractDetails.owner_id.payment.apiKey) {
      return {
        message: 'Payment Failed',
        success: false,
        case: 'online_payment_inactive',
      };
    }

    const ownerStripe = require('stripe')(contractDetails.owner_id.payment.secretKey);

    const product = await ownerStripe.products.create({
      name: contractDetails.id,
    });
    const price = await ownerStripe.prices.create({
      currency: data.currency.toLowerCase(),
      unit_amount: data.amount,
      product: product.id,
    });

    const paymentLink = await ownerStripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    });

    const newPayment = await Transaction.create({
      ...data,
      car_id: contractDetails.car_id._id,
      owner_id: owner_id,
      payment_type: 'online',
      payment_id: paymentLink.id,
    });

    const emailData = LinkEmailTemplate({
      dealerShipName: contractDetails.owner_id.corporation_name
        ? contractDetails.owner_id.corporation_name
        : contractDetails.owner_id.first_name + ' ' + contractDetails.owner_id.last_name,
      clientName: contractDetails.client.name.first_name + ' ' + contractDetails.client.name.last_name,
      amountWithCurrency: data.amount / 100 + ' ' + data.currency,
      carModel: contractDetails.car_id.vehicle_model,
      carPlateNumber: contractDetails.car_id.vehicle_plate,
      paymentURL: paymentLink.url,
    });
    mailer({
      recipient: contractDetails.client.email,
      subject: emailData.subject,
      data: emailData.data,
    });

    return { newPayment, success: true };
  } catch (error) {
    console.log('stripe | error', error);
    if (error.type === 'StripeAuthenticationError') {
      return {
        message: 'auth_error',
        success: false,
      };
    }
    return {
      message: 'Payment Failed',
      success: false,
    };
  }
};

const initiatePayment = async ({ clientReferenceId, customerEmail, lineItem, successUrl, cancelUrl }) => {
  console.log('stripe', clientReferenceId, customerEmail, lineItem, successUrl, cancelUrl);

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      client_reference_id: clientReferenceId,
      customer_email: customerEmail,
      payment_method_types: ['card'],
      line_items: [lineItem],
      payment_intent_data: {
        description: `${lineItem.name} ${lineItem.description}`,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  } catch (error) {
    res.status(500).send({ error });
  }
  return res.status(200).send(session);
};

const completePayment = async (rawBody, headers) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, headers['stripe-signature'], 'YOUR_STRIPE_WEBHOOK_SECRET');
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // complete your customer's order
      // e.g. save the purchased product into your database
      // take the clientReferenceId to map your customer to a product
      console.log('Payment completed');
    } catch (error) {
      return res.status(404).send({ error, session });
    }
  }

  return res.status(200).send({ received: true });
};

const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const transactionData = await Transaction.findOne({ payment_id: paymentIntent.id }).populate('owner_id car_id');
    if (transactionData) {
      if (transactionData.payment_type == 'ticket') {
        const ticketData = await Ticket.findOne({ transaction_id: transactionData._id });
        const emailData = PaymentCompletedEmailTemplate({
          dealerShipName: transactionData.owner_id.corporation_name
            ? transactionData.owner_id.corporation_name
            : transactionData.owner_id.first_name + ' ' + transactionData.owner_id.last_name,
          clientName: ticketData.driver_info.first_name + ' ' + ticketData.driver_info.last_name,
          startDate: ticketData.pick_up.toUTCString(),
          endDate: ticketData.drop_off.toUTCString(),
          carModel: transactionData.car_id.vehicle_model,
          carPlateNumber: transactionData.car_id.vehicle_plate,
          dealerShipEmail: transactionData.owner_id.email,
          bookingID: ticketData.id,
          CANCEL_URL: `${config.app.url}/api/v1/user/cancelbooking/${ticketData.token_id}`,
        });
        mailer({
          recipient: ticketData.driver_info.contact_details.email,
          subject: emailData.subject,
          data: emailData.data,
        });
      }
      if (transactionData.payment_type == 'online') {
        await Transaction.updateOne(
          { payment_id: paymentIntent.id },
          { $set: { payment_intent: paymentIntent.payment_intent, isPaymentCompleted: true } }
        );
      } 
      else {
        await Transaction.updateOne({ payment_id: paymentIntent.id }, { $set: { isPaymentCompleted: true } });
        if (transactionData.payment_type == 'ticket') {
          await Ticket.updateOne({ transaction_id: transactionData._id }, { $set: { isPaymentCompleted: true } });
        }
      }
    }
  } catch (error) {
    console.log('Stripe payment success error', error, paymentIntent);
  }
};

const initiateRefund = async (payment_id, user) => {
  try {
    const ownerStripe = require('stripe')(user.payment.secretKey);

    const refund = await ownerStripe.refunds.create({
      payment_intent: payment_id,
    });

    return {
      id: refund.id,
      success: true,
    };
  } catch (error) {
    if (error.type === 'StripeAuthenticationError') {
      return {
        message: 'auth_error',
        success: false,
      };
    }
    return {
      message: 'Payment Failed',
      success: false,
    };
  }
};

const adminRefund = async (payment_id) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment_id,
    });

    return {
      id: refund.id,
      success: true,
    };
  } catch (error) {
    if (error.type === 'StripeAuthenticationError') {
      return {
        message: 'auth_error',
        success: false,
      };
    }
    return {
      message: 'Payment Failed',
      success: false,
    };
  }
};

// const handleCheckoutSuccess = async (data) => {
//   try {
//     const transactionData = await Transaction.findOne({ payment_id: data.payment_link });
//     if (!transactionData) {
//       throw new Error('Transaction id not found error!');
//     }

//     const updatedTransaction = await Transaction.updateOne(
//       { payment_id: data.payment_link },
//       { $set: { payment_id: data.payment_intent } }
//     );
//     console.log('Transaction updated', updatedTransaction);
//   } catch (error) {
//     console.log('Stripe checkout success error', error, paymentIntent);
//   }
// };
const paymentStatus = async (transaction_id) => {
  const transactionData = await Transaction.findById(transaction_id);

  return transactionData.isPaymentCompleted;
};

const savePaymentDetails = async (data, user_id) => {
  const updateData = await User.updateOne({ _id: user_id }, { $set: { payment: data } });
  console.log(updateData);
};

module.exports = {
  savePaymentIntentType1,
  savePaymentIntentType2,
  createPaymentLink,
  initiatePayment,
  completePayment,
  handlePaymentSuccess,
  paymentStatus,
  savePaymentDetails,
  initiateRefund,
  adminRefund,
  // handleCheckoutSuccess,
};
