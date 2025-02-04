// Structure de données pour tous les sites
const sites = {
    culture: [
        {
            name: "Château de Chillon",
            lat: 46.4142,
            lng: 6.9273,
            type: "culture",
            region: "lemanique",
            description: "Château médiéval sur le lac Léman",
            itineraires: ["historique", "lacs"]
        },
        {
            name: "Musée Paul Klee",
            lat: 46.9432,
            lng: 7.4617,
            type: "culture",
            region: "berne",
            description: "Musée d'art moderne",
            itineraires: ["art"]
        }
    ],
    nature: [
        {
            name: "Chutes du Rhin",
            lat: 47.6776,
            lng: 8.6159,
            type: "nature",
            region: "est",
            description: "Plus grandes chutes d'eau d'Europe",
            itineraires: ["nature", "lacs"]
        },
        {
            name: "Gorges de l'Areuse",
            lat: 46.9501,
            lng: 6.7424,
            type: "nature",
            region: "ouest",
            description: "Gorges spectaculaires",
            itineraires: ["nature"]
        }
    ],
    traditions: [
        {
            name: "Gruyères",
            lat: 46.5843,
            lng: 7.0828,
            type: "traditions",
            region: "fribourg",
            description: "Village médiéval et fromagerie",
            itineraires: ["gastronomie", "traditions"]
        }
    ]
};

// Initialisation de la carte
let map;
let markers = [];

function initMap() {
    map = L.map('map').setView([46.8182, 8.2275], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Filtres
function filterSites(type = 'all', region = 'all', itineraire = 'all') {
    // Effacer tous les marqueurs
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Parcourir tous les types de sites
    Object.values(sites).flat().forEach(site => {
        if (
            (type === 'all' || site.type === type) &&
            (region === 'all' || site.region === region) &&
            (itineraire === 'all' || site.itineraires.includes(itineraire))
        ) {
            const marker = L.marker([site.lat, site.lng])
                .bindPopup(`
                    <strong>${site.name}</strong><br>
                    ${site.description}
                `);
            marker.addTo(map);
            markers.push(marker);
        }
    });
}

// Initialisation des contrôles de filtre
function initFilters() {
    const typeSelect = document.getElementById('type-filter');
    const regionSelect = document.getElementById('region-filter');
    const itineraireSelect = document.getElementById('itineraire-filter');

    typeSelect.addEventListener('change', () => {
        filterSites(
            typeSelect.value,
            regionSelect.value,
            itineraireSelect.value
        );
    });

    regionSelect.addEventListener('change', () => {
        filterSites(
            typeSelect.value,
            regionSelect.value,
            itineraireSelect.value
        );
    });

    itineraireSelect.addEventListener('change', () => {
        filterSites(
            typeSelect.value,
            regionSelect.value,
            itineraireSelect.value
        );
    });
}

// Initialisation de la carte au chargement
window.addEventListener('load', () => {
    initMap();
    initFilters();
    filterSites(); // Afficher tous les sites par défaut
});