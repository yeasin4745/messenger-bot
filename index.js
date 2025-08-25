require('dotenv').config();


const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;


const VERIFY_TOKEN = 'my_verify_token_123';
let PAGE_ACCESS_TOKEN=process.env.PAGE_ACCESS_TOKEN
// Middleware
app.use(bodyParser.json());

// Webhook verification
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verified successfully!');
            res.status(200).send(challenge);
        } else {
            console.log('Verification failed');
            res.sendStatus(403);
        }
    }else{
     res.sendStatus(403)
}

});

// Webhook event handler
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            const webhookEvent = entry.messaging[0];
      //      console.log('Received message:', webhookEvent);

            const senderPsid = webhookEvent.sender.id;

            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Message handler function
function handleMessage(senderPsid, receivedMessage) {
    let response;

    if (receivedMessage.text) {
      response = {
      text: `hello ! Iam your personal ai aissistant 🌟 . your ID: ${senderPsid}`
        };

    callSendAPI(senderPsid, response);
}

// Send message to Facebook
function callSendAPI(senderPsid, response) {
    const requestBody = {
        recipient: {
            id: senderPsid
        },
        message: response
    };

    axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody)
        .then(() => {
            console.log('Message sent successfully!');
        })
        .catch((error) => {
            console.error('Error sending message:', error.response?.data || error.message);
        });
}




// Health check endpoint
app.get('/', (req, res) => {
    res.send(`
        <h1>🤖 Facebook Messenger Webhook</h1>
        <p>✅ Server is running on port ${PORT}</p>
        <p>🔗 Webhook URL: /webhook</p>
        <p>🔑 Verify Token: ${VERIFY_TOKEN}</p>
    `);
});


// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Webhook URL: /webhook`);
    console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`);
    console.log(`📱 Ready to receive Facebook messages!`);
});


//module.exports = app;
