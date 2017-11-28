'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const fs = require('fs')

// Declare token facebook
const APP_TOKEN = 'EAAEvc9HEf8kBAJ3zj6dgKmiZAZCfgzfUwFzExGnnRIQeyMMcdtgV44CuIx9e4qAWcQnuGaz6Lf9gCOya4JnqROp0uLIgaH4G2f4VOpsDQwUNRGL0qikSeXUS2KZBhZCa1JNaWx5jD2d0fPQxnVkGRVYcniMdu3yDBqLva1r2ZC1YLbiGHMpZBj';

var app = express()

// Declare folder path 
const folderPath = __dirname + '/app'

// Parse incoming requests
app.use(bodyParser.json())

// Declare port 
var PORT = process.env.PORT || 3000;

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
	let operation = "";
	let result = 0;	
	let expr = messageText;

	console.log(expr);
	
	//convertir minusculas y quitar espacios en blanco
	expr = expressionWord(expr);

	//obtener el tipo de operación a resolver
	operation = getOperation(expr);	
		
	switch (operation) {
		case "suma":
			result = evaluateOperation(expr, '+');
			SendTextMessage(senderID, ("Resultado de la suma es: "+ result));
		break;
		case "resta":
			result = evaluateOperation(expr, '-');
			SendTextMessage(senderID, ("Resultado de la resta es: "+ result));
		break;
		case "division":
			result = evaluateOperation(expr, '/');
			SendTextMessage(senderID, ("Resultado de la división es: "+ result));
		break;
		case "multiplicacion":
			result = evaluateOperation(expr, '*');
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

function expressionWord(expr){
	let word = expr.toLowerCase().replace(/\s/g, '');
	console.log(word);
	return word;
}

function getOperation(expr){
	let inicio = expr.lastIndexOf('=');
	console.log('inicio', inicio);

	let operation = expr.substring(0, inicio);
	console.log('operation:', operation);

	return operation;
}

function evaluateOperation(expr, signo){
	let result = 0;

	let inicio = expr.lastIndexOf('=');
	console.log('inicio', inicio);

	let entre = expr.lastIndexOf(signo);
	console.log('entre', entre);

	let fin = expr.length;
	console.log('fin', fin);

	let a = expr.substring(inicio+1, entre);
	let b = expr.substring(entre+1, fin);
	
	console.log(a,b);
	
	a = parseInt(a);
	b = parseInt(b);

	switch (signo) {
		case "+":
			result = a + b;
		break;
		case "-":
			result = a - b;
		break;
		case "*":
			result = a * b;
		break;
		case "/":
			result = a / b;
		break;
	}

	console.log(result);

	return result;
	
}


