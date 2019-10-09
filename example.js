
const axios = require('axios')

// The primary key in the data the composite of appId + eosAccount. This allows multiple apps to use
//  the service and have different contact info and preferences for the same account.

// Register a new account
axios({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'r6hj3RIR7p3q23WP9wEUZ6wGfxwnL5Oh7incSQJ8' },
  url: 'https://profiles-api.disc.blue/dev/register',
  data: {
    appId: "myApp",
    eosAccount: "samplesample",
    smsNumber: "+18017349653",
    commPref: "SMS"
  }
})
  .then((response) => {
    console.log(response.data)
  })
  .catch((error) => {
    console.error(error)
  });

//  You can later add email address to the same eosAccount
axios({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'r6hj3RIR7p3q23WP9wEUZ6wGfxwnL5Oh7incSQJ8' },
  url: 'https://profiles-api.disc.blue/dev/register',
  data: {
    appId: "myApp",
    eosAccount: "samplesample",
    emailAddress: "sample@sample.com"
  }
})
  .then((response) => {
    console.log(response.data)
  })
  .catch((error) => {
    console.log(error)
  });



//  You can send messages to the eosAccount
axios({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'r6hj3RIR7p3q23WP9wEUZ6wGfxwnL5Oh7incSQJ8' },
  url: 'https://profiles-api.disc.blue/dev/send-msg',
  data: {
    appId: "myApp",
    eosAccount: "samplesample",
    message: "Your order has been accepted. Please transfer funds."
  }
})
  .then((response) => {
    console.log(response.data)
  })
  .catch((error) => {
    console.log(error)
  });


//  Apps can also custom attributes for their app to each profile; this could be used for
//   data or configuration that the user would not want stored on chain
axios({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'r6hj3RIR7p3q23WP9wEUZ6wGfxwnL5Oh7incSQJ8' },
  url: 'https://profiles-api.disc.blue/dev/register',
  data: {
    appId: "myApp",
    eosAccount: "samplesample",
    appAttributes: {
      "dob": "23 May 1998",
      "country": "Nepal"
    }
  }
})
  .then((response) => {
    console.log(response.data)
  })
  .catch((error) => {
    console.log(error)
  });