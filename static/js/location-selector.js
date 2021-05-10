let tileLayer;
let locationLayer = new L.LayerGroup();
let editableLayers = new L.FeatureGroup();
let initialLocation;

// TODO: Save last latlng
// TODO: Keep track of circle

function initMap(startLocation, startZoom, minZoom, maxZoom, tileserver, location = null, radius = 1000) {
    const map = L.map('map', {
        preferCanvas: true,
        //worldCopyJump: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        layers: [locationLayer],
        maxZoom: maxZoom,
        //renderer: L.canvas()
    });
    map.setView(startLocation, startZoom);
    map.on('click', function(e) {
        locationLayer.clearLayers();
        const radius = $('#distance').val();
        //console.log('latlng:', e.target);
        //const radius = e.target._size.x;
        const circle = createCircle(e.latlng.lat, e.latlng.lng, radius);
        locationLayer.addLayer(circle);
        $('#location').val(`${e.latlng.lat},${e.latlng.lng}`);
    });

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

     // FeatureGroup is to store editable layers
    const options = {
        position: 'topleft',
        draw: {
            polyline: false,
            polygon: false,
            circle: true,
            rectangle: false,
            marker: false,
        },
        edit: false,
    };
    map.addControl(new L.Control.Draw(options));
    map.on(L.Draw.Event.CREATED, function (e) {
        editableLayers.addLayer(e.layer);
    });

    initialLocation = location;
    if (initialLocation) {
        loadLocation(initialLocation, radius);
    }
}

function loadLocation(location, radius) {
    const split = location.split(',');
    const circle = createCircle(split[0], split[1], radius);
    locationLayer.addLayer(circle);
    $('#location').val(location);
}

function createCircle(lat, lng, radius) {
    const circle = L.circle([lat, lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    });
    return circle;
}