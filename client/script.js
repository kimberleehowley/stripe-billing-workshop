var stripe;

var stripeElements = function(publicKey) {
  // Step #3 Collect card details
  stripe = Stripe(publicKey);
  var elements = stripe.elements();

  // Element styles
  var style = {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: 'rgba(0,0,0,0.4)'
      }
    }
  };

  var card = elements.create('card', { style: style });

  card.mount('#card-element');

  // Element focus ring
  card.on('focus', function() {
    var el = document.getElementById('card-element');
    el.classList.add('focused');
  });

  card.on('blur', function() {
    var el = document.getElementById('card-element');
    el.classList.remove('focused');
  });

  document.querySelector('#submit').addEventListener('click', function(evt) {
    evt.preventDefault();
    document.querySelector('#submit').disabled = true;
    // Create the customer
    createCustomerAndPaymentMethod(stripe, card);
  });
};

var createCustomerAndPaymentMethod = function(stripe, card) {
  // Step #4 Create payment method
  changeLoadingState(true);
  var cardholderEmail = document.querySelector('#email').value;
  stripe
    .createPaymentMethod('card', card, {
      billing_details: {
        email: cardholderEmail
      }
    })
    .then(function(result) {
      if (result.error) {
        document.querySelector('#submit').disabled = false;
        // The card was declined (i.e. insufficient funds, card has expired, etc)
        var errorMsg = document.querySelector('.sr-field-error');
        errorMsg.textContent = result.error.message;
        setTimeout(function() {
          errorMsg.textContent = '';
        }, 4000);
      } else {
        createCustomer(result.paymentMethod.id, cardholderEmail);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
};

// Step #5 Create a customer with the payment method
function createCustomer(paymentMethod, cardholderEmail) {
  return fetch('/create-customer', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: cardholderEmail,
      payment_method: paymentMethod
    })
  })
    .then(response => {
      return response.json();
    })
    .then(customer => {
      window.location.href = '/plans.html?customerId=' + customer.id;
      // handleSubscription(customer);
    });
}

function createSubscription(planId) {
  let url = new URL(window.location.href);
  let searchParams = new URLSearchParams(url.search);
  changeLoadingState(true);
  return fetch('/create-subscription', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: searchParams.get('customerId'),
      planId: planId
    })
  })
    .then(response => {
      return response.json();
    })
    .then(subscription => {
      handleSubscription(subscription);
    });
}

// Step #7 Handle subscription status
function handleSubscription(subscription) {
  // if (
  //   subscription &&
  //   subscription.latest_invoice.payment_intent.status === 'requires_action'
  // ) {
  //   stripe
  //     .handleCardPayment(
  //       subscription.latest_invoice.payment_intent.client_secret
  //     )
  //     .then(function(result) {
  //       confirmSubscription(subscription.id);
  //     });
  // } else {
  //   orderComplete(subscription);
  // }

  const { latest_invoice } = subscription;
  const { payment_intent } = latest_invoice;
  if (payment_intent) {
    const { client_secret, status } = payment_intent;

    if (status === 'requires_action') {
      stripe.handleCardPayment(client_secret).then(function(result) {
        if (result.error) {
          // Display error message in your UI.
          // The card was declined (i.e. insufficient funds, card has expired, etc)
        } else {
          // Show a success message to your customer
          confirmSubscription(subscription.id);
        }
      });
    } else {
      // No additional information was needed
      // Show a success message to your customer
      orderComplete(subscription);
    }
  } else {
    orderComplete(subscription);
  }
}

function confirmSubscription(subscriptionId) {
  return fetch('/subscription', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      subscriptionId: subscriptionId
    })
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(subscription) {
      orderComplete(subscription);
    });
}

function getPublicKey() {
  return fetch('/public-key', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      stripeElements(response.publicKey);
    });
}

getPublicKey();

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
var orderComplete = function(subscription) {
  changeLoadingState(false);
  var subscriptionJson = JSON.stringify(subscription, null, 2);
  document.querySelectorAll('.sr-main').forEach(function(view) {
    view.classList.add('hidden');
  });
  document.querySelectorAll('.completed-view').forEach(function(view) {
    view.classList.remove('hidden');
  });
  document.querySelector('.order-status').textContent = subscription.status;
  document.querySelector('pre').textContent = subscriptionJson;
};

// Show a spinner on subscription submission
var changeLoadingState = function(isLoading) {
  if (isLoading) {
    document.querySelector('button').disabled = true;
    document.querySelector('#spinner').classList.add('loading');
    document.querySelector('#button-text').classList.add('hidden');
  } else {
    document.querySelector('button').disabled = false;
    document.querySelector('#spinner').classList.remove('loading');
    document.querySelector('#button-text').classList.remove('hidden');
  }
};
