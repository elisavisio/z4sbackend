var request = require('request');
global.devices = [];


function readLastData(error,response,body){
 
  if (!error && response.statusCode == 200) {
   
    var result = [];
    var DeviceId;
    
        body.aggregations.uniq_lest.buckets.forEach(function(tibe){
            DeviceId = tibe.key;
            result.unshift(tibe.last_value.hits.hits[0]._source);
            result[0].metadata.source += ':' + DeviceId;
            delete result[0]['@Tibe']; 
        },this);
    saveResult(result);
  }

}

function saveResult(result){
    var fs = require("fs");
    var path = "c:\\Temp\\tibe.json";
    var data = JSON.stringify(result);
    
    fs.writeFile(path, data, function(error) {
         if (error) {
           console.error("write error:  " + error.message);
         } else {
           console.log("Successful Write to " + path);
         }
    });

    fs.readFile(path, function(error,data) {
        if (error) {
          console.error("reas error:  " + error.message);
        } else {
          console.log("Successful read from " + path);
          data = JSON.parse(data);
          console.log(data[0].metadata.source);
        }
   });
}

lastTiBe();

function lastTiBe(){
  var requestData ={
	"size": "0",
	"aggs": {
		"uniq_lest": {
			"terms": {
				"field": "@TiBe.value.DeviceId"
			},
            "aggs": {
                "last_value": {
                    "top_hits": {
                        "size": 1,
                        "sort": [
                            {
                                "timestamp": {
                                    "order": "desc"
                                }
                            }
                        ]
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