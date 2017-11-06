/*
 * Copyright (C) 2017 Orange
 *
 */
var devices = require("./devices.js")

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

    if (topic.includes("/connected")) {
        console.log("device connected");
    } else if (topic.includes("/disconnected")) {
        console.log("device disconnected");
    } else if (topic.includes("router/~event/v1/data/new")) {
        console.log("new data");
    } else if (topic.includes("router/~event/v1/data/eventprocessing/")) {
        console.log("new event");
    }
})


/** HTTP server */
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = 8080;

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    var uri = url.parse(request.url).pathname
        , filename = path.join(process.cwd() + '/www/', uri);

    if (uri == "/sensors") {
        var messageStatus = { "sensors": "1" };
        var headers = {};
        headers["Content-Type"] = "application/json";
        response.writeHead(200, headers);
        response.write(JSON.stringify(messageStatus));
        response.end();
        return;
    }
    if (uri == "/beacons") {
        var messageStatus = { "beacons": "1" };
        var headers = {};
        headers["Content-Type"] = "application/json";
        response.writeHead(200, headers);
        response.write(JSON.stringify(messageStatus));
        response.end();
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