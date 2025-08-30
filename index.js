require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_verify_token_4745';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(express.json());

app.get('/messaging-webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/messaging-webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            entry.messaging.forEach((webhookEvent) => {
                if (webhookEvent.message && !webhookEvent.message.is_echo) {
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
    let response;

    if (receivedMessage.text) {
        response = {
            text: "Hello! Thanks for your message. I'm your AI assistant."
        };
    } else {
        response = {
            text: "Thanks for sending me a message!"
        };
    }

    await sendMessage(senderPsid, response);
}

async function sendMessage(senderPsid, response) {
    const requestBody = {
        recipient: {
            id: senderPsid
        },
        message: response
    };

    try {
        await axios.post(
            `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            requestBody
        );
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

app.get('/', (req, res) => {
    res.send('Messenger Bot is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});