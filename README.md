# Project People & Profile Backend Services

Provides the backend services for the profile service.

- [Project People & Profile Backend Services](#project-people--profile-backend-services)
  - [Technologies](#technologies)
  - [Important Files](#important-files)
  - [Lambda functions](#lambda-functions)
    - [**Authentication**](#authentication)
      - [create-auth-challenge](#create-auth-challenge)
      - [define-auth-challenge](#define-auth-challenge)
      - [pre-sign-up](#pre-sign-up)
      - [verify-auth-challenge](#verify-auth-challenge)
    - [**Application management**](#application-management)
      - [delete-app](#delete-app)
      - [get-apps](#get-apps)
      - [get-my-apps](#get-my-apps)
      - [register-app](#register-app)
    - [**OAuth management**](#oauth-management)
      - [get-access-token](#get-access-token)
      - [get-authorization-code](#get-authorization-code)
      - [get-authorization-request-context](#get-authorization-request-context)
      - [oauth-authorizer](#oauth-authorizer)
      - [oauth-handle-app-updates](#oauth-handle-app-updates)
      - [update-app-oauth-status](#update-app-oauth-status)
      - [revoke-access](#revoke-access)
    - [**Profile management**](#profile-management)
      - [get-profile](#get-profile)
      - [get-profiles](#get-profiles)
      - [register](#register)
      - [search-profiles](#search-profiles)
      - [verify-otp](#verify-otp)
    - [**Messaging**](#messaging)
      - [get-chats](#get-chats)
      - [get-messages](#get-messages)
      - [send-message](#send-message)
  - [Deployment](#deployment)
## Technologies

- **Compute**: Each of the services/endpoints runs as a [AWS Lambda](https://aws.amazon.com/lambda/)
- **Persistence**: [DynamoDB](https://aws.amazon.com/dynamodb) is used for storage
- **Messaging**: For emails and SMSs [Twilio](https://www.twilio.com/) is leveraged
- **Deployment**: [Serverless framework](https://www.serverless.com/) is used for IaC definition and deployment

## Important Files

- **serverless.yml**: Defines de IaC and all configuration related to the serveless framework, it also maps the javascript functions to lambda endpoints
- **resources/**: Imported by the serverless.yml file and they define additional required resources:
  - *-table.yml: DynamoDB tables
  - cognito-user-pool.yml: Defines the user pool that is used to authenticate ppp users
  - cognito-identity-pool.yml: Defines the cognito roles and authorities that a users can have
  - api-gateway-errors.yml: Defines gateway response errors and enables cors for them
  - s3-bucket.yml: Defines the S3 bucket where profile images are stored
- **auth-verifiers/ const/ domain/ error/ service/ util/**: Contain the javascript classes and services used by the lambda functions
- **mocks/**: Contains payload mocks to test the functions
## Lambda functions

### **Authentication**
Describes the functions used to authenticate the user to the ppp backend services
#### create-auth-challenge
Creates the authentication code that the user needs to store in the login contract table during the authentication process

#### define-auth-challenge
Handles the different stages of the authentication challenge process

#### pre-sign-up
Sets the autoconfirm user configuration to true

#### verify-auth-challenge
Verifies that the user correctly answered the authentication challenge, meaning that the user was able to store the auth challenge code in the login table

### **Application management**
Describes the functions used to manage the applications that are able to access the profile service
#### delete-app
Deletes the specified application from the apps table
- Type: POST
- Request body properties:
  - orginAppId: The id of the app making the request
  - appId: The id of the app to delete
#### get-apps
Returns the details of the specified apps
- Type: POST
- Request body properties:
  - orginAppId: The id of the app making the request
  - appIds: Array of appIds to return details for
- Response properties:
  - appId: Id of the app
  - icon: App icon url
  - name: App name
  - shortName: App short name
  - type: Indicates the type of application, whether its web based or not see @smontero/ppp-common/AppTypes
  - oauthStatus: Whether the oauth is enabled for the app see @smontero/ppp-common/OauthAppStatus
#### get-my-apps
Returns apps owned by the logged in user
- Type: POST
- Request body properties:
  - orginAppId: The id of the app making the request
- Response properties:
  - appId: Id of the app
  - icon: App icon url
  - name: App name
  - shortName: App short name
  - type: Indicates the type of application, whether its web based or not see @smontero/ppp-common/AppTypes
  - oauthStatus: Whether the oauth is enabled for the app see @smontero/ppp-common/OauthAppStatus

#### register-app
Enables a user to register an app, in the case of a web app it leverages the chain-manifests.json file stored in the web server to validate that the user is the actual owner of the app, and reads the app-metadata.json file to pull more information about the app
- Type: POST
- Request body properties:
  - orginAppId: The id of the app making the request
  - baseUrl: The app url, for apps of type Web App
  - icon: App icon url, for non web apps only, for web apps it is pulled from the app-metadata.json file
  - name: App name, for non web apps only, for web apps it is pulled from the app-metadata.json file
  - shortName: App short name, for non web apps only, for web apps it is pulled from the app-metadata.json file
  - type: Indicates the type of application, whether its web based or not see @smontero/ppp-common/AppTypes
  - oauthRedirectUrls: In case oauth is enabled for this app

### **OAuth management**
Describes the functions used to manage oauth configuration and access
#### get-access-token
Returns an oauth access token for a specific authorization code or refresh token
- Type: GET OR POST
- Request body/query properties:
  - grant_type: Whether an authorization code (authorization_code) or a refresh token(refresh_token) is being used to get an access token 
  - code: authorization code, if grant_type is authorization_code
  - refresh_token: refresh token, if grant_type is refresh token
  - client_id: The client id associated to the app making the request
  - client_secret: The client secret associated to the app making the request
  - redirect_uri: The uri where the app should be redirected to when providing the access token
- Response properties:
  - access_token: the access token
  - refresh_token: refresh token to be used to get a new access token when this one expires
  - id_token: JWT containing information about the user
  - token_type: the token type, always "Bearer"
  - expires_in: token time to live in minutes

#### get-authorization-code
Handles oauth authorization code requests, this is the first step on the oauth authentication process, the authorization code returned by this service can be used to ask for an access token
- Type: POST
- Request body properties:
  - response_type: The type of the response, "code" is the only supported option
  - client_id: The client id associated to the app making the request
  - scope: The scopes/permissions the app is requesting
  - redirect_uri: The uri where the app should be redirected to when providing the access token
- Response properties:
  - appId: the id of the app that made the request
  - eosAccount: the eosAccount of the user that is login in
  - scopes: the scopes that the user accepted to
  - redirectUri: The uri where the app should be redirected to when providing the authorization code
  - hasRedirectUriParam: Whether a redirect_uri param was sent in the request
  - authorizationCodeExpiration: Indicates when the authorization code expires
  - authorizationCode: The authorization code
  - createdAt: The creation time of the authorization code
  - oauthTokenStatus: the oauth token status, valid is always returned

#### get-authorization-request-context
Provides oauth details configured for the specified app, and enables the validation of scopes to be requested
- Type: GEt
- Request query properties:
  - response_type: The type of the response, "code" is the only supported option
  - client_id: The client id associated to the app making the request
  - scope: The scopes/permissions the app is requesting
  - redirect_uri: The uri where the app should be redirected to when providing the access token
- Response properties:
  - appId: Id of the app
  - icon: App icon url
  - name: App name
  - shortName: App short name
  - type: Indicates the type of application, whether its web based or not see @smontero/ppp-common/AppTypes
  - oauthStatus: Whether the oauth is enabled for the app see @smontero/ppp-common/OauthAppStatus
  - scopes: The valid scopes

#### oauth-authorizer
Authorizer function, the processes all requests using the oauth authentication method to validate that the provided access token is valid.

#### oauth-handle-app-updates
Listens for dynamoDB app table change events, and based on the app change determines if it needs to revoke oauth access tokens for the application

#### update-app-oauth-status
Allows app owner to enable/disable oauth for their app
- Type: POST
- Request body properties:
  - appId: the id of the app to change the oauth status for
  - enable: whether to enable/disable oauth for the app

#### revoke-access
Revokes the oauth access that an app has to the profile of the logged in account
- Type: POST
- Request body properties:
  - appId: the appId to revoke access for

### **Profile management**
Describes the functions used to manage user profiles
#### get-profile
Returns the profile of the logged in user
- Type: POST
- Request body properties:
  - fetch_type: Indicates the scope of data to return, whether to return only base profile data, or also app specific profile related data, see @smontero/ppp-common/FetchTypes
- Response: Depends on the stored information for the user and fetch type, but some basic properties are:
  - eosAccount: the users eos account
  - commPref: the users communication preference
  - emailInfo: Email related information
  - smsInfo: SMS related information

#### get-profiles
Returns the profiles for the specified eos accounts, only public information is returned
- Type: POST
- Request body properties:
  - eosAccounts: Array of eosAccounts to return profile data for
  - fetch_type: Indicates the scope of data to return, whether to return only base profile data, or also app specific profile related data, see @smontero/ppp-common/FetchTypes
- Response: Depends on the stored information for the users and fetch type

#### register
Handles the creation and updating of a user profile
- Type: POST
- Request body properties:
  - smsNumber: users mobile phone number
  - emailAddress: users email address
  - commPref: the users communication preference
  - appData: User profile data specific to the app the user is logged into
- Response: Depends on the stored information for the user, but some basic properties are:
  - eosAccount: the users eos account
  - commPref: the users communication preference
  - emailInfo: Email related information
  - smsInfo: SMS related information

#### search-profiles
Enables the search of profiles by eos account
- Type: POST
- Request body properties:
  - appId: In case the fetchType is BASE_AND_APP, the app to return data for
  - fetchType: Indicates the scope of data to return, whether to return only base profile data, or also app specific profile related data, see @smontero/ppp-common/FetchTypes
  - limit: the max number of results to return
  - lastEvaluatedKey: Where to start to return results from
  - search: the start of the eos account name to search for
- Response: Depends on the stored information for the users, app and fetch type

#### verify-otp
Validates the communication verification code sent to the user via email or sms
- Type: POST
- Request body properties:
  - smsOtp or emailOtp: The verification code

### **Messaging**
Describes the functions used to manage user chat functionality
#### get-chats
Enables the search of active chats the logged in user has, by returning the last messages sent with users whose eos account fit the search
- Type: POST
- Request body properties:
  - limit: the max number of results to return
  - lastEvaluatedKey: Where to start to return results from
  - search: the start of the eos account name to search for
- Response:
  - eosAccount: the eosAccount who sent the message
  - counterPartyAccount: the eos account who received the message
  - message: the last message between the users
  - sentAt: the timestamp when the message was sent

#### get-messages
Enables the retrieval of the message history between 2 users
- Type: POST
- Request body properties:
  - limit: the max number of results to return
  - lastEvaluatedKey: Where to start to return results from
  - eosAccount2: the eos account of the counter party
- Response:
  - senderAccount: the eosAccount who sent the message
  - eosAccount: the eos account who received the message
  - message: the message
  - sentAt: the timestamp when the message was sent

#### send-message
Enables the sending of a message to another user
- Type: POST
- Request body properties:
 - eosAccount: the eos account to whom to send the message
 - message: the message

## Deployment

Install serverless:

`npm install -g serverless`

Deploy to dev:

`serverless deploy --verbose -s dev --aws-profile=telos-net-dev`

Deploy to prod:

`serverless deploy --verbose -s prod --aws-profile=telos-net-prod`

Make sure you have configured the aws profile with the aws cli