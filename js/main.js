
var nextBusRoute = [];
var busList = [];

var endLat = "43.70875";
var endLon = "-79.29643";

// NextBus requests variables
var previousStopId = "1893";
var stopId = "2475";

var stopLon = "-79.30161";
var stopLat = "43.7035999";

var busLon = "";
var busLat = "";

var nextStopId = "";
var routeID = "23";

var googleUrl = "";

var vehicleNumber= "";

var time = "";
var agency = "ttc";
var routeTag = "";


var busOrigin = { "lat": "", "lon": "" };

$(".button").on('click', function() {

  // This URL gets the bus ID for the current route
  var nextBusURL = 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=ttc&stopId=' + previousStopId;

  var request = new XMLHttpRequest();
  request.open("GET", nextBusURL, true);
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200)
    {
      var doc = request.responseXML;

      busList = xmlToJson(doc);

      vehicleNumber = findNextBus(busList); // over 1 min

      busLocation = getBusLocation(vehicleNumber, stopLon, stopLat);

    }
  };
  request.send(null);


});

// ----------------------------------------------------------
// get the bus location lon and lat
// ----------------------------------------------------------
function getBusLocation(number, destLon, destLat) {
  var route = routeID;
  var url = "http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=ttc&r=" + route + "&t=0";

  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200)
    {
      var doc = request.responseXML;

      var response = xmlToJson(doc);
      var buses = response.body.vehicle; // a list of buses on route
      console.log("list of buses on route");
      console.log(buses);

      for (var i = 0; i < buses.length; i++) {
        if (buses[i]['@attributes'].id == vehicleNumber) {
          console.log("our bus lat: " + buses[i]['@attributes'].lat + " lon: " + buses[i]['@attributes'].lon);
          console.log("our bus vehicle number: " + buses[i]['@attributes'].id);
          var lat = buses[i]['@attributes'].lat;
          var lon = buses[i]['@attributes'].lon;
          createGoogleURL(lon, lat, destLon, destLat);
        }
      }
    }

  };
  request.send(null);
}



// ----------------------------------------------------------
// this function iterates through a list of buses
// on a given route, and returns the 'closest' vehicle to the stop
// which is more than 60 seconds away from the previous stop
// ----------------------------------------------------------
function findNextBus(data) {
  var predictionArray = data.body.predictions.direction.prediction;

  for (var i = 0; i < predictionArray.length; i++) {
    if (predictionArray[i]["@attributes"].seconds > 60) {
      return predictionArray[i]["@attributes"].vehicle;
    }
  }
}



// ----------------------------------------------------------
// given a stopId, return the stops lon and lat
// ----------------------------------------------------------
function findStopLocations() {

  var stopsURL = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=ttc&r=" + routeID;

  var request = new XMLHttpRequest();
  request.open("GET", stopsURL, true);
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200)
    {
      var doc = request.responseXML;

      stopsList = xmlToJson(doc);

      for (var i = 0; i < stopsList.body.route.stop.length; i++) {
        if (stopsList.body.route.stop[i]['@attributes'].stopId == stopId) {
          console.log("Lon and Lat of button pressed stop");
          console.log(stopsList.body.route.stop[i]['@attributes'].lon);
          console.log(stopsList.body.route.stop[i]['@attributes'].lat);
          stopLon = stopsList.body.route.stop[i]['@attributes'].lon;
          stopLat = stopsList.body.route.stop[i]['@attributes'].lat;

        }
      }
    }
  };
  request.send(null);
}


// ----------------------------------------------------------
// recreate a url string specific to our route.
// origin = bus location in lat lon (lat,lon)
// destination = the lon and lat of the stop where button was pressed
// API key = AIzaSyA--RYl7QFx_zyNpLz1T7X5jeu7deaulFc
// ----------------------------------------------------------
function createGoogleURL(busLon, busLat, stopLon, stopLat) {
  var busOriginString = busLat + "," + busLon;
  var stopOriginString = stopLat + "," + stopLon;
  var googleUrlRequest = "https://www.google.com/maps/embed/v1/directions?origin=" + busOriginString + "&destination=" + stopOriginString + "&key=AIzaSyA--RYl7QFx_zyNpLz1T7X5jeu7deaulFc";

  googleUrl = googleUrlRequest;


  setTimeout(function() {
    loadiframe(googleUrl);
  }, 2000);

}

// load the iFrame with the newly create url
function loadiframe(url) {
  $(".iFrame").attr("src", url);
}











// ----------------------------------------------------------
// When page is ready,
// ----------------------------------------------------------
$(document).ready(function () {
  console.log("doc ready");
  var nextBusURL = 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=ttc&stopId=' + previousStopId;

  var request = new XMLHttpRequest();
  request.open("GET", nextBusURL, true);
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200)
    {
      var doc = request.responseXML;

      busList = xmlToJson(doc);

      vehicleNumber = findNextBus(busList); // over 1 min

      busLocation = getBusLocation(vehicleNumber, endLon, endLat);

    }
  };
  request.send(null);

});


// ----------------------------------------------------------
// Changes XML to JSON
// ----------------------------------------------------------
function xmlToJson(doc) {

  // Create the return object
  var obj = {};

  if (doc.nodeType == 1) { // element
    // do attributes
    if (doc.attributes.length > 0) {
    obj["@attributes"] = {};
      for (var j = 0; j < doc.attributes.length; j++) {
        var attribute = doc.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (doc.nodeType == 3) { // text
    obj = doc.nodeValue;
  }

  // do children
  if (doc.hasChildNodes()) {
    for(var i = 0; i < doc.childNodes.length; i++) {
      var item = doc.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof(obj[nodeName]) == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
};
