/**
 * Created by iganbold on 2/15/17.
 */
const
    express = require('express'),
    router = express.Router(),
    config = require('config'),
    request = require('request');

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('fb.appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
    (process.env.MESSENGER_VALIDATION_TOKEN) :
    config.get('fb.validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('fb.pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL) ?
    (process.env.SERVER_URL) :
    config.get('fb.serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
    console.error("Missing Facebook config values");
    process.exit(1);
}

/* GET Facebook webhook. */
router.get('/', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

/* POST Facebook webhook. */
router.post('/', (req, res) => {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach((pageEntry) => {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach((messagingEvent) => {
                if(messagingEvent.optin) {

                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent)
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        res.sendStatus(200);
    }
});

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
        // Just logging message echoes to console
        console.log("Received echo for message %s and app %d with metadata %s",
            messageId, appId, metadata);
        return;
    } else if (quickReply) {
        var quickReplyPayload = quickReply.payload;
        console.log("Quick reply for message %s with payload %s",
            messageId, quickReplyPayload);

        sendTextMessage(senderID, "Quick reply tapped");
        return;
    }

    if (messageText) {
        sendTextMessage(senderID, messageText);
    }
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}


module.exports = router;
