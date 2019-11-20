// function to create markers and features for earthquake and faultline layers
function createMarkers(earthQuakeFeatures, faultlineFeatures){

    // function to define the circle size based on magnitude
    function radSize(magnitude){
        return magnitude * 3;
    };

    // add popup to each of the markers in earthquake layer
    function onEachEarthQuake(feature, layer){
        layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>"
                + feature.properties.mag)
    }
    // create markers in earthquake layer 
    function onEachEarthQuakeLayer(feature, layer){
        return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            radius: radSize(feature.properties.mag),
            fillColor: circleColor(feature.properties.mag),
            fillOpacity: 0.8,
            weight:0.3,
            color: "black"
        })
    }
    // create faultlines
    function onEachFaultLine(feature, layer){
        L.polyline(feature.geometry.coordinates);
    }
    // Create a earthquake GeoJSON layer containing the features array
    // Run the onEachFeature function once for each of data in the array
    let earthquakes = L.geoJSON(earthQuakeFeatures, {
        onEachFeature: onEachEarthQuake,
        pointToLayer: onEachEarthQuakeLayer
    })

    // Create a faultline GeoJSON layer containing the features array
    // Run the onEachFeature function once for each of data in the array
    let faultlines = L.geoJSON(faultlineFeatures,{
        onEachFeature: onEachFaultLine,
        style: {
            weight: 2,
            color: "orange"
        }
    })
    // Call CreateMap function by sending earthquakeMarker layer and faultlines layer.
    createMap(earthquakes, faultlines);
}

function createMap(earthquakes, faultlines){
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
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Satellite Map" : satellitemap,
        "Outdoor Map" : outdoormap
    };


     // Create an overlayMaps object to hold the earthquake circle marker layer
     var overlayMaps = {
        "Earthquakes": earthquakes,
        "Faultlines" : faultlines

    };

    // Create the map object with options
    var map = L.map("map", {
        center: [33, -112],
        zoom: 4,
        layers: [lightmap, faultlines, earthquakes]
    });

    // Create a layer control
    // Pass in baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    }).addTo(map);

    // Add legend
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



// Perform an API call to USGS GeoJSON Feed page to get all earthquake information from past 7 days. 
// Call createMarkers when complete
(async function(){
    const earthQuakeurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const faultlineurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
    const earthQuakeresponse = await d3.json(earthQuakeurl)
    console.log(earthQuakeurl)
    // console.log(response)
    let earthQuakeFeatures = earthQuakeresponse.features;
    console.log(earthQuakeFeatures)
    const faultlineesponse = await d3.json(faultlineurl)
    let faultlineFeatures = faultlineesponse.features;
    // send earthQuakeFeatures and faultlineFeatures to createMarker function
    createMarkers(earthQuakeFeatures, faultlineFeatures)
})()

