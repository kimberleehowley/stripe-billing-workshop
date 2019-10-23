#! /usr/bin/env python3.6

"""
server.py
Stripe Recipe.
Python 3.6 or newer required.
"""

import stripe
import json
import os

from flask import Flask, render_template, jsonify, request, send_from_directory
from dotenv import load_dotenv, find_dotenv

# Setup Stripe python client library
load_dotenv(find_dotenv())
# Step 2: [Set up Stripe]
# https://stripe.com/docs/billing/subscriptions/creating-subscriptions#setup
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe.api_version = os.getenv('STRIPE_API_VERSION')

static_dir = str(os.path.abspath(os.path.join(
    __file__, "..", os.getenv("STATIC_DIR"))))
app = Flask(__name__, static_folder=static_dir,
            static_url_path="", template_folder=static_dir)

@app.route('/', methods=['GET'])
def get_index():
    return render_template('index.html')

@app.route('/public-key', methods=['GET'])
def get_public_key():
    return jsonify(publicKey=os.getenv('STRIPE_PUBLIC_KEY'))

# Step 5 implement a create-customer POST API
# that returns the customer object
# the client will pass in
# { payment_method: pm_1FU2bgBF6ERF9jhEQvwnA7sX, }
# [Create a customer with a PaymentMethod](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-customer)

# Step 6 implement a `create-subscription` POST API
# that returns a created subscription object
# the client will pass in
# { planId: plan_G0FvDp6vZvdwRZ, customerId: cus_Frf3x0oGDgU1eg }
# [Create the subscription]
# (https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-subscription)

@app.route('/subscription', methods=['POST'])
def getSubscription():
    # Reads application/json and returns a response
    data = json.loads(request.data)
    try:
        subscription = stripe.Subscription.retrieve(data['subscriptionId'])
        return jsonify(subscription)
    except Exception as e:
        return jsonify(e), 403

@app.route('/webhook', methods=['POST'])
def webhook_received():
    # You can use webhooks to receive information about asynchronous payment events.
    # For more about our webhook events check out https://stripe.com/docs/webhooks.
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    request_data = json.loads(request.data)

    if webhook_secret:
        # Retrieve the event by verifying the signature using the raw body and secret if webhook signing is configured.
        signature = request.headers.get('stripe-signature')
        try:
            event = stripe.Webhook.construct_event(
                payload=request.data, sig_header=signature, secret=webhook_secret)
            data = event['data']
        except Exception as e:
            return e
        # Get the type of webhook event sent - used to check the status of PaymentIntents.
        event_type = event['type']
    else:
        data = request_data['data']
        event_type = request_data['type']

    data_object = data['object']
    
    if event_type == 'customer.created':
        # print(data)

    if event_type == 'customer.updated':
        # print(data)

    if event_type == 'invoice.upcoming':
        # print(data)

    if event_type == 'invoice.created':
        # print(data)

    if event_type == 'invoice.finalized':
        # print(data)

    if event_type == 'invoice.payment_succeeded':
        # print(data)

    if event_type == 'invoice.payment_failed':
        # print(data)

    if event_type == 'customer.subscription.created':
        # print(data)

    return jsonify({'status': 'success'})


if __name__== '__main__':
    app.run(port=4242)
