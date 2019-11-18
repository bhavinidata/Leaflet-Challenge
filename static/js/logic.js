
function createMap(earthquakePoint){
    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap
    };
     // Create an overlayMaps object to hold the bikeStations layer
     var overlayMaps = {
        "EarthQuake Locations": earthquakePoint
    };

    // Create the map object with options
    var map = L.map("map", {
        center: [33, -112],
        zoom: 4,
        layers: [lightmap, earthquakePoint]
    });

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitudes = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
            '<i style="background:' + circleColor(magnitudes[i] + 1) + '"></i> ' +
            magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }
    return div;
};
legend.addTo(map);
}

// function to define circle color based on magnitude and also will be used for legend color scale
function circleColor(magnitude){
    if (magnitude > 5){
        return "red"
    }else if (magnitude > 4){
        return "darkorange"
    }else if (magnitude > 3){
        return "orange"
    }else if (magnitude > 2){
        return "khaki"
    }else if (magnitude > 1){
        return "greenyellow"
    }else {
        return "palegreen"
    }
};

function createMarkers(response){
    // Pull the "features" from the response and then "Geometry"
    var features = response.features;

    // function to run on each feature to create pop up for every circle marker
    function onEachFeature(feature, layer){
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>"
            + feature.properties.mag)
    };
    
    // function to define the circle size based on magnitude
    function radSize(magnitude){
        return magnitude * 4;
    };

  // Create a GeoJSON layer containing the features array
  // Run the onEachFeature function once for each of data in the array
    const earthquakeMarkers = L.geoJSON(features, {
        pointToLayer : function(features, latlng){
            return L.circleMarker(latlng, {
                radius: radSize(features.properties.mag),
            })
        },
        style: function(features){
            return{
                fillColor: circleColor(features.properties.mag),
                fillOpacity: 0.8,
                weight:0.3,
                color: "black"
            }
        },
        onEachFeature: onEachFeature
    })

    // Call CreateMap function by sending earthquakeMarker layer.
    createMap(earthquakeMarkers)
}

// Perform an API call to USGS GeoJSON Feed page to get all earthquake information from past 7 days. 
// Call createMarkers when complete
(async function(){
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await d3.json(url)
    console.log(url)
    // console.log(response)
    console.log(response.features)
    createMarkers(response)
})()