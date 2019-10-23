# Stripe Billing Workshop creating subsciptions

This workshop is designed to get developers started on Stripe Billing. During the workshop, we’ll build a sample web application, create a flat-rate subscription, and setup payment details for recurring billing.  

If you are looking for an overview of the workshop, check the [slides here](https://github.com/ctrudeau-stripe/stripe-billing-workshop/blob/workshop-answers/Developer%20Workshop%20-%20Stripe%20Billing.pdf)

## Pre-requisites: 
1. If you don’t have one, [create a Stripe account](https://dashboard.stripe.com/register)
2. Clone this repo 
```
git clone git@github.com:ctrudeau-stripe/stripe-billing-workshop.git
```
3. Copy the environment variables file from the root of the repository: `cp .env.example .env`
4. Get your public and secret **test** keys from the [Dashboard](https://dashboard.stripe.com/account/apikeys) and put them in the newly created `.env` file.
5. Open the [creating subscriptions guide](https://stripe.com/docs/billing/subscriptions/creating-subscriptions) that this workshop follows 
6. [optional] [Install the Stripe CLI to support webhooks](https://stripe.com/docs/stripe-cli)

Use Stripe [test cards](https://stripe.com/docs/testing) to test your integration.

## Features to build:

- Step 1: [Create a product and plan](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-product-plan)
- Step 2: [Set up Stripe](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#setup)
- Step 3: [Collect card details 💳](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#one-time)
- Step 4: [Create a payment method](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#payment-method)
- Step 5: [Create a customer with a PaymentMethod](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-customer)
- Step 6: [Create the subscription](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-subscription)
- Step 7: [Manage subscription status](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#manage-sub-status)

### If you get stuck you can find a fully implemented server on the [workshop answers branch](https://github.com/ctrudeau-stripe/stripe-billing-workshop/tree/workshop-answers). Search the project for Step 1-7 to see the code from the guide implemented.

## How to run locally

We’ll run and serve the application at: http://localhost:4242.

This sample includes [5 server implementations](server/README.md) in our most popular languages.

If you want to run the sample locally, copy the .env.example file to your own .env file in this directory:

```
cp .env.example .env
```

You will need a Stripe account with its own set of [API keys](https://stripe.com/docs/development#api-keys).

## Feedback

Please send us your feedback on the workshop, email Developer Relations dev-relations@stripe.com with your suggestion.

## Author(s)

[@ctrudeau-stripe](https://twitter.com/trudeaucj)
