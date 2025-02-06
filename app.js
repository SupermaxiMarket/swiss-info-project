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
            description: "Le plus haut col ferroviaire d'Europe, offrant une vue spectaculaire sur les glaciers.",
            photo: "/images/jungfrau.jpg"
        },
        {
            name: "Chutes du Rhin",
            lat: 47.6776,
            lng: 8.6159,
            type: "nature",
            region: "est",
            description: "Les plus grandes chutes d'eau d'Europe, un spectacle naturel impressionnant.",
            photo: "/images/rheinfall.jpg"
        }
    ],
    culture: [
        {
            name: "Château de Chillon",
            lat: 46.4142,
            lng: 6.9273,
            type: "culture",
            region: "lemanique",
            description: "Château médiéval pittoresque situé sur les rives du lac Léman.",
            photo: "/images/chillon.jpg"
        }
    ],
    ville: [
        {
            name: "Vieille ville de Berne",
            lat: 46.9480,
            lng: 7.4474,
            type: "ville",
            region: "centre",
            description: "Centre historique de la capitale, classé au patrimoine mondial de l'UNESCO.",
            photo: "/images/bern.jpg"
        }
    ]
};

// Initialisation de la carte avec style personnalisé
let map = L.map('map').setView([46.8182, 8.2275], 8);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11', // Style cartographique plus adapté à la Suisse
    tileSize: 512,
    zoomOffset: -1,
    accessToken: config.MAPBOX_TOKEN
}).addTo(map);

// Création des clusters de marqueurs avec style personnalisé
let markerClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 50,
    iconCreateFunction: function(cluster) {
        return L.divIcon({
            html: '<div style="background-color: #4299e1; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">' + cluster.getChildCount() + '</div>',
            className: 'marker-cluster',
            iconSize: L.point(30, 30)
        });
    }
});

// Fonction pour afficher les sites avec animation
function displaySites(region = 'all', type = 'all') {
    markerClusterGroup.clearLayers();
    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = '';

    Object.values(sites).flat().forEach(site => {
        if ((region === 'all' || site.region === region) &&
            (type === 'all' || site.type === type)) {
            
            // Création du marqueur personnalisé
            const marker = L.marker([site.lat, site.lng], {
                icon: L.divIcon({
                    html: `<div style="background-color: ${getTypeColor(site.type)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                    className: 'custom-marker',
                    iconSize: L.point(20, 20)
                })
            }).bindPopup(`
                <div style="text-align: center;">
                    <h3 style="margin: 0; color: #2b6cb0;">${site.name}</h3>
                    <p style="margin: 10px 0;">${site.description}</p>
                    <button onclick="showWeather(${site.lat}, ${site.lng})" style="background-color: #4299e1; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Voir la météo</button>
                </div>
            `);
            
            markerClusterGroup.addLayer(marker);

            // Création de la carte du site
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

// Fonction pour obtenir la couleur selon le type de site
function getTypeColor(type) {
    const colors = {
        nature: '#48bb78',
        culture: '#ed8936',
        ville: '#4299e1'
    };
    return colors[type] || '#718096';
}

// Fonction pour afficher la météo (dans window pour être accessible depuis le HTML)
window.showWeather = async function(lat, lng) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.classList.add('loading');
    weatherInfo.innerHTML = 'Chargement des données météo...';

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${config.WEATHER_API_KEY}&units=metric&lang=fr`);
        const data = await response.json();
        
        weatherInfo.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h4 style="margin: 0;">🌡️ Température: ${Math.round(data.main.temp)}°C</h4>
                    <p style="margin: 5px 0;">💨 Vent: ${Math.round(data.wind.speed * 3.6)} km/h</p>
                    <p style="margin: 5px 0;">💧 Humidité: ${data.main.humidity}%</p>
                </div>
                <div style="text-align: center;">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Météo">
                    <p style="margin: 0;">${data.weather[0].description}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur météo:', error);
        weatherInfo.innerHTML = '❌ Erreur de chargement de la météo';
    }
    
    weatherInfo.classList.remove('loading');
};

// Gestionnaires d'événements pour les filtres
document.getElementById('region-filter').addEventListener('change', (e) => {
    displaySites(e.target.value, document.getElementById('type-filter').value);
});

document.getElementById('type-filter').addEventListener('change', (e) => {
    displaySites(document.getElementById('region-filter').value, e.target.value);
});

// Affichage initial
displaySites();