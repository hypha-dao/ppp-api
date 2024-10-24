import twilio from 'twilio';
import sgMail from '@sendgrid/mail';


class CommApi {

    constructor() {
        const accountSid = process.env.twilioAccountSid; // Your Account SID from www.twilio.com/console
        const authToken = process.env.twilioAuthToken;   // Your Auth Token from www.twilio.com/console
        try {
            this.twilio = new twilio(accountSid, authToken);
        } catch (error) {
            console.error("Twilio exception " + error + " accountSid " + accountSid);
        }
    }

    async sendEmail(emailAddress, subject, message) {

        //  CODE FOR USING AWS SIMPLE EMAIL SERVICE  
        //
        // // const ses = new AWS.SES({
        //   region: 'us-east-1' // Set the region in which SES is configured
        // });
        // let template_data = {}
        // template_data.emailOtp = emailOtp
        // const emailParams = {
        //   Template: 'GyftieEmailOTP',
        //   Destination: {
        //     ToAddresses: [
        //       data.emailAddress
        //     ]
        //   },
        //   Source: 'max.gravitt@gmail.com',
        //   TemplateData: JSON.stringify(template_data || {})
        // }
        // const emailResponse = await ses.sendTemplatedEmail(emailParams).promise();

        console.log(" Sending mail to: ", emailAddress);
        sgMail.setApiKey(process.env.sendGridKey);
        const msg = {
            to: emailAddress,
            from: 'noreply@noreply.io',
            subject: subject,
            text: message
        };
        console.log(" Sending Email    : ", msg)
        return await sgMail.send(msg);
    }

    async sendSMS(smsNumber, message) {
        return await this.twilio.messages.create({
            body: message,
            to: smsNumber,
            from: '+14158493843' // From a valid Twilio number
        });
    }

}

export default new CommApi();


// export async function sendVoice(voiceNumber, otp) {
//     const accountSid = process.env.twilioAccountSid; 
//     const authToken = process.env.twilioAuthToken;   

//     const client = new twilio(accountSid, authToken);

//     return await client.calls.create({
//         url: `${process.env.sendVoiceOTPEndpoint}/voice-code-response/${otp}`,
//         to: voiceNumber, 
//         from: '+14158493843' // From a valid Twilio number
//       })
// }

