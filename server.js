/*
 * Copyright (C) 2016 Orange
 *
 * This software is distributed under the terms and conditions of the 'BSD-3-Clause'
 * license which can be found in the file 'LICENSE.txt' in this package distribution
 * or at 'https://opensource.org/licenses/BSD-3-Clause'.
 */
var request = require('request')
var mqtt = require('mqtt')
const urlmqtt = "mqtt://liveobjects.orange-business.com:1883"
const apiKey = "7ef7949fb37c454aa3087f63c276573d"



/** Subscription for one specific device (pub sub) **/
// const mqttTopic = "router/~event/v1/data/new/urn/lora/0123456789ABCDEF/#"

/** Subscription for all devices (pub sub) **/
// const mqttTopic = "router/~event/v1/data/new/urn/lora/#"

/** Subscription for a fifo (persisted) **/
// const mqttTopic = "fifo/default"

//receive the fired events
// const mqttTopic = "router/~event/v1/data/eventprocessing/fired"
const mqttTopic = "router/~event/v1/data/eventprocessing/#"

/** connect **/
console.log("MQTT::Connecting to ");
var client  = mqtt.connect(urlmqtt, {username:"payload", password:apiKey, keepAlive:30})

/** client on connect **/
client.on("connect", function() {
  console.log("MQTT::Connected");

  client.subscribe(mqttTopic)
  console.log("MQTT::Subscribed to topic:", mqttTopic);
})

/** client on error **/
client.on("error", function(err) {
  console.log("MQTT::Error from client --> ", err);
})

/** client on reconnect **/
client.on("reconnect", function(err) {
  console.log("MQTT::reconnect from client --> ", err);
})

/** client on close **/
client.on("close", function(err) {
  console.log("MQTT::close from client --> ", err);
})

/** client on offline **/
client.on("offline", function(err) {
  console.log("MQTT::offline from client --> ", err);
})


client.on("message", function (topic, message) {

  console.log("MQTT::New message\n");
  
  var eventMessage = JSON.parse(message)
  console.log(eventMessage.firingRule.id+' '+eventMessage.timestamp);
  clients.forEach(function(browser) {
    //connection.sendUTF(message.utf8Data);
    browser.sendUTF("MQTT::New event");
  });
  if(eventMessage.firingRule.id=="7806e813-b024-497e-a44d-7d90f2f79d42"){
    console.log("Temp:", eventMessage.matchingContext.data.value.TempCaf); 
	sendNotif("SmartDisplay","@"+eventMessage.timestamp+" Coffee is ready!","https://sdiam.kmt.orange.com/coffee_ready.png");
    clients.forEach(function(browser) {
	  //connection.sendUTF(message.utf8Data);
	  browser.sendUTF(eventMessage.timestamp+" Coffee is ready!");
	});
  }
  if(eventMessage.firingRule.id=="f567fb90-e799-4b9d-99ce-d80bbe629747"){
    console.log("Temp:", eventMessage.matchingContext.data.value.Bruit); 
	sendNotif("SmartDisplay","@"+eventMessage.timestamp+" Coffee break in progress! You're welcome","https://sdiam.kmt.orange.com/coffee_break.png");
    clients.forEach(function(browser) {
	  //connection.sendUTF(message.utf8Data);
	  browser.sendUTF(eventMessage.timestamp+" Coffee break in progress! You're welcome");
	});
  }

})
function sendNotif(titleNotif,textNotif,imgNotif){
  var notif = {};
  notif.accessToken = 'Y2UzODExYThmMzU1ZjU4OTNhYTA1ODA2YjBiODc1MjQzNjkzNmM0ZWZmYWMwNTMxNGVjZmY1NzdjZWMxMGQ2ZA';
  notif.targetSegmentIds = '@ALL';
  var alertBody = {alert:{}};
  alertBody.alert.title = titleNotif;
  alertBody.alert.text = textNotif;
  alertBody.alert.web = {};
  alertBody.alert.web.icon = imgNotif;
  
  var messageNotif = JSON.stringify(alertBody);
  notif.notification = messageNotif;
  console.log("send notification: "+messageNotif);

  request.post({url:'https://api.wonderpush.com/v1/management/deliveries',  form: notif},function (error, response, body) {
  if (!error && response.statusCode >= 200 && response.statusCode <= 204) {
    console.log(body) // Show the HTML for the Google homepage. 
  }
  else {
    console.log("Error "+response.statusCode)
  }
})
}


// web server
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port =  8080;
	
	
var WebSocketServer = require('websocket').server;



var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
    if (request.method == 'POST') {
        console.log("POST");
        var body = '';
        request.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
			if(body.length > 1e6) {
                body = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });
        request.on('end', function () {
          try {
           messageNotif = JSON.parse(body);
		   console.log(messageNotif);
		   sendNotif(messageNotif.titleNotif,messageNotif.textNotif,messageNotif.imgNotif);
          } catch (e) {
           return console.error(e);
          }
            console.log("Body: " + body);
        });
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('post received');
    }
    else
    {
		  var uri = url.parse(request.url).pathname
			, filename = path.join(process.cwd()+'/www/', uri);
		
		  if(uri == "/status"){
			  var status = client.connected;
			  var messageStatus = {"connected": status};
			  var headers = {};
			  headers["Content-Type"] = "application/json";
			  response.writeHead(200, headers);
			  response.write(JSON.stringify(messageStatus));
			  response.end();
			  return;
		  }
		  if(uri == "/subscribe"){
			  
			  client.subscribe(mqttTopic);
			  console.log("MQTT::Subscribed to topic:", mqttTopic);
			  var messageStatus = {"message": "Subscribed to topic"};
			  var headers = {};
			  headers["Content-Type"] = "application/json";
			  response.writeHead(200, headers);
			  response.write(JSON.stringify(messageStatus));
			  response.end();
			  return;
		  }
		  if(uri == "/unsubscribe"){
			  
			  client.unsubscribe(mqttTopic);
			  console.log("MQTT::unSubscribed to topic:", mqttTopic);
			  var messageStatus = {"message": "unSubscribed to topic"};
			  var headers = {};
			  headers["Content-Type"] = "application/json";
			  response.writeHead(200, headers);
			  response.write(JSON.stringify(messageStatus));
			  response.end();
			  return;
		  }
		  var contentTypesByExtension = {
			'.html': "text/html",
			'.css':  "text/css",
			'.js':   "text/javascript",
			'.jpg':  "image/jpg",
			'.png':  "image/png"
		  };

		  fs.exists(filename, function(exists) {
			if(!exists) {
			  response.writeHead(404, {"Content-Type": "text/plain"});
			  response.write("404 Not Found\n");
			  response.end();
			  console.log("404 "+filename);
			  return;
			}

			if (fs.statSync(filename).isDirectory()) filename += '/index.html';

			fs.readFile(filename, "binary", function(err, file) {
			  if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			  }

			  var headers = {};
			  var contentType = contentTypesByExtension[path.extname(filename)];
			  if (contentType) headers["Content-Type"] = contentType;
			  response.writeHead(200, headers);
			  response.write(file, "binary");
			  response.end();
			});
		  });
	}
}).listen(parseInt(port, 10),'0.0.0.0');


wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

var clients = [];

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
	clients.push(connection);
	
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            clients.forEach(function(client) {
			  //connection.sendUTF(message.utf8Data);
			  client.sendUTF(message.utf8Data);
			});
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            clients.forEach(function(client) {
			  //connection.sendBytes(message.binaryData);
			  client.sendBytes(message.binaryData);
			});
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});	

console.log("Static file server running at\n  => http://0.0.0.0:" + port);