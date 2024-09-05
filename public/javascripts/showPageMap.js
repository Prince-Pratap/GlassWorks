maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT, // You can change this to another available style if needed
    center: glass.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

// map.addControl(new maptilersdk.NavigationControl());
// map.addControl(new maptilersdk.FullscreenControl(), 'top-left');

new maptilersdk.Marker()
    .setLngLat(glass.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${glass.title}</h3><p>${glass.location}</p>`
            )
    )
    .addTo(map);
