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
var Food = require('../models/foodModel');
var deliveryLocation = require('../models/deliveryModel');
var userOrder = require('../models/orderModel');

var order = {
    _id: String, // Order Id
    userId: String,
    foodId: String,
    qty: Number,
    date: String,
    total: Number // Final Amount
};

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
        // } else if (quickReply) {
        //     var quickReplyPayload = quickReply.payload;
        //     console.log("Quick reply for message %s with payload %s",
        //         messageId, quickReplyPayload);
        //
        //     sendTextMessage(senderID, "Quick reply tapped");
        //     return;
        // }

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
        console.log(repos);
        console.log(senderID);
        console.log(repos.result.action);
        console.log(repos.result.parameters.address);
        if(repos.result.action == 'input.location'){

            if(repos.result.parameters.address && repos.result.parameters.zipcode){
                console.log(repos.result.parameters.address);
                console.log(repos.result.parameters.zipcode);
                updateAddress(senderID, repos.result.parameters.address, repos.result.parameters.zipcode);
            }
        }

        if(repos.result.action == 'input.food' && repos.result.parameters.quantity){
            order.qty = repos.result.parameters.quantity;
            order.total = order.foodId.price * order.qty;
        }
        // console.log(repos.result.fulfillment.speech);
        // sendTextMessage(senderID, repos.result.fulfillment.speech);
        handleActions(recipientID,senderID, repos.result.fulfillment.speech, repos.result.action);
    }).catch(err => {
        console.log("Error whil checking user and session: "+err);
    });
}


function handleActions(recipientID, senderID, reply, action){
    console.log("ACTIONOOOON: "+action);
    switch(action) {
        case 'input.welcome':
            //sendGifMessage(senderID, "https://scontent.xx.fbcdn.net/v/t34.0-12/16729922_1575661999127760_804082988_n.gif?oh=f9029a8dac28bcae0b923cef4f0c0aee&oe=58ABF7CB");
            sendTextMessage(senderID, reply);
            break;
        case 'input.location':
            sendTextMessage(senderID, reply);
            showMenu(senderID);
            break;
        case 'input.menu':
            //sendTextMessage(senderID, reply);
            break;
        case 'input.food':
            sendTextMessage(senderID, reply);
            //getQuantity(recipientID, senderID);
            break;
        case 'input.confirm':
            sendTextMessage(senderID, reply);
            showReceipt(senderID);
            break;
        case 'input.add':
            showMenu(senderID);
            break;
        case 'input.added':
            sendTextMessage(senderID, reply);
            break;
        case 'input.checkout':
            placeOrder(senderID);
            break;
        case 'input.cancel':
            //set all values to null and delete order from db
            break;
        case 'input.updateLocation':
            //update location
            break;
        default:
            sendTextMessage(senderID, reply);
    }
}

function showMenu(recipientId) {

    console.log("Iam in show menu");

    Food.find().then((food)=> {
        if(food){

        console.log("Food is available");
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: []
                    }
                }
            }
        };

        for (var i = 0; i < food.length; i++) {
            console.log(food[i].name);
            messageData.message.attachment.payload.elements.push({
                title: food[i].name,
                subtitle: food[i].desc,
                image_url: food[i].img,
                buttons: [{
                    "type": "postback",
                    "title": "Select Item",
                    "payload": "1 "+food[i]._id
                }, {
                    type: "postback",
                    title: "$"+food[i].price,
                    payload: "DEVELOPER_DEFINED_PAYLOAD",
                }]


            })
        }

    callSendAPI(messageData);

    }
    else console.log("Food does not exists");
    });
}

function showReceipt(recipientID) {
    var userName = null,
        orderId = 0,
        timeStamp = null,
        addr = {},
        total = 0;

    console.log("In Receipt");

    User.findOne({_id: recipientID}).then((user) => {
       if(user){
           userName=user.name
       }
    }).then((data) =>{
        userOrder.find({userId: recipientID}).then((order) => {
            orderId = order._id;
            timeStamp = order.date;
            total = order.amt;
        }).then((user)=>{
            deliveryLocation.find({id: recipientID}.then((loc)=>{
                addr = {
                    zip: loc.zip,
                    state : loc.state,
                    city: loc.city
                }
            }))
        })
    }).then((response) =>{
        console.log(uname);
        console.log(orderId);
        console.log(timeStamp);
        console.log(addr);
        console.log(total);

        /*var messageData = {
            recipient: {
                id: recipientId
            },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "receipt",
                        "recipient_name": uname,
                        "order_number": orderId ,
                        "currency": "USD",
                        "payment_method": "Visa 2345",
                        // "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                        "timestamp": timeStamp,
                        "elements": [],
                        "address": {
                            "street_1": "1 Hacker Way",
                            "street_2": "",
                            "city": "Menlo Park",
                            "postal_code": "94025",
                            "state": "CA",
                            "country": "US"
                        },
                        "summary": {
                            "subtotal": 75.00,
                            "shipping_cost": 4.95,
                            "total_tax": 6.19,
                            "total_cost": 56.14
                        },
                        "adjustments": [
                            {
                                "name": "New Customer Discount",
                                "amount": 20
                            },
                            {
                                "name": "$10 Off Coupon",
                                "amount": 10
                            }
                        ]
                    }
                }
            }
        };

        for(var item in Order){
            messageData.message.attachment.payload.elements.push({
                "title": "Classic White T-Shirt",
                "subtitle": "100% Soft and Luxurious Cotton",
                "quantity": 2,
                "price": 50,
                "currency": "USD",
                "image_url": "http://petersapparel.parseapp.com/img/whiteshirt.png"
            })
        }*/

        callSendAPI(messageData);
    });
}

function getQuantity(recipientID, senderID){
    var messageData = {
        recipient: {
            id: recipientID
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
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
                "payload": "2 " + i
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

function queryAPI(recipientID, senderID,queryMsg){
    User.findOne({_id: recipientID}).then((user) => {
        if(user !== null) {
            return user;
        }
    }).then(user => {
        if (queryMsg) {
            var options = {
                uri:  'https://api.api.ai/v1/query',
                qs: {
                    'v': '20150910',
                    'query': queryMsg,
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
        console.log(repos);
        console.log(repos.result.action);
        sendTextMessage(senderID, repos.result.fulfillment.speech);
    }).catch(err => {
        console.log("Error whil checking user and session: "+err);
    });

}

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;
    console.log(payload);

    order.userId = senderID;
    if(payload.split(" ")[0] == "1"){
        console.log(payload.split(" ")[1]);
        order.foodId = payload.split(" ")[1];
        queryAPI(recipientID,senderID, "selected");

    }
    else if(payload.split(" ")[0] == "2"){
        console.log(payload.split(" ")[1]);
        order.qty = payload.split(" ")[1];
    }

    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    // sendTextMessage(senderID, "Postback called");
}

function sendGifMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: SERVER_URL + "/assets/instagram_logo.gif"
                }
            }
        }
    };

    callSendAPI(messageData);
}

function updateAddress(recipientId, addr, zipcode){
    var location = new deliveryLocation({
        id: recipientId,
        zip: zipcode,
        address: addr

    });

    location.save(function (err, item) {
        if (err) return console.error(err);
        console.log("address inserted successfully");
    });

    //send confirmation to user
}

function placeOrder(recipientId){
    var date = new Date();
    var getDatetime = Math.floor(date.getTime()/1000);
    var myOrder = new userOrder({
        userId: recipientId,
        foodId: order.foodId,
        qty: order.qty,
        date: getDatetime,
        total: order.foodId.price * (order.qty)
    });

    myOrder.save(function (err, item) {
        if (err) return console.error(err);
        console.log("Order placed successfully");
    });

    sendTextMessage(recipientId,"Your order has been placed.");
    //send confirmation to user
}

function updateUserStage(recipientId, sessionId, currentUserStage){
    var userStage = new User({
        _id : recipientId,
        session: {
            _id: sessionId,
            currentStage: currentUserStage
        }
    });

    userStage.save(function (err, item) {
        if (err) return console.error(err);
        console.log("User Stage successfully updated");
    });

    //post updatetion if needed
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
