// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Données des sites
    const sites = {
        nature: [
            {
                name: "Jungfraujoch",
                lat: 46.5474,
                lng: 7.9854,
                type: "nature",
                region: "alpes",
                description: "Le plus haut col ferroviaire d'Europe"
            },
            {
                name: "Chutes du Rhin",
                lat: 47.6776,
                lng: 8.6159,
                type: "nature",
                region: "est",
                description: "Les plus grandes chutes d'eau d'Europe"
            }
        ],
        culture: [
            {
                name: "Château de Chillon",
                lat: 46.4142,
                lng: 6.9273,
                type: "culture",
                region: "lemanique",
                description: "Château médiéval sur le lac Léman"
            }
        ],
        ville: [
            {
                name: "Vieille ville de Berne",
                lat: 46.9480,
                lng: 7.4474,
                type: "ville",
                region: "centre",
                description: "Capitale de la Suisse, UNESCO"
            }
        ]
    };

    // Initialisation de la carte
    const map = L.map('map').setView([46.8182, 8.2275], 8);
    
    // Ajout des tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialisation du groupe de marqueurs
    const markers = L.markerClusterGroup();

    // Fonction pour afficher les sites
    function displaySites(region = 'all', type = 'all') {
        markers.clearLayers();
        
        Object.values(sites).flat().forEach(site => {
            if ((region === 'all' || site.region === region) &&
                (type === 'all' || site.type === type)) {
                
                const marker = L.marker([site.lat, site.lng])
                    .bindPopup(`
                        <h3>${site.name}</h3>
                        <p>${site.description}</p>
                    `);
                
                markers.addLayer(marker);
            }
        });
        
        map.addLayer(markers);
    }

    // Ajout des événements sur les filtres
    const regionFilter = document.getElementById('region-filter');
    const typeFilter = document.getElementById('type-filter');

    if (regionFilter && typeFilter) {
        regionFilter.addEventListener('change', function() {
            displaySites(this.value, typeFilter.value);
        });

        typeFilter.addEventListener('change', function() {
            displaySites(regionFilter.value, this.value);
        });
    }

    // Affichage initial
    displaySites();
});