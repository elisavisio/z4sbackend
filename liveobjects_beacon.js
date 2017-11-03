var request = require('request')
global.devices = []


function readLastData(error,response,body){
 
  if (!error && response.statusCode == 200) {
   
    var result = []
    //console.log(body.aggregations);
    //var info = JSON.parse(body);
    var Major,Minor;
    body.aggregations.uniq_lest.buckets.forEach(function(element){
        Major = element.key
        element.uniq_test.buckets.forEach(function(beacon){
            Minor = beacon.key
     // console.log(element.last_value.hits.hits[0]._source);
            result.unshift(beacon.last_value.hits.hits[0]._source)
            result[0].metadata.source += ':' + Major + ':' + Minor
            delete result[0]['@Beacon']
            
        },this)
    },this)
    console.log(JSON.stringify(result))
  }

}
lastBeacons();

function lastBeacons(){
  var requestData ={
	"size": "0",
	"aggs": {
		"uniq_lest": {
			"terms": {
				"field": "@Beacon.value.Major"
			},
			"aggs": {
				"uniq_test": {
					"terms": {
						"field": "@Beacon.value.Minor"
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
		}
	}
}
  var options = {
    //url: 'https://liveobjects.orange-business.com/api/v0/assets?size=20&connected=true',
    url: 'https://liveobjects.orange-business.com/api/v0/data/search',
    headers: {
      'User-Agent': 'request',
      'X-API-KEY': '0d1bde96f14e4e7b926a10ff5f3b3b7a'
    },
    method: "POST",
    json: requestData
  }
  request(options, readLastData)
}