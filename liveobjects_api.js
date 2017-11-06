var request = require('request');

var getBeacons = function() {
    return {};
}

var getSensors = function(callback,response) {
    callback(response,{"message":"ok"});
    return true;
}

exports.getBeacons = getBeacons;
exports.getSensors = getSensors;