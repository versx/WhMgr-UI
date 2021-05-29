let tileLayer;
let locationLayer = new L.LayerGroup();
let circleMarker;
let initialized = false;

function initMap(startLocation, startZoom, minZoom, maxZoom, tileserver, location = null, radius = 1000) {
    if (initialized) {
        return;
    }
    const map = L.map('map', {
        tap: false,
        preferCanvas: true,
        //worldCopyJump: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        layers: [locationLayer],
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
        hq: L.Browser.retina,
    });
    tileLayer.addTo(map);

    if (location) {
        loadLocation(location, radius);
    } else {
        removeCircle();
    }
    initialized = true;
}

function loadLocation(location, radius) {
    if (circleMarker) {
        removeCircle();
    }
    if (location) {
        const split = location.split(',');
        circleMarker = createCircle(split[0], split[1], radius);
        locationLayer.addLayer(circleMarker);
    }
}

function createCircle(lat, lng, radius) {
    circleMarker = L.circle([lat, lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    });
    return circleMarker;
}

function removeCircle() {
    if (circleMarker) {
        locationLayer.removeLayer(circleMarker);
    }
}