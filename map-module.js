let map = null;

export function initMap() {
    if (map) return;

    // Default: Bengaluru, Karnataka [12.9716, 77.5946]
    const defaultCoords = [12.9716, 77.5946];

    map = L.map('map', {
        zoomControl: false
    }).setView(defaultCoords, 13);

    // Dark Mode Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Attempt Live Location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);
            L.marker([lat, lng]).addTo(map).bindPopup('Your Current Location').openPopup();
            
            // Add a "Pulse" circle around user
            L.circle([lat, lng], {
                color: '#818cf8',
                fillColor: '#818cf8',
                fillOpacity: 0.1,
                radius: 200
            }).addTo(map);
        }, (err) => {
            console.warn("Geolocation access denied or failed. Defaulting to Karnataka.");
            L.marker(defaultCoords).addTo(map).bindPopup('Bengaluru, Karnataka (Default)').openPopup();
        });
    } else {
        L.marker(defaultCoords).addTo(map).bindPopup('Bengaluru, Karnataka (Default)').openPopup();
    }

    // Karnataka Safe Zones
    const karnatakaSafeZones = [
        { coords: [12.9716, 77.5946], name: "Bengaluru Central Police" },
        { coords: [12.9279, 77.6271], name: "Koramangala Safe Haven" },
        { coords: [12.9784, 77.6408], name: "Indiranagar Security Post" },
        { coords: [15.3647, 75.1240], name: "Hubballi Safe Zone" },
        { coords: [12.2958, 76.6394], name: "Mysuru Protection Hub" }
    ];

    karnatakaSafeZones.forEach(zone => {
        L.circle(zone.coords, {
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.2,
            radius: 500
        }).addTo(map).bindPopup(zone.name);
    });

    // Danger Zone simulation in Bangalore
    L.circle([12.9516, 77.5746], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.1,
        radius: 800
    }).addTo(map).bindPopup("High Alert Area - Low Visibility");
}
