const express = require('express');
const app = express();
const { resolve } = require('path');
// Replace if using a different env file or config
const ENV_PATH = '../../.env';
const envPath = resolve(ENV_PATH);
const env = require('dotenv').config({ path: envPath });
// Step 2: [Set up Stripe]
// (https://stripe.com/docs/billing/subscriptions/creating-subscriptions#setup)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(express.static(process.env.STATIC_DIR));

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    }
  })
);

app.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});

app.get('/public-key', (req, res) => {
  res.send({ publicKey: process.env.STRIPE_PUBLIC_KEY });
});

// Step 5 implement a create-customer POST API
// that returns the customer object
// the client will pass in
// { payment_method: pm_1FU2bgBF6ERF9jhEQvwnA7sX, }
// [Create a customer with a PaymentMethod]
// https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-customer

// Step 6 implement a `create-subscription` POST API
// that returns a created subscription object
// the client will pass in
// { planId: plan_G0FvDp6vZvdwRZ, customerId: cus_Frf3x0oGDgU1eg }
// [Create the subscription]
// https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-subscription

app.post('/subscription', async (req, res) => {
  let subscription = await stripe.subscriptions.retrieve(
    req.body.subscriptionId
  );
  res.send(subscription);
});

// Webhook handler for asynchronous events.
app.post('/webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    dataObject = event.data.object;
    eventType = event.type;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case 'customer.created':
        // console.log(dataObject);
        break;
      case 'customer.updated':
        // console.log(dataObject);
        break;
      case 'invoice.upcoming':
        // console.log(dataObject);
        break;
      case 'invoice.created':
        // console.log(dataObject);
        break;
      case 'invoice.finalized':
        // console.log(dataObject);
        break;
      case 'invoice.payment_succeeded':
        // console.log(dataObject);
        break;
      case 'invoice.payment_failed':
        // console.log(dataObject);
        break;
      case 'customer.subscription.created':
        // console.log(dataObject);
        break;
      // ... handle other event types
      default:
        // Unexpected event type
        return res.status(400).end();
    }
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  res.sendStatus(200);
});

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));
