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

    // // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    // L.control.layers(baseMaps, overlayMaps, {
    //     collapsed: false
    // }).addTo(map);

function getColor(d) {
    return d > 5 ? '#800026' :
            d > 4  ? '#BD0026' :
            d > 3  ? '#E31A1C' :
            d > 2  ? '#FC4E2A' :
            d > 1   ? '#FD8D3C' :
                     '#FEB24C';

}

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


// function createMarkers(response){

//     // Pull the "features" from the response and then "Geometry"
//     var features = response.features;
//     const earthquakeMarker = features.map(feature => {
//     // for each earthquake location, create a marker and bind pop-up with earthquake details.
//     const coord = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]]
//     const earthquakeMarker = L.marker(coord)
//     return earthquakeMarker;
//     })
//     // Create a layer group made from the bike markers array, pass it into the createMap function
//     createMap(L.layerGroup(earthquakeMarker));
// }
function onEachFeature(feature, layer){
    layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>"
        + feature.properties.mag)
};

function radSize(magnitude){
    return magnitude * 4;
};

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


// function circleColor(magnitude){
//     if (magnitude > 5){
//         return "#800026"
//     }else if (magnitude > 4){
//         return "#BD0026"
//     }else if (magnitude > 3){
//         return "#E31A1C"
//     }else if (magnitude > 2){
//         return "#FC4E2A"
//     }else if (magnitude > 1){
//         return "#FD8D3C"
//     }else {
//         return "#FEB24C"
//     }
// };

function createMarkers(response){
    // Pull the "features" from the response and then "Geometry"
    var features = response.features;
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

    createMap(earthquakeMarkers)
}

// Perform an API call to USGS GeoJSON Feed page to get all earthquake information from past 7 days. 
// Call createMarkers when complete

(async function(){
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await d3.json(url)
    console.log(url)
    // ?? why need to start local server?
    // What's the third element in coordinates.
    // How to know which one is longitude and latitude?
    console.log(response)
    console.log(response.features)
    console.log(response.features[0].geometry.coordinates[0])
    console.log(response.features[0].geometry.coordinates[1])
    createMarkers(response)
})()