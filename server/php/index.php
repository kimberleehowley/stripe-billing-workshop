<?php
use Slim\Http\Request;
use Slim\Http\Response;
use Stripe\Stripe;
require 'vendor/autoload.php';

$ENV_PATH = '../..';
$dotenv = Dotenv\Dotenv::create(realpath($ENV_PATH));
$dotenv->load();


require './config.php';

$app = new \Slim\App;

// Instantiate the logger as a dependency
$container = $app->getContainer();
$container['logger'] = function ($c) {
  $settings = $c->get('settings')['logger'];
  $logger = new Monolog\Logger($settings['name']);
  $logger->pushProcessor(new Monolog\Processor\UidProcessor());
  $logger->pushHandler(new Monolog\Handler\StreamHandler(__DIR__ . '/logs/app.log', \Monolog\Logger::DEBUG));
  return $logger;
};
$app->add(function ($request, $response, $next) {
  # Step 2: [Set up Stripe]
  # https://stripe.com/docs/billing/subscriptions/creating-subscriptions#setup
    Stripe::setApiKey(getenv('STRIPE_SECRET_KEY'));
    return $next($request, $response);
});

$app->get('/', function (Request $request, Response $response, array $args) {   
  // Display checkout page
  return $response->write(file_get_contents('../../client/index.html'));
});

$app->get('/public-key', function (Request $request, Response $response, array $args) {
  $pub_key = getenv('STRIPE_PUBLIC_KEY');
  
  // Send public key details to client
  return $response->withJson(array('publicKey' => $pub_key));
});

// Step 5 implement a create-customer POST API
// that returns the customer object
// the client will pass in
// { payment_method: pm_1FU2bgBF6ERF9jhEQvwnA7sX, }
// [Create a customer with a PaymentMethod](https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-customer)

// Step 6 implement a `create-subscription` POST API
// that returns a created subscription object
// the client will pass in
// { planId: plan_G0FvDp6vZvdwRZ, customerId: cus_Frf3x0oGDgU1eg }
// [Create the subscription]
// (https://stripe.com/docs/billing/subscriptions/creating-subscriptions#create-subscription)

$app->post('/subscription', function (Request $request, Response $response, array $args) {  
  $body = json_decode($request->getBody());

  $subscription = \Stripe\Subscription::retrieve($body->subscriptionId);


  return $response->withJson($subscription);
});


$app->post('/webhook', function(Request $request, Response $response) {
    $logger = $this->get('logger');
    $event = $request->getParsedBody();
    // Parse the message body (and check the signature if possible)
    $webhookSecret = getenv('STRIPE_WEBHOOK_SECRET');
    if ($webhookSecret) {
      try {
        $event = \Stripe\Webhook::constructEvent(
          $request->getBody(),
          $request->getHeaderLine('stripe-signature'),
          $webhookSecret
        );
      } catch (\Exception $e) {
        return $response->withJson([ 'error' => $e->getMessage() ])->withStatus(403);
      }
    } else {
      $event = $request->getParsedBody();
    }
    $type = $event['type'];
    $object = $event['data']['object'];

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch ($type) {
      case 'customer.created':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      case 'customer.updated':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      case 'invoice.upcoming':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      case 'invoice.created':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      case 'invoice.finalized':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      case 'invoice.payment_succeeded':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      case 'invoice.payment_failed':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      case 'customer.subscription.created':
        $logger->info('🔔  Webhook received! ' . $object);
        break;
      // ... handle other event types
      default:
        // Unexpected event type
        return $response->withStatus(400);
    }

    return $response->withJson([ 'status' => 'success' ])->withStatus(200);
});

$app->run();
