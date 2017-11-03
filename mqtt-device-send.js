/*
 * Copyright (C) 2016 Orange
 *
 * This software is distributed under the terms and conditions of the 'BSD-3-Clause'
 * license which can be found in the file 'LICENSE.txt' in this package distribution
 * or at 'https://opensource.org/licenses/BSD-3-Clause'.
 */

var mqtt = require('mqtt')
const url = "mqtt://liveobjects.orange-business.com:1883"
const apiKey = "0d1bde96f14e4e7b926a10ff5f3b3b7a"

/** connect **/
//console.log("MQTT::Connecting to ");
var client  = mqtt.connect(url, {username:"json+device", password:apiKey,clientId:"urn:lo:nsid:hubbub:002", keepAlive:30})

/** client on connect **/
client.on("connect", function() {
  //console.log("MQTT::Connected");

  var test = JSON.stringify(mymessageok);
  client.publish("dev/data",test);
})

/** client on error **/
client.on("error", function(err) {
 // console.log("MQTT::Error from client --> ", err);
})



var mymessageok = {
  "streamId" : "urn:lo:nsid:hubbub:002!temperature",
  "model" : "testmichael_v0",
  "value" : {
    "temp" : 13
   },
  "tags" : [ "hubbub" ]
  };