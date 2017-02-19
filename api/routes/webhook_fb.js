/**
 * Created by iganbold on 2/15/17.
 */
const
    express = require('express'),
    router = express.Router(),
    config = require('config'),
    request = require('request'),
    uuidV4 = require('uuid/v4'),
    apiai = require("apiai"),
    requestPromise = require('request-promise');

var User = require('../models/userModel');

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

const APIAI_ACCESS_TOKEN_CLIENT = (process.env.APIAI_ACCESS_TOKEN_CLIENTEN) ?
    (process.env.APIAI_ACCESS_TOKEN_CLIENTEN) :
    config.get('apiai.accessTokenClient');

console.log("TOKEEEEEN: "+APIAI_ACCESS_TOKEN_CLIENT);

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
    console.error("Missing Facebook config values");
    process.exit(1);
}

// var nlp = apiai(APIAI_ACCESS_TOKEN_CLIENT);

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
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
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

    // Check User exist or not
    User.findOne({_id: recipientID}).then((user) => {
        if(user !== null) {
           return user;
        } else {
           return createUser(recipientID).save();
        }
    }).then(user => {
        // if (isEcho) {
        //     // Just logging message echoes to console
        //     console.log("Received echo for message %s and app %d with metadata %s",
        //         messageId, appId, metadata);
        //     return;
        // } else
        if (quickReply) {
            var quickReplyPayload = quickReply.payload;
            console.log("Quick reply for message %s with payload %s",
                messageId, quickReplyPayload);

            sendTextMessage(senderID, "Quick reply tapped");
            return;
        }

        if (messageText) {

            var options = {
                uri:  'https://api.api.ai/v1/query',
                qs: {
                    'v': '20150910',
                    'query': messageText,
                    'lang': 'en',
                    'sessionId': user.session._id
                },
                headers: {
                    'Authorization': 'Bearer '+APIAI_ACCESS_TOKEN_CLIENT
                },
                json: true
            };

            return requestPromise(options);
        }
    }).then(repos => {

        for(var i =0 ; i< repos.result.contexts.length; i++ ) {
            console.log(repos.result.contexts[i]);
        }

        handleActions(senderID, repos.result.fulfillment.speech, repos.result.action);
    }).catch(err => {
        console.log("Error whil checking user and session: "+err);
    });
}

function handleActions(senderID, reply, action){
    console.log("ACTIONOOOON: "+action);
    switch(action) {
        case 'input.welcome':
            sendGifMessage(senderID, "https://scontent.xx.fbcdn.net/v/t34.0-12/16729922_1575661999127760_804082988_n.gif?oh=f9029a8dac28bcae0b923cef4f0c0aee&oe=58ABF7CB");
            sendTextMessage(senderID, reply);
            break;
        case 'input.location':
            // sendTextMessage(senderID, reply);
            // showMenu(senderID);
            break;
        case 'input.menu':
            // sendTextMessage(senderID, reply);
            break;
        default:
            // sendTextMessage(senderID, reply);
    }
}


function showMenu(senderID) {
    var messageData = {
        recipient: {
            id: senderID
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "menu",
                    elements: [
                        {
                            "title":"Welcome to Peter\'s Hats",
                            "image_url":"https://petersfancybrownhats.com/company_image.png",
                            "subtitle":"We\'ve got the right hat for everyone.",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://peterssendreceiveapp.ngrok.io/view?item=103",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                            },
                            "buttons":[
                                {
                                    "type":"web_url",
                                    "url":"https://petersfancybrownhats.com",
                                    "title":"View Website"
                                },{
                                    "type":"postback",
                                    "title":"Start Chatting",
                                    "payload":"DEVELOPER_DEFINED_PAYLOAD"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function getQuantity(recipientId){
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "quantity",
                    elements: []
                }
            }
        }
    };

    for (var i=1; i<11; i++) {
        messageData.message.attachment.payload.elements.push({
            title: i,
            buttons: [{
                "type": "postback",
                "title": "Select",
                "payload": "SELECT_FOOD_" + i
            }]
        });

    }

    callSendAPI(messageData);

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

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

    switch (payload) {
        case 'GET_STARTED_BUTTON':
            sendTextMessage(senderID, "Hello. I am YumYum BOT");
            sendQuickReply(senderID);
            break;
        default:
            sendTextMessage(senderID, "I could not understand Postback");

    }

    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    // sendTextMessage(senderID, "Postback called");
}

function sendGifMessage(recipientId, url) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: url
                }
            }
        }
    };

    callSendAPI(messageData);
}

function sendQuickReply(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Whould you like to order a food?",
            quick_replies: [
                {
                    "content_type":"text",
                    "title":"Menu",
                    "payload":"QUICK_REPLY_MENU"
                }
            ]
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

function createUser(recipientID) {
    return new User({_id: recipientID, session : {_id: uuidV4(), current_stage: 'input.welcome'}});
}

module.exports = router;
