require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_verify_token_4745';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(express.json());

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Facebook webhook verification successful!');
        res.status(200).send(challenge);
    } else {
        console.log('❌ Facebook webhook verification failed!');
        res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            entry.messaging.forEach((webhookEvent) => {
                if (webhookEvent.message && !webhookEvent.message.is_echo) {
                    const senderPsid = webhookEvent.sender.id;
                    const receivedMessage = webhookEvent.message;
                    
                    console.log('📨 New message received:');
                    console.log('From User ID:', senderPsid);
                    console.log('Message:', receivedMessage.text || 'Non-text message');
                    console.log('Full message object:', receivedMessage);
                    
                    handleMessage(senderPsid, receivedMessage);
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
            text: `Hello! Thanks for your message: "${receivedMessage.text}". I'm your AI assistant and I'm here to help you!`
        };
    } else if (receivedMessage.attachments) {
        response = {
            text: "Thanks for sending me an attachment! I received it successfully."
        };
    } else {
        response = {
            text: "Thanks for your message! I'm your AI assistant."
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
        console.log('✅ Response sent successfully to user:', senderPsid);
    } catch (error) {
        console.error('❌ Error sending message:', error.response?.data || error.message);
    }
}

app.get('/', (req, res) => {
    res.json({
        status: 'Messenger Bot is running',
        webhook_url: '/webhook',
        verify_token: VERIFY_TOKEN,
        timestamp: new Date().toISOString()
    });
});

app.get('/test', (req, res) => {
    if (!PAGE_ACCESS_TOKEN) {
        return res.json({
            error: 'PAGE_ACCESS_TOKEN not found',
            status: 'failed'
        });
    }
    
    res.json({
        status: 'Bot is ready',
        token_exists: !!PAGE_ACCESS_TOKEN,
        webhook_endpoint: '/webhook'
    });
});

app.listen(PORT, () => {
    console.log('🚀 Server started successfully!');
    console.log(`📍 Server running on port: ${PORT}`);
    console.log(`🔗 Webhook URL: /webhook`);
    console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`);
    console.log('⏰ Server started at:', new Date().toISOString());
    
    if (!PAGE_ACCESS_TOKEN) {
        console.log('⚠️ Warning: PAGE_ACCESS_TOKEN not found in environment variables');
    } else {
        console.log('✅ PAGE_ACCESS_TOKEN found');
    }
    
    console.log('🎯 Ready to receive Facebook messages!');
});