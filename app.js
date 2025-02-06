import config from './config.js';

// Données des sites
const sites = {
    nature: [
        {
            name: "Jungfraujoch",
            lat: 46.5474,
            lng: 7.9854,
            type: "nature",
            region: "alpes",
            description: "Le plus haut col ferroviaire d'Europe",
            image: "/images/jungfrau.jpg"
        },
        {
            name: "Chutes du Rhin",
            lat: 47.6776,
            lng: 8.6159,
            type: "nature",
            region: "centre",
            description: "Les plus grandes chutes d'eau d'Europe",
            image: "/images/rheinfall.jpg"
        }
    ],
    culture: [
        {
            name: "Château de Chillon",
            lat: 46.4142,
            lng: 6.9273,
            type: "culture",
            region: "lemanique",
            description: "Château médiéval au bord du lac Léman",
            image: "/images/chillon.jpg"
        }
    ],
    ville: [
        {
            name: "Vieille ville de Berne",
            lat: 46.9480,
            lng: 7.4474,
            type: "ville",
            region: "centre",
            description: "Capitale de la Suisse, patrimoine UNESCO",
            image: "/images/bern.jpg"
        }
    ]
};

// Initialisation de la carte
let map = L.map('map').setView([46.8182, 8.2275], 8);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: config.MAPBOX_TOKEN
}).addTo(map);

// Création des clusters de marqueurs
let markerClusterGroup = L.markerClusterGroup();

// Fonction pour afficher les sites
function displaySites(region = 'all', type = 'all') {
    markerClusterGroup.clearLayers();
    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = '';

    Object.values(sites).flat().forEach(site => {
        if ((region === 'all' || site.region === region) &&
            (type === 'all' || site.type === type)) {
            
            // Ajouter le marqueur
            const marker = L.marker([site.lat, site.lng])
                .bindPopup(`
                    <strong>${site.name}</strong><br>
                    ${site.description}
                `);
            markerClusterGroup.addLayer(marker);

            // Ajouter la carte du site
            const siteCard = document.createElement('div');
            siteCard.className = 'site-card';
            siteCard.innerHTML = `
                <h3>${site.name}</h3>
                <p>${site.description}</p>
                <button onclick="showWeather(${site.lat}, ${site.lng})">Voir la météo</button>
            `;
            sitesList.appendChild(siteCard);
        }
    });

    map.addLayer(markerClusterGroup);
}

// Fonction pour afficher la météo
async function showWeather(lat, lng) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${config.WEATHER_API_KEY}&units=metric&lang=fr`);
        const data = await response.json();
        
        document.getElementById('weather-info').innerHTML = `
            <p>Température: ${Math.round(data.main.temp)}°C</p>
            <p>Conditions: ${data.weather[0].description}</p>
            <p>Humidité: ${data.main.humidity}%</p>
        `;
    } catch (error) {
        console.error('Erreur météo:', error);
        document.getElementById('weather-info').innerHTML = 'Erreur de chargement de la météo';
    }
}

// Gestionnaires d'événements pour les filtres
document.getElementById('region-filter').addEventListener('change', (e) => {
    displaySites(e.target.value, document.getElementById('type-filter').value);
});

document.getElementById('type-filter').addEventListener('change', (e) => {
    displaySites(document.getElementById('region-filter').value, e.target.value);
});

// Affichage initial
displaySites();