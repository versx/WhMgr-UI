function getLocation(positionCallback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionCallback);
    } else {
        console.warn("Geolocation is not supported by this browser.");
    }
}