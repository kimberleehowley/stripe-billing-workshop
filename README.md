# Developer Workshop - Stripe Billing creating subsciptions

This workshop is designed to get developers started on Stripe Billing. During the workshop, we’ll build a sample web application, create a flat-rate subscription, and setup payment details for recurring billing.  

We’ll run and serve the application at: http://localhost:4242.  

Pre-requesites: 
If you don’t have one, create and activate a Stripe account  
Clone this repo 
[optional] Install the Stripe CLI 


Features to build:

- Collect card details 💳
- Save a card to a customer
- Subscribe a customer to a plan in Stripe Billing 💰

## How to run locally

This recipe includes [5 server implementations](server/README.md) in our most popular languages.

If you want to run the recipe locally, copy the .env.example file to your own .env file in this directory:

```
cp .env.example .env
```

You will need a Stripe account with its own set of [API keys](https://stripe.com/docs/development#api-keys).

## FAQ

Q: Why did you pick these frameworks?

A: We chose the most minimal framework to convey the key Stripe calls and concepts you need to understand. These demos are meant as an educational tool that helps you roadmap how to integrate Stripe within your own system independent of the framework.

Q: Can you show me how to build X?

A: We are always looking for new sample ideas, please email dev-samples@stripe.com with your suggestion!

## Author(s)

[@ctrudeau-stripe](https://twitter.com/trudeaucj)
