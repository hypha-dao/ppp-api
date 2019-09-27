import twilio from 'twilio';

export async function main(event, context) {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    let message = event.pathParameters.voiceMsg.split("").join("  ");
    twiml.say({ voice: 'Polly.Matthew', rate: "68%", loop: "3" }, message);
      
    // Render the response as XML in reply to the webhook request
    // response.type('text/xml');
    // response.send(twiml.toString());

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Content-Type": "text/xml"
        },
        body: twiml.toString()
    }
}
