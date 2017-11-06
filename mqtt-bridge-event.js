/*
 * Copyright (C) 2016 Orange
 *
 * This software is distributed under the terms and conditions of the 'BSD-3-Clause'
 * license which can be found in the file 'LICENSE.txt' in this package distribution
 * or at 'https://opensource.org/licenses/BSD-3-Clause'.
 */
var devices = require("./devices.js")
var request = require('request')
var mqtt = require('mqtt')
const urlmqtt = "mqtt://liveobjects.orange-business.com:1883"
const apiKey = "0d1bde96f14e4e7b926a10ff5f3b3b7a"

const routesTopic =  {"router/~event/v1/data/new":0,"router/~event/v1/data/eventprocessing/#": 0, "router/~event/v2/assets/#": 0}
/** connect **/
console.log("MQTT::Connecting to ");
var client  = mqtt.connect(urlmqtt, {username:"payload", password:apiKey, keepAlive:30})

/** client on connect **/
client.on("connect", function() {
  console.log("MQTT::Connected");
  client.subscribe(routesTopic)
  console.log("MQTT::Subscribed to topic:", routesTopic);
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
    
  if(topic.includes("/connected")){
    console.log("device connected");
  }else if(topic.includes("/disconnected")){
    console.log("device disconnected");
  }else if(topic.includes("router/~event/v1/data/new")){
    console.log("new data");
  }else if(topic.includes("router/~event/v1/data/eventprocessing/")){
    console.log("new event");
  }
})


