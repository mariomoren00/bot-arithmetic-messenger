'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const fs = require('fs')

// Declare token facebook
const APP_TOKEN = 'EAAEvc9HEf8kBAD7Aw9guZA80cP2YhzRNsT4ZAOH9asaHLngQzdlFEZB8M8WgwDP1QXvfNXqcUNtzyjcQ4vMOT2fKW2a6sX5nwuBh3LZCVSZAxSZAAmPn0WAU8RaLAREAABDqToqTbMeXFSqgMYjPEHVhI58G3vqOk566C99JcKZAhB5PY99dxFg';

var app = express()

// Declare folder path 
const folderPath = __dirname + '/app'

// Parse incoming requests
app.use(bodyParser.json())

// Declare port 
var PORT = process.env.PORT || 4000;

// Mount your static paths
// Renders your image, title, paragraph and index.html
app.use(express.static(folderPath))

// Start the server.
app.listen(PORT,function(){
	console.log('Listening localhost:4000')
})

// Read file index and send 
app.get('/',function(req, res){
	res.sendFile(path.join(__dirname + '/index.html'));
})

// Request with method get to webhook 
app.get('/webhook',function(req, res){
	if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === 'hello_token') {
		console.log("Validating webhook");
	res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
	res.sendStatus(403);          
	}  
})

// Request with method post to webhook
app.post('/webhook',function(req, res){
	var data = req.body
	if(data.object == 'page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(event){
				if(event.message){
					console.log("Webhook received unknown event: ", event);					
					getMessage(event)
				}
			})
		})
	}
	res.sendStatus(200)
})

// Get text messages
function getMessage(messagingEvent){
	var senderID = messagingEvent.sender.id
	var messageText = messagingEvent.message.text
	evaluateTextMessage(senderID, messageText)
}

// Evaluate text message
function evaluateTextMessage(senderID, messageText){
	var expr = messageText;
	
	//convertir minusculas
	var tocase = expr.toLowerCase();
	console.log(tocase);

	var cleanText = tocase.replace(/\s/g,"");
	console.log(cleanText);

	var inicio = expr.lastIndexOf('=');
	console.log('inicio', inicio);

	var fin = expr.length;
	console.log('fin', fin);

	var operacion = expr.substring(0, inicio);
	console.log('operacion:', operacion);

	
	switch (operacion) {
		case "suma":
			var entre = expr.lastIndexOf('+');
			console.log('entre', entre);

			var a = expr.substring(inicio+1, entre);
			var b = expr.substring(entre+1, fin);
			
			console.log(a,b);
			
			var va = parseInt(a);
			var vb = parseInt(b);
			var result = va+vb;

			SendTextMessage(senderID, ("Resultado de la suma es: "+ result));
		break;
		case "resta":
			var entre = expr.lastIndexOf('-');
			console.log('entre', entre);

			var a = expr.substring(inicio+1, entre);
			var b = expr.substring(entre+1, fin);
			
			console.log(a,b);
			
			var va = parseInt(a);
			var vb = parseInt(b);
			var result = va-vb;

			SendTextMessage(senderID, ("Resultado de la resta es: "+ result));
		break;
		case "divicion":
			var entre = expr.lastIndexOf('/');
			console.log('entre', entre);

			var a = expr.substring(inicio+1, entre);
			var b = expr.substring(entre+1, fin);
			
			console.log(a,b);
			
			var va = parseInt(a);
			var vb = parseInt(b);
			var result = va/vb;

			SendTextMessage(senderID, ("Resultado de la divición es: "+ result));
		break;
		case "multiplicacion":
			var entre = expr.lastIndexOf('*');
			console.log('entre', entre);

			var a = expr.substring(inicio+1, entre);
			var b = expr.substring(entre+1, fin);
			
			console.log(a,b);
			
			var va = parseInt(a);
			var vb = parseInt(b);
			var result = va*vb;

			SendTextMessage(senderID, ("Resultado de la multiplicación es: "+ result));
		break;
		default:
			SendTextMessage(senderID, "No puedo ayudarte con esa operación :( ");
	}	
}

// Send text message
function SendTextMessage(senderID, message){
	var messageData = {
		recipient : {
			id: senderID
		},
		message: {
			text: message
		}
	}
	callSendApi(messageData)
}

// Calling API to send message
function callSendApi(messageData){
	request({
		uri: 'https://graph.facebook.com/v2.9/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData
	},function(error, response, body){
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	})
}

function toLowerCase(expr){

}

function remplaceSpace(expr){

}


function evaluateOperation(expr, signo){
	
}


