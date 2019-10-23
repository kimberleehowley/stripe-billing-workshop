package com.stripe.sample;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import java.nio.file.Paths;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.annotations.SerializedName;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import com.stripe.sample.Server.CreateSubscriptionBody;

import io.github.cdimascio.dotenv.Dotenv;

public class Server {
    private static Gson gson = new Gson();

    static class CreatePaymentBody {
        @SerializedName("payment_method")
        String paymentMethod;
        @SerializedName("email")
        String email;

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public String getEmail() {
            return email;
        }
    }

    static class CreateSubscriptionBody {
        @SerializedName("subscriptionId")
        String subscriptionId;

        public String getSubscriptionId() {
            return subscriptionId;
        }
    }

    public static void main(String[] args) {
        port(4242);
        String ENV_PATH = "../../";
        Dotenv dotenv = Dotenv.configure().directory(ENV_PATH).load();

        // Step 2: [Set up Stripe]
        // https://stripe.com/docs/billing/subscriptions/creating-subscriptions#setup
        Stripe.apiKey = dotenv.get("STRIPE_SECRET_KEY");

        staticFiles.externalLocation(
                Paths.get(Paths.get("").toAbsolutePath().toString(), dotenv.get("STATIC_DIR")).normalize().toString());

        get("/public-key", (request, response) -> {
            response.type("application/json");
            JsonObject publicKey = new JsonObject();
            publicKey.addProperty("publicKey", dotenv.get("STRIPE_PUBLIC_KEY"));
            return publicKey.toString();
        });

        // Step 5 implement a create-customer POST API
        // that returns the customer object
        // the client will pass in
        // { payment_method: pm_1FU2bgBF6ERF9jhEQvwnA7sX, }
        // [Create a customer with a
        // PaymentMethod](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-customer)

        // Step 6 implement a `create-subscription` POST API
        // that returns a created subscription object
        // the client will pass in
        // { planId: plan_G0FvDp6vZvdwRZ, customerId: cus_Frf3x0oGDgU1eg }
        // [Create the subscription]
        // (https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-subscription)

        post("/subscription", (request, response) -> {
            response.type("application/json");

            CreateSubscriptionBody postBody = gson.fromJson(request.body(), CreateSubscriptionBody.class);
            return Subscription.retrieve(postBody.getSubscriptionId()).toJson();
        });

        post("/webhook", (request, response) -> {
            String payload = request.body();
            String sigHeader = request.headers("Stripe-Signature");
            String endpointSecret = dotenv.get("STRIPE_WEBHOOK_SECRET");
            Event event = null;

            try {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            } catch (SignatureVerificationException e) {
                // Invalid signature
                response.status(400);
                return "";
            }

            // Deserialize the nested object inside the event
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = null;
            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            } else {
                // Deserialization failed, probably due to an API version mismatch.
                // Refer to the Javadoc documentation on `EventDataObjectDeserializer` for
                // instructions on how to handle this case, or return an error here.
            }

            switch (event.getType()) {
            case "customer.created":
                // Customer customer = (Customer) stripeObject;
                // System.out.println(customer.toJson());
                break;
            case "customer.updated":
                // Customer customer = (Customer) stripeObject;
                // System.out.println(customer.toJson());
                break;
            case "invoice.upcoming":
                // Invoice invoice = (Invoice) stripeObject;
                // System.out.println(invoice.toJson());
                break;
            case "invoice.created":
                // Invoice invoice = (Invoice) stripeObject;
                // System.out.println(invoice.toJson());
                break;
            case "invoice.finalized":
                // Invoice invoice = (Invoice) stripeObject;
                // System.out.println(invoice.toJson());
                break;
            case "invoice.payment_succeeded":
                // Invoice invoice = (Invoice) stripeObject;
                // System.out.println(invoice.toJson());
                break;
            case "invoice.payment_failed":
                // Invoice invoice = (Invoice) stripeObject;
                // System.out.println(invoice.toJson());
                break;
            case "customer.subscription.created":
                Subscription subscription = (Subscription) stripeObject;
                System.out.println(subscription.toJson());
                break;
            default:
                // Unexpected event type
                response.status(400);
                return "";
            }

            response.status(200);
            return "";
        });
    }
}