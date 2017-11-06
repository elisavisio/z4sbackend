var request = require('request');

var getBeacons = function () {
    return {};
}

var getSensors = function (callback, responseHandler) {
    //    callback(response,{"message":"ok"});
    var options = {
        //url: 'https://liveobjects.orange-business.com/api/v0/assets?size=20&connected=true',
        url: 'https://liveobjects.orange-business.com/api/v0/assets?size=20',
        headers: {
            'User-Agent': 'request',
            'X-API-KEY': '0d1bde96f14e4e7b926a10ff5f3b3b7a'
        }
    };

    function devicesConnected(error, response, body) {
        var devices = [];
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            //console.log(info.totalCount);
            info.data.forEach(function (element) {
                //console.log(element.namespace+element.id);
                devices.push("urn:lo:nsid:" + element.namespace + ':' + element.id);

            }, this);
            callback(responseHandler,devices);
            //console.log(devices);


        }
    }

    request(options, devicesConnected);
}

exports.getBeacons = getBeacons;
exports.getSensors = getSensors;