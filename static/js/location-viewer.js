let tileLayer;
let locationLayer = new L.LayerGroup();
let circleMarker;

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
    }
}

function loadLocation(location, radius) {
    if (circleMarker) {
        locationLayer.removeLayer(circleMarker);
    }
    const split = location.split(',');
    circleMarker = createCircle(split[0], split[1], radius);
    locationLayer.addLayer(circleMarker);
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