// Données des temps de trajet
const travelTimes = {
    train: {
        'Château de Chillon-Gruyères': {
            duration: 120,
            frequency: "toutes les heures",
            changes: 1
        },
        'Gruyères-Zermatt': {
            duration: 180,
            frequency: "toutes les 2 heures",
            changes: 2
        }
        // Autres trajets...
    }
};

// Couleurs des itinéraires
const itineraireColors = {
    historique: '#FF0000',
    nature: '#00FF00',
    gastronomie: '#0000FF',
    art: '#800080',
    traditions: '#FFA500',
    lacs: '#00FFFF'
};

// Configuration des clusters et des marqueurs
let markerClusterGroup;
let routeLines = {};
let map;
let markers = [];

function initMap() {
    // Initialisation de la carte
    map = L.map('map').setView([46.8182, 8.2275], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialisation du groupe de clusters
    markerClusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 10
    });

    map.addLayer(markerClusterGroup);
}

// Création des lignes d'itinéraire
function createItineraryLines(itineraire) {
    // Supprimer les lignes existantes
    if (routeLines[itineraire]) {
        routeLines[itineraire].forEach(line => map.removeLayer(line));
    }
    routeLines[itineraire] = [];

    // Récupérer les sites de l'itinéraire
    const sitesInItinerary = Object.values(sites).flat().filter(site => 
        site.itineraires.includes(itineraire)
    );

    // Créer les lignes entre les sites
    for (let i = 0; i < sitesInItinerary.length - 1; i++) {
        const line = L.polyline(
            [
                [sitesInItinerary[i].lat, sitesInItinerary[i].lng],
                [sitesInItinerary[i + 1].lat, sitesInItinerary[i + 1].lng]
            ],
            {
                color: itineraireColors[itineraire],
                weight: 3,
                opacity: 0.6
            }
        );

        // Ajouter les informations de trajet au survol
        if (travelTimes.train[`${sitesInItinerary[i].name}-${sitesInItinerary[i + 1].name}`]) {
            const travelInfo = travelTimes.train[`${sitesInItinerary[i].name}-${sitesInItinerary[i + 1].name}`];
            line.bindTooltip(`
                <strong>Trajet en train :</strong><br>
                Durée : ${travelInfo.duration} minutes<br>
                Fréquence : ${travelInfo.frequency}<br>
                Changements : ${travelInfo.changes}
            `);
        }

        line.addTo(map);
        routeLines[itineraire].push(line);
    }
}

// Mise à jour des marqueurs avec clusters
function updateMarkers(filteredSites) {
    markerClusterGroup.clearLayers();
    
    filteredSites.forEach(site => {
        const marker = L.marker([site.lat, site.lng]);
        
        // Popup enrichie avec infos de visite
        const popupContent = `
            <strong>${site.name}</strong><br>
            ${site.description}<br>
            <hr>
            <strong>Temps de visite conseillé :</strong> ${site.visitDuration || '2-3 heures'}<br>
            <strong>Meilleure période :</strong> ${site.bestPeriod || 'Toute l'année'}<br>
            ${site.travelTips ? `<strong>Conseils :</strong> ${site.travelTips}` : ''}
        `;
        
        marker.bindPopup(popupContent);
        markerClusterGroup.addLayer(marker);
    });
}

// Filtres améliorés
function filterSites(type = 'all', region = 'all', itineraire = 'all') {
    const filteredSites = Object.values(sites).flat().filter(site => {
        return (type === 'all' || site.type === type) &&
               (region === 'all' || site.region === region) &&
               (itineraire === 'all' || site.itineraires.includes(itineraire));
    });

    updateMarkers(filteredSites);

    // Créer les lignes d'itinéraire si un itinéraire spécifique est sélectionné
    if (itineraire !== 'all') {
        createItineraryLines(itineraire);
    } else {
        // Supprimer toutes les lignes si aucun itinéraire n'est sélectionné
        Object.keys(routeLines).forEach(key => {
            routeLines[key].forEach(line => map.removeLayer(line));
        });
    }
}

// Initialisation complète
window.addEventListener('load', () => {
    initMap();
    initFilters();
    filterSites();
});