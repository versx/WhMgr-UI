let tileLayer;
let geofenceLayer = new L.LayerGroup();
let geojsonLayer;
let selectedGeofences = [];
let initialSelect = [];

$('form').submit(function(e) {
    const city = $('#city').val();
    const location = $('#location').val();
    const result = city !== '' || location !== '';
    if (!result) {
        // Show error message about location/areas selection
        $('#error-div').prop('hidden', false);
        $('#error-div').html('<div><strong>Error!</strong> Please select either an area and/or location to receive the notification.</div>');
        e.preventDefault();
    }
    return result;
});

function initMap(startLocation, startZoom, minZoom, maxZoom, tileserver, selected = []) {
    const map = L.map('map', {
        tap: false,
        preferCanvas: true,
        //worldCopyJump: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        layers: [geofenceLayer],
        maxZoom: maxZoom,
        //renderer: L.canvas()
    });
    map.setView(startLocation, startZoom);

    let scale = '';
    if (L.Browser.retina) {
        scale = '@2x';
    }
    const split = tileserver.split(';');
    tileLayer = L.tileLayer(split[0], {
        attribution: split[1],
        minZoom: minZoom,
        maxZoom: maxZoom,
        scale: scale,
        hq: L.Browser.retina
    });
    tileLayer.addTo(map);

    initialSelect = selected;
    selectedGeofences = initialSelect;
    if (initialSelect.length > 0) {
        console.log('loading geofences');
        loadGeofences(initialSelect);
    }
    const guildId = get('guild_id') || 'areas';
    $.getJSON(`/data/${guildId}.json`, loadGeofencePolygons);
}

function loadGeofencePolygons(geofenceDb) {
    if (geofenceDb === null) {
        return;
    }
    try {
        geojsonLayer = L.geoJson(geofenceDb, {
            onEachFeature: onEachFeature,
        });
        geofenceLayer.addLayer(geojsonLayer);
    } catch (err) {
        console.error('Failed to load areas.json file\nError:', err);
    }
}

function onEachFeature(feature, featureLayer) {
    // Check if `hidden` property is set to true, if so don't include it
    if (feature.properties.hidden) {
        return;
    }
    // Set default style to de-selected color
    featureLayer.setStyle({
        fillColor: 'red',
    });

    loadGeofence(feature, featureLayer, false);
    featureLayer.on({
        click: function (e) {
            loadGeofence(feature, featureLayer, true);
        },
    });
}

function loadGeofences(selected) {
    selectedGeofences = [];
    for (const area of selected) {
        // Check if geofence not already selected
        if (!selectedGeofences.includes(area)) {
            // If not then select it
            selectedGeofences.push(area);
            // Set selected layer color
            createCityListItem(area);
        }
    }
    // Set dom value to selected geofences
    $('#city').val(selectedGeofences.join(','));
}

function loadGeofence(feature, featureLayer, isClick) {
    if (isClick) {
        // Check if geofence not already selected
        if (!selectedGeofences.includes(feature.properties.name)) {
            // If not then select it
            selectedGeofences.push(feature.properties.name);
            // Set selected layer color
            featureLayer.setStyle({
                fillColor: 'green',
            });
            createCityListItem(feature.properties.name);
        } else {
            // Get index of de-selected geofence
            const index = selectedGeofences.indexOf(feature.properties.name);
            // Check if geofence was actually in selected list
            if (index > -1) {
                // If so delete it
                selectedGeofences.splice(index, 1);
            }
            // Set de-selected layer color
            featureLayer.setStyle({
                fillColor: 'red',
            });
            removeCityListItem(feature.properties.name);
        }
    } else {
        // Check if geofence is in initially selected geofences to edit
        if (initialSelect.includes(feature.properties.name)) {
            // Set selected layer color
            featureLayer.setStyle({
                fillColor: 'green',
            });
            createCityListItem(feature.properties.name);
        } else {
            featureLayer.setStyle({
                fillColor: 'red',
            });
            removeCityListItem(feature.properties.name);
        }
    }
    // Set dom value to selected geofences
    $('#city').val(selectedGeofences.join(','));
}

function createCityListItem(name) {
    const ul = document.getElementById('city-list');
    if (!containsCityListItem(name)) {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.id = name;
        const node = document.createTextNode(name);
        li.appendChild(node);
        ul.appendChild(li);
    }
}

function removeCityListItem(name) {
    const ul = document.getElementById('city-list');
    if (containsCityListItem(name)) {
        const li = document.getElementById(name);
        ul.removeChild(li)
    }
}

function containsCityListItem(name) {
    let found = false;
    $("#city-list li").each((id, elem) => {
        if (elem.innerText === name) {
            found = true;
        }
    });
    return found;
}

function selectGeofences(all) {
    // Clear selected geofences list
    selectedGeofences = [];
    // Loop each geojson layer
    geojsonLayer.eachLayer(function(layer) {
        // Check if we need to select all
        if (all) {
            selectedGeofences.push(layer.feature.properties.name);
            createCityListItem(layer.feature.properties.name);
        } else {
            removeCityListItem(layer.feature.properties.name);
        }
        // Set color based on selection
        layer.setStyle({
            fillColor: all ? 'green' : 'red',
        });
    });
    // Set dom value to selected geofences
    $('#city').val(selectedGeofences.join(','));
}
