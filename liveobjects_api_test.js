var request = require('request');
global.devices = [];
var options = {
  //url: 'https://liveobjects.orange-business.com/api/v0/assets?size=20&connected=true',
  url: 'https://liveobjects.orange-business.com/api/v0/assets?size=20',
  headers: {
    'User-Agent': 'request',
    'X-API-KEY': '0d1bde96f14e4e7b926a10ff5f3b3b7a'
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    //console.log(info.totalCount);
    info.data.forEach(function(element) {
      //console.log(element.namespace+element.id);
      devices.push("urn:lo:nsid:"+element.namespace+':'+element.id);
     
    }, this);
    lastData(devices);
    //console.log(devices);


  }
}
console.log("eee");

request(options, callback);

function readLastData(error,response,body){
 
  if (!error && response.statusCode == 200) {
   
    var result = [];
    //console.log(body.aggregations);
    //var info = JSON.parse(body);
    body.aggregations.tags.buckets.forEach(function(element){
    
     // console.log(element.last_value.hits.hits[0]._source);
     result.push(element.last_value.hits.hits[0]._source);
    },this);
    console.log(JSON.stringify(result));
  }

}
function lastData(devices){
  var requestData = {
    "size": 0,
    "aggs": {
      "tags": {
        "terms": {
          "field": "metadata.source",
          "size": 0,
          "include": ["urn:lo:nsid:hubbub:002",
          "urn:lo:nsid:SR:Tibe"]
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
    //url: 'https://liveobjects.orange-business.com/api/v0/assets?size=20&connected=true',
    url: 'https://liveobjects.orange-business.com/api/v0/data/search',
    headers: {
      'User-Agent': 'request',
      'X-API-KEY': '0d1bde96f14e4e7b926a10ff5f3b3b7a'
    },
    method: "POST",
    json: requestData
  };
  request(options, readLastData);
}