
function createMap(earthquakePoint){
    // Create the tile layer for outdoor map
    var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
      });
    // Create the tile layer for satellite map
      var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        // id: "mapbox.dark",
        accessToken: API_KEY
      });
    // Create the tile layer for light map
      var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
      });
    
    var faultlines = new L.LayerGroup();
    (async function getFaultLines(){
        const faultlineurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
        const falulineResponse = await d3.json(faultlineurl)
        console.log(faultlineurl)
        console.log(falulineResponse.features)
        // createFaultlines(falulineResponse)
        var features = falulineResponse.features;
        L.geoJSON(features,{
        style: function(features){
            return {color: "orange",
                    fillOpacity: 0,
                    weight:2}
            
        }
    }).addTo(faultlines)
    })()

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Satellite Map" : satellitemap,
        "Outdoor Map" : outdoormap
    };


     // Create an overlayMaps object to hold the earthquake circle marker layer
     var overlayMaps = {
        "Earthquakes": earthquakePoint,
        "Faultlines" : faultlines

    };

    // Create the map object with options
    var map = L.map("map", {
        center: [33, -112],
        zoom: 4,
        layers: [lightmap, faultlines, earthquakePoint]
    });

// Create a layer control
// Pass in baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
collapsed: false
}).addTo(map);

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
        return magnitude * 3;
    };

  // Create a GeoJSON layer containing the features array
  // Run the onEachFeature function once for each of data in the array
    const earthquakeMarkers = L.geoJSON(features, {
        pointToLayer : function(features, latlng){
            return L.circleMarker(latlng, {
                radius: radSize(features.properties.mag),
            })
        },
        onEachFeature : onEachFeature,
        style: function(features){
            return{
                fillColor: circleColor(features.properties.mag),
                fillOpacity: 0.8,
                weight:0.3,
                color: "black"
            }
        },
       
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
