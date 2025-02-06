// Configuration des APIs
const WEATHER_API_KEY = 'YOUR_API_KEY';
const MAPBOX_TOKEN = 'YOUR_TOKEN';

// Principales villes suisses pour le filtrage par temps de trajet
const majorCities = {
    'Zürich': { lat: 47.3769, lng: 8.5417 },
    'Genève': { lat: 46.2044, lng: 6.1432 },
    'Berne': { lat: 46.9480, lng: 7.4474 },
    'Lausanne': { lat: 46.5197, lng: 6.6323 },
    'Lucerne': { lat: 47.0502, lng: 8.3093 }
};

// Temps de trajet depuis les villes principales
const travelTimes = {
    'Zürich': {
        'Château de Chillon': 180,
        'Gruyères': 150,
        'Zermatt': 210,
        // ... autres destinations
    },
    // ... autres villes de départ
};

// Classe pour gérer les itinéraires personnalisés
class ItineraryPlanner {
    constructor() {
        this.preferences = {
            duration: 0,
            interests: [],
            startCity: ''
        };
    }

    // Génère un itinéraire personnalisé
    generateItinerary() {
        const days = Math.floor(this.preferences.duration);
        let itinerary = [];
        let availableTime = days * 8; // 8 heures de visite par jour

        // Filtre les sites selon les intérêts
        let possibleSites = Object.values(sites).flat().filter(site => 
            this.preferences.interests.some(interest => 
                site.type === interest || site.itineraires.includes(interest)
            )
        );

        // Trie par proximité avec la ville de départ
        if (this.preferences.startCity) {
            const startCoords = majorCities[this.preferences.startCity];
            possibleSites.sort((a, b) => 
                this.calculateDistance(startCoords, a) - 
                this.calculateDistance(startCoords, b)
            );
        }

        // Construit l'itinéraire
        let currentTime = 0;
        for (let site of possibleSites) {
            if (currentTime + site.visitDuration <= availableTime) {
                itinerary.push(site);
                currentTime += site.visitDuration;
            }
        }

        return this.optimizeItinerary(itinerary);
    }

    // Calcule la distance entre deux points
    calculateDistance(point1, point2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLon = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    // Optimise l'itinéraire pour minimiser les temps de trajet
    optimizeItinerary(itinerary) {
        // Algorithme du voyageur de commerce simplifié
        let optimized = [itinerary[0]];
        let remaining = itinerary.slice(1);

        while (remaining.length > 0) {
            let lastPoint = optimized[optimized.length - 1];
            let nextIndex = 0;
            let minDistance = Infinity;

            for (let i = 0; i < remaining.length; i++) {
                let distance = this.calculateDistance(lastPoint, remaining[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nextIndex = i;
                }
            }

            optimized.push(remaining[nextIndex]);
            remaining.splice(nextIndex, 1);
        }

        return optimized;
    }
}

// Classe pour gérer la météo
class WeatherManager {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 1800000; // 30 minutes
    }

    async getWeather(lat, lng) {
        const cacheKey = `${lat},${lng}`;
        const now = Date.now();

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (now - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
            );
            const data = await response.json();

            this.cache.set(cacheKey, {
                timestamp: now,
                data: data
            });

            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la météo:', error);
            return null;
        }
    }

    // Formate les données météo pour l'affichage
    formatWeatherData(data) {
        if (!data) return 'Données météo non disponibles';

        return `
            <div class="weather-info">
                <strong>${data.weather[0].description}</strong><br>
                Température: ${Math.round(data.main.temp)}°C<br>
                Humidité: ${data.main.humidity}%<br>
                Vent: ${Math.round(data.wind.speed * 3.6)} km/h
            </div>
        `;
    }
}

// Classe pour gérer les zones de temps de trajet
class TravelTimeManager {
    constructor(map) {
        this.map = map;
        this.isochrones = new L.LayerGroup();
        this.map.addLayer(this.isochrones);
    }

    // Affiche les zones accessibles depuis une ville
    async showAccessibleAreas(city, maxDuration) {
        this.isochrones.clearLayers();

        const coords = majorCities[city];
        if (!coords) return;

        try {
            const response = await fetch(
                `https://api.mapbox.com/isochrone/v1/mapbox/driving/${coords.lng},${coords.lat}?contours_minutes=${maxDuration}&polygons=true&access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();

            L.geoJSON(data, {
                style: {
                    color: '#2196F3',
                    weight: 2,
                    opacity: 0.4,
                    fillColor: '#2196F3',
                    fillOpacity: 0.2
                }
            }).addTo(this.isochrones);
        } catch (error) {
            console.error('Erreur lors de la récupération des isochrones:', error);
        }
    }
}

// Export des classes pour utilisation dans l'application principale
export { ItineraryPlanner, WeatherManager, TravelTimeManager };