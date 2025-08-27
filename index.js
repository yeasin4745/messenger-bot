require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = 'my_verify_token_4745';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(express.json());

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully!');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            entry.messaging.forEach((webhookEvent) => {
                if (webhookEvent.message) {
                    const senderPsid = webhookEvent.sender.id;
                    handleMessage(senderPsid, webhookEvent.message);
                }
            });
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

async function handleMessage(senderPsid, receivedMessage) {
    if (receivedMessage.text) {
        const response = {
            text: `hello ! Iam your personal ai aissistant 🌟 . your ID: ${senderPsid}`
        };
        await callSendAPI(senderPsid, response);
    }
}

async function callSendAPI(senderPsid, response) {
    const requestBody = {
        recipient: {
            id: senderPsid
        },
        message: response,
        messaging_type: 'RESPONSE'
    };

    try {
        await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
        console.log('Message sent successfully!');
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
    }
}

app.get('/', (req, res) => {
    res.send('server is running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Webhook URL: /webhook`);
    console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`);
    console.log(`📱 Ready to receive Facebook messages!`);
});
