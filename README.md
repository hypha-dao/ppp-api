# Digital Scarcity contact API

- Includes ability to register EOS accounts with communication preferences
- Includes ability to send messages to EOS accounts off chain based on their preferences

# Usage information

To register a new contact, you can use: 

/register

If registering an SMS number to a contact, smsNumber and eosAccount are required.
If registering an email address to a contact, emailAddress and eosAccount are required. 
A value for "commPref" may also be provided. Values should be either "EMAIL" or "SMS".

To send a message, use: 

/send-msg

The eosAccount and message parameters are required. The service will find the eosAccount, determine their communication preferences and the messages accordingly. 

see examples.js for example usage

- [x] support for Email and SMS
- [x] support for Email subject lines
- [x] support for adding contact types to an existing contact record
- [x] add support for custom app attributes on each contact
- [ ] add support for Twitter, Telegram, and other communication methods

# Current end point info and test API key
https://profiles-api.disc.blue/dev/

r6hj3RIR7p3q23WP9wEUZ6wGfxwnL5Oh7incSQJ8