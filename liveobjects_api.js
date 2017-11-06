var request = require('request');

var getBeacons = function () {
    return {};
}

var devicesLastdatafunction = function(devices,callback,responseHandler){
    var requestData = {
      "size": 0,
      "aggs": {
        "tags": {
          "terms": {
            "field": "metadata.source",
            "size": 0,
            "include": devices
          },
        "aggs": {
          "last_value": {
            "top_hits": {
              "size": 1,
              "sort": [{
                "timestamp": {
                  "order": "desc"
                }
              }]
            }
          }
        }
        }
      }
    };
    var options = {
      url: 'https://liveobjects.orange-business.com/api/v0/data/search',
      headers: {
        'User-Agent': 'request',
        'X-API-KEY': '0d1bde96f14e4e7b926a10ff5f3b3b7a'
      },
      method: "POST",
      json: requestData
    };
    var readLastData = function (error,response,body){
        
         if (!error && response.statusCode == 200) {
          
           var result = [];
           //console.log(body.aggregations);
           //var info = JSON.parse(body);
           body.aggregations.tags.buckets.forEach(function(element){
           
            // console.log(element.last_value.hits.hits[0]._source);
            result.push(element.last_value.hits.hits[0]._source);
           },this);
           console.log(JSON.stringify(result));
           callback(responseHandler,result);

         }
       
       }
    request(options, readLastData);
  }

var getSensors = function (callback, responseHandler) {
    //    callback(response,{"message":"ok"});
    var optionsdevicesConnected = {
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
                if(element.namespace=="hubbub"||element.id=="Enerbee"||element.id=="Kinect"){
                    devices.push("urn:lo:nsid:" + element.namespace + ':' + element.id);
                }
               
            }, this);
            devicesLastdatafunction(devices,callback,responseHandler);
        }
    }

    request(optionsdevicesConnected, devicesConnected);
}

exports.getBeacons = getBeacons;
exports.getSensors = getSensors;