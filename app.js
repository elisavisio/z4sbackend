/*
 * Copyright (C) 2017 Orange
 *
 */
var liveobjects = require("./liveobjects_api.js")

/** MQTT client */
var request = require('request')
var mqtt = require('mqtt')
const urlmqtt = "mqtt://liveobjects.orange-business.com:1883"
const apiKey = "0d1bde96f14e4e7b926a10ff5f3b3b7a"

const routesTopic = { "router/~event/v1/data/new": 0, "router/~event/v1/data/eventprocessing/#": 0, "router/~event/v2/assets/#": 0 }
/** connect **/
console.log("MQTT::Connecting to ");
var client = mqtt.connect(urlmqtt, { username: "payload", password: apiKey, keepAlive: 30 })

/** client on connect **/
client.on("connect", function () {
    console.log("MQTT::Connected");
    client.subscribe(routesTopic)
    console.log("MQTT::Subscribed to topic:", routesTopic);
})

/** client on error **/
client.on("error", function (err) {
    console.log("MQTT::Error from client --> ", err);
})

/** client on reconnect **/
client.on("reconnect", function (err) {
    console.log("MQTT::reconnect from client --> ", err);
})

/** client on close **/
client.on("close", function (err) {
    console.log("MQTT::close from client --> ", err);
})

/** client on offline **/
client.on("offline", function (err) {
    console.log("MQTT::offline from client --> ", err);
})

client.on("message", function (topic, message) {
    message = message.toString();
    var device = [];
    if (topic.includes("/connected")) {
        console.log("device connected");
        clients.forEach(function(client) {
            //connection.sendUTF(message.utf8Data);
            device = topic.split('/');
            device = "urn:lo:nsid:"+device[4]+':'+device[5];
            var result = {"metadata" : {"source": device},"connected":true };
            client.sendUTF(JSON.stringify(result));
        });
    } else if (topic.includes("/disconnected")) {
        console.log("device disconnected");
        device = topic.split('/');
        device = "urn:lo:nsid:"+device[4]+':'+device[5];
        clients.forEach(function(client) {
            //connection.sendUTF(message.utf8Data);
            var result = {"metadata" : {"source": device},"connected":false };
            client.sendUTF(JSON.stringify(result));
        });
    } else if (topic.includes("router/~event/v1/data/new")) {
        console.log("new data");
        clients.forEach(function(client) {
            //connection.sendUTF(message.utf8Data);
            client.sendUTF(message);
        });
    } else if (topic.includes("router/~event/v1/data/eventprocessing/")) {
        console.log("new event");
        clients.forEach(function(client) {
            //connection.sendUTF(message.utf8Data);
            client.sendUTF(message);
        });
    }
})


/** HTTP server */
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = 8080;

var sendHttpResponse= function(response,data){
    var headers = {};
    headers["Content-Type"] = "application/json";
    response.writeHead(200, headers);
    response.write(JSON.stringify(data));
    response.end();
}    
var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    var uri = url.parse(request.url).pathname
        , filename = path.join(process.cwd() + '/www/', uri);

    if (uri == "/sensors") {
        liveobjects.getSensors(sendHttpResponse,response);
        return;
    }
    if (uri == "/beacons") {
        
       liveobjects.getBeacons(sendHttpResponse,response);
        return;
    }
    if (uri == "/affluence") {
        var messageStatus = { "affluence": "1" };
        var headers = {};
        headers["Content-Type"] = "application/json";
        response.writeHead(200, headers);
        response.write(JSON.stringify(messageStatus));
        response.end();
        return;
    }

    /**
     * start serve static file
     */
    var contentTypesByExtension = {
        '.html': "text/html",
        '.css': "text/css",
        '.js': "text/javascript",
        '.jpg': "image/jpg",
        '.png': "image/png"
    };

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.write("404 Not Found\n");
            response.end();
            console.log("404 " + filename);
            return;
        }


        fs.readFile(filename, "binary", function (err, file) {
            if (err) {
                response.writeHead(500, { "Content-Type": "text/plain" });
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
    /**
     * end serve static file
     */

}).listen(parseInt(port, 10), '0.0.0.0');


/** start websocket server */
var WebSocketServer = require('websocket').server;

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
/** end websocket server */