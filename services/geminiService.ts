import { GoogleGenerativeAI } from "@google/generative-ai";

// Rate limiting implementation
class RateLimiter {
    private requests: number[] = [];
    private readonly maxRequests: number;
    private readonly timeWindow: number; // in milliseconds

    constructor(maxRequests: number = 10, timeWindowMinutes: number = 10) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindowMinutes * 60 * 1000;
    }

    canMakeRequest(): boolean {
        const now = Date.now();
        // Remove old requests outside the time window
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            return false;
        }
        
        this.requests.push(now);
        return true;
    }

    getTimeUntilReset(): number {
        if (this.requests.length === 0) return 0;
        const oldestRequest = Math.min(...this.requests);
        const timeUntilReset = this.timeWindow - (Date.now() - oldestRequest);
        return Math.max(0, timeUntilReset);
    }
}

// Input validation and sanitization
class InputValidator {
    private static readonly MAX_INPUT_LENGTH = 500;
    private static readonly SUSPICIOUS_PATTERNS = [
        /system|prompt|instruction|ignore|bypass/gi,
        /\b(api|key|token|secret|password)\b/gi,
        /<script|javascript:|data:/gi,
        /\{\{.*\}\}|\$\{.*\}/g, // Template injection
        /.{1000,}/g // Extremely long strings
    ];
    
    // Common non-fort related terms that should be blocked
    private static readonly NON_FORT_PATTERNS = [
        /\b(recipe|cooking|food|restaurant|hotel|menu|dish|meal|cuisine)\b/gi,
        /\b(movie|song|music|video|entertainment|game|sport)\b/gi,
        /\b(shopping|market|mall|store|buy|sell|price)\b/gi,
        /\b(weather|climate|temperature|rain|sun|cloud)\b/gi,
        /\b(medical|doctor|medicine|hospital|health|treatment)\b/gi,
        /\b(technology|computer|software|app|website|internet)\b/gi,
        /\b(politics|government|election|vote|party|minister)\b/gi,
        /\b(business|company|job|work|office|salary|career)\b/gi,
        /\b(education|school|college|university|study|exam)\b/gi,
        /\b(book|novel|story|poem|literature|author|write)\b/gi
    ];
    
    // Explicit content patterns that should be blocked
    private static readonly EXPLICIT_PATTERNS = [
        // Common explicit words (using word boundaries to avoid false positives)
        /\b(fuck|shit|damn|hell|ass|bitch|bastard|crap)\b/gi,
        /\b(sex|porn|nude|naked|xxx|adult)\b/gi,
        /\b(kill|murder|death|die|suicide|violence)\b/gi,
        /\b(hate|racist|terrorism|bomb|weapon|gun)\b/gi,
        // Drug-related terms
        /\b(drug|cocaine|marijuana|weed|heroin|meth)\b/gi,
        // Inappropriate content
        /\b(rape|abuse|harassment|stalking)\b/gi
    ];
    
    // Fort-related keywords that indicate valid requests
    private static readonly FORT_KEYWORDS = [
        /\b(fort|forts|qila|gad|garh|killa)\b/gi,
        /\b(trek|trekking|hiking|climb|climbing)\b/gi,
        /\b(maharashtra|pune|mumbai|nashik|aurangabad|kolhapur|satara|sangli)\b/gi,
        /\b(maratha|shivaji|peshwa|mughal|british|sultanate)\b/gi,
        /\b(mountain|hill|peak|valley|range|sahyadri|western ghats)\b/gi,
        /\b(adventure|expedition|journey|trip|travel|visit)\b/gi,
        /\b(historical|heritage|ancient|medieval|ruins|architecture)\b/gi,
        /\b(raigad|sinhagad|lohagad|pratapgad|rajgad|torna|shivneri|purandar)\b/gi
    ];

    static validateAndSanitize(input: string): { isValid: boolean; sanitized: string; reason?: string } {
        if (!input || typeof input !== 'string') {
            return { isValid: false, sanitized: '', reason: 'Invalid input type' };
        }

        // Length check
        if (input.length > this.MAX_INPUT_LENGTH) {
            return { 
                isValid: false, 
                sanitized: '', 
                reason: `Input too long. Maximum ${this.MAX_INPUT_LENGTH} characters allowed.` 
            };
        }

        // Suspicious pattern check
        for (const pattern of this.SUSPICIOUS_PATTERNS) {
            if (pattern.test(input)) {
                return { 
                    isValid: false, 
                    sanitized: '', 
                    reason: 'Input contains suspicious content' 
                };
            }
        }
        
        // Check for explicit content
        for (const pattern of this.EXPLICIT_PATTERNS) {
            if (pattern.test(input)) {
                return { 
                    isValid: false, 
                    sanitized: '', 
                    reason: 'Please use appropriate language. This is a family-friendly travel app.' 
                };
            }
        }
        
        // Check for non-fort related content
        const hasNonFortContent = this.NON_FORT_PATTERNS.some(pattern => pattern.test(input));
        const hasFortContent = this.FORT_KEYWORDS.some(pattern => pattern.test(input));
        
        // If input contains non-fort keywords and no fort-related keywords, reject it
        if (hasNonFortContent && !hasFortContent) {
            return {
                isValid: false,
                sanitized: '',
                reason: 'Please enter fort names or trekking-related requests. This app specializes in Maharashtra fort adventures.'
            };
        }
        
        // If input doesn't contain any fort-related keywords and is not a general travel request, be more strict
        if (!hasFortContent && input.length > 20) {
            // Check if it's a reasonable travel/adventure request (including words like 'beginners' for trek context)
            const travelKeywords = /\b(trip|travel|visit|explore|adventure|weekend|day|getaway|tour|journey|beginners|easy|difficult|moderate)\b/gi;
            if (!travelKeywords.test(input)) {
                return {
                    isValid: false,
                    sanitized: '',
                    reason: 'Please specify fort names or describe your trekking adventure. Example: "Raigad fort" or "weekend trek near Pune".'
                };
            }
        }

        // Basic sanitization
        const sanitized = input
            .replace(/[<>"']/g, '') // Remove potential HTML/script characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        return { isValid: true, sanitized };
    }
}

// Simple cache implementation
class SimpleCache {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly TTL = 30 * 60 * 1000; // 30 minutes

    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        if (Date.now() - entry.timestamp > this.TTL) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    set(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    clear(): void {
        this.cache.clear();
    }
}

// Global instances
const rateLimiter = new RateLimiter(8, 10); // 8 requests per 10 minutes
const cache = new SimpleCache();

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('API Key Debug Info:', {
    present: !!apiKey,
    length: apiKey?.length || 0,
    startsWithAI: apiKey?.startsWith('AIza') || false
});

if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY environment variable is not set.");
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
}

if (!apiKey.startsWith('AIza')) {
    console.error("API key format appears invalid. Expected to start with 'AIza'.");
    throw new Error("API key format appears invalid.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface ItineraryFilters {
    fortsList: string;
    difficulty: string;
    regions: string[];
    proximity: string;
    mountainRange: string;
    trekDuration: string;
    trailTypes: string[];
    historicalSignificance: string;
    fortType: string;
    keyFeatures: string[];
}

export interface ItineraryResult {
    itineraryText: string;
    coordinates: { lat: number; lng: number } | null;
}

export interface WeatherResult {
    locationName: string;
    date: string;
    condition: string;
    icon: 'Sunny' | 'PartlyCloudy' | 'Cloudy' | 'Rain' | 'Thunderstorm' | 'Snow' | 'Windy' | 'Fog';
    temperatureMinC: number;
    temperatureMaxC: number;
    windSpeedKmh: number;
    summary: string;
}

// Map Open-Meteo weather codes to our icon types
const mapWeatherIcon = (weatherCode: number): WeatherResult['icon'] => {
    // Open-Meteo weather code mappings
    // Reference: https://open-meteo.com/en/docs
    if (weatherCode === 0) return 'Sunny'; // Clear sky
    if (weatherCode >= 1 && weatherCode <= 3) return 'PartlyCloudy'; // Mainly clear, partly cloudy, overcast
    if (weatherCode >= 45 && weatherCode <= 48) return 'Fog'; // Fog and depositing rime fog
    if (weatherCode >= 51 && weatherCode <= 57) return 'Rain'; // Drizzle
    if (weatherCode >= 61 && weatherCode <= 67) return 'Rain'; // Rain
    if (weatherCode >= 71 && weatherCode <= 77) return 'Snow'; // Snow fall
    if (weatherCode >= 80 && weatherCode <= 82) return 'Rain'; // Rain showers
    if (weatherCode >= 85 && weatherCode <= 86) return 'Snow'; // Snow showers
    if (weatherCode >= 95 && weatherCode <= 99) return 'Thunderstorm'; // Thunderstorm
    
    return 'PartlyCloudy'; // default
};

// Get human-readable weather description from weather code
const getWeatherDescription = (weatherCode: number): string => {
    const descriptions: { [key: number]: string } = {
        0: 'clear sky',
        1: 'mainly clear',
        2: 'partly cloudy',
        3: 'overcast',
        45: 'fog',
        48: 'depositing rime fog',
        51: 'light drizzle',
        53: 'moderate drizzle',
        55: 'dense drizzle',
        56: 'light freezing drizzle',
        57: 'dense freezing drizzle',
        61: 'slight rain',
        63: 'moderate rain',
        65: 'heavy rain',
        66: 'light freezing rain',
        67: 'heavy freezing rain',
        71: 'slight snow fall',
        73: 'moderate snow fall',
        75: 'heavy snow fall',
        77: 'snow grains',
        80: 'slight rain showers',
        81: 'moderate rain showers',
        82: 'violent rain showers',
        85: 'slight snow showers',
        86: 'heavy snow showers',
        95: 'thunderstorm',
        96: 'thunderstorm with slight hail',
        99: 'thunderstorm with heavy hail'
    };
    
    return descriptions[weatherCode] || 'unknown conditions';
};

// Get location name from coordinates using Nominatim (OpenStreetMap) geocoding API
const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'Swarajya-Trails-App'
                }
            }
        );
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        if (data && data.address) {
            const address = data.address;
            
            // Try to build a meaningful location name for Indian locations
            let locationParts = [];
            
            // Add specific place name (village, town, etc.)
            if (address.village) locationParts.push(address.village);
            else if (address.town) locationParts.push(address.town);
            else if (address.city) locationParts.push(address.city);
            else if (address.municipality) locationParts.push(address.municipality);
            
            // Add district/state
            if (address.state_district && !locationParts.some(part => part.includes(address.state_district))) {
                locationParts.push(address.state_district);
            }
            if (address.state) locationParts.push(address.state);
            
            if (locationParts.length > 0) {
                return locationParts.join(', ');
            }
            
            // Fallback to display_name if structured address fails
            if (data.display_name) {
                const parts = data.display_name.split(',').slice(0, 3); // Take first 3 parts
                return parts.join(',').trim();
            }
        }
    } catch (error) {
        console.warn('Reverse geocoding failed:', error);
    }
    
    // More descriptive fallback with region info
    const region = getRegionFromCoordinates(lat, lng);
    return `${region} (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
};

// Helper function to determine region from coordinates (rough estimation for Maharashtra)
const getRegionFromCoordinates = (lat: number, lng: number): string => {
    // Rough coordinate ranges for different regions in Maharashtra
    if (lat >= 18.4 && lat <= 18.6 && lng >= 73.7 && lng <= 74.0) return 'Pune Region';
    if (lat >= 19.0 && lat <= 19.3 && lng >= 72.7 && lng <= 73.0) return 'Mumbai Region';
    if (lat >= 19.7 && lat <= 20.2 && lng >= 75.2 && lng <= 75.9) return 'Aurangabad Region';
    if (lat >= 21.0 && lat <= 21.3 && lng >= 78.8 && lng <= 79.2) return 'Nagpur Region';
    if (lat >= 16.8 && lat <= 17.4 && lng >= 74.0 && lng <= 74.5) return 'Kolhapur Region';
    if (lat >= 17.6 && lat <= 18.1 && lng >= 74.0 && lng <= 74.4) return 'Satara Region';
    
    // Default for other areas in Maharashtra
    if (lat >= 15.6 && lat <= 22.0 && lng >= 72.6 && lng <= 80.9) return 'Maharashtra';
    
    return 'Near Fort Location';
};

export const getWeatherForecast = async (lat: number, lng: number, date?: string): Promise<WeatherResult> => {
    console.log('Using Open-Meteo Weather API (no API key required)');
    
    try {
        const locationName = await getLocationName(lat, lng);
        const currentDate = new Date().toISOString().split('T')[0];
        const requestedDate = date || currentDate;
        
        // Determine date range for API call
        const today = new Date();
        const targetDate = new Date(requestedDate);
        const daysDiff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Open-Meteo supports forecasts up to 16 days
        if (daysDiff > 16) {
            throw new Error(`Weather forecast is only available for the next 16 days. Please select a date between today and ${new Date(today.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}.`);
        }
        
        // Prepare date range for API call
        let startDate, endDate;
        if (daysDiff <= 0) {
            // Current weather - get today's data
            startDate = endDate = currentDate;
        } else {
            // Future forecast - get specific date
            startDate = endDate = requestedDate;
        }
        
        // Call Open-Meteo API
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto&start_date=${startDate}&end_date=${endDate}`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
            throw new Error(`No weather data available for the requested date.`);
        }
        
        // Extract weather data for the requested date
        const dateIndex = data.daily.time.findIndex((d: string) => d === (daysDiff <= 0 ? currentDate : requestedDate));
        
        if (dateIndex === -1) {
            throw new Error(`No weather data available for ${daysDiff <= 0 ? currentDate : requestedDate}.`);
        }
        
        const weatherCode = data.daily.weather_code[dateIndex];
        const tempMin = Math.round(data.daily.temperature_2m_min[dateIndex]);
        const tempMax = Math.round(data.daily.temperature_2m_max[dateIndex]);
        const windSpeed = Math.round(data.daily.wind_speed_10m_max[dateIndex]);
        
        const condition = getWeatherDescription(weatherCode);
        const icon = mapWeatherIcon(weatherCode);
        
        const summary = daysDiff <= 0 
            ? `${condition.charAt(0).toUpperCase() + condition.slice(1)}. Temperature range ${tempMin}°C to ${tempMax}°C with winds up to ${windSpeed} km/h.`
            : `Expected ${condition} with temperature range ${tempMin}°C to ${tempMax}°C and winds up to ${windSpeed} km/h.`;
        
        return {
            locationName,
            date: daysDiff <= 0 ? currentDate : requestedDate,
            condition,
            icon,
            temperatureMinC: tempMin,
            temperatureMaxC: tempMax,
            windSpeedKmh: windSpeed,
            summary
        };
        
    } catch (error) {
        console.error("Error getting weather forecast:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get weather forecast. Please try again later.");
    }
};

export const getInspiration = async (filters: ItineraryFilters): Promise<string> => {
    let prompt = 'Suggest one interesting fort in Maharashtra for a trek.';
    let constraints = '';
    let hasConstraints = false;

    const addConstraint = (text: string) => {
        if (!hasConstraints) {
            constraints += "\n\nThe suggestion must match the following user preferences:\n";
            hasConstraints = true;
        }
        constraints += text;
    };

    if (filters.difficulty !== 'Any') {
        addConstraint(`*   **Trek Difficulty:** ${filters.difficulty}.\n`);
    }
    if (filters.regions.length > 0) {
        addConstraint(`*   **Region/District:** Within ${filters.regions.join(' or ')}.\n`);
    }
    if (filters.proximity !== 'Any') {
        addConstraint(`*   **Proximity to City:** Near ${filters.proximity}.\n`);
    }
    if (filters.mountainRange !== 'Any') {
        addConstraint(`*   **Mountain Range:** In the ${filters.mountainRange} range.\n`);
    }
    if (filters.trekDuration !== 'Any') {
        addConstraint(`*   **Trek Duration:** Should take ${filters.trekDuration}.\n`);
    }
    if (filters.trailTypes.length > 0) {
        addConstraint(`*   **Trail Type:** Features ${filters.trailTypes.join(', ')}.\n`);
    }
    if (filters.historicalSignificance !== 'Any') {
        addConstraint(`*   **Historical Period:** From the ${filters.historicalSignificance} period.\n`);
    }
    if (filters.fortType !== 'Any') {
        addConstraint(`*   **Fort Type:** A **${filters.fortType}** fort.\n`);
    }
    if (filters.keyFeatures.length > 0) {
        addConstraint(`*   **Key Features:** Has **${filters.keyFeatures.join(', ')}**.\n`);
    }

    if (!hasConstraints) {
        prompt = 'Suggest one interesting and popular fort in Maharashtra for a trek.';
    }

    prompt += constraints;
    prompt += "\n\nReturn ONLY the name of the fort. For example: 'Raigad'. Do not add any extra text, markdown, or quotation marks.";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
            },
        });
        const response = await result.response;
        return response.text().replace(/['".,*]+/g, '').trim();
    } catch (error) {
        console.error("Error getting inspiration from Gemini:", error);
        throw new Error("Failed to get a suggestion. The AI service may be temporarily unavailable.");
    }
};

export const generateItinerary = async (filters: ItineraryFilters): Promise<ItineraryResult> => {
    // Check rate limiting
    if (!rateLimiter.canMakeRequest()) {
        const resetTime = Math.ceil(rateLimiter.getTimeUntilReset() / 1000 / 60); // minutes
        throw new Error(`Rate limit exceeded. Please wait ${resetTime} minutes before making another request.`);
    }

    // Validate and sanitize user input
    const validation = InputValidator.validateAndSanitize(filters.fortsList);
    if (!validation.isValid) {
        throw new Error(`Invalid input: ${validation.reason}`);
    }
    
    // Use sanitized input
    const sanitizedFilters = { ...filters, fortsList: validation.sanitized };
    
    // Check cache first
    const cacheKey = JSON.stringify(sanitizedFilters);
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        console.log('Returning cached itinerary result');
        return cachedResult;
    }
    let constraints = '';
    let hasConstraints = false;

    const addConstraint = (text: string) => {
        if (!hasConstraints) {
            constraints += "IMPORTANT: Please adhere to the following user preferences:\n";
            hasConstraints = true;
        }
        constraints += text;
    };

    if (filters.difficulty !== 'Any') {
        addConstraint(`*   **Trek Difficulty:** The user has specified a trek difficulty of **${filters.difficulty}**. Please ensure the suggested treks and routes match this level.\n`);
    }
    if (filters.regions.length > 0) {
        addConstraint(`*   **Region/District:** The itinerary should be focused on forts within the following region(s): **${filters.regions.join(', ')}**.\n`);
    }
    if (filters.proximity !== 'Any') {
        addConstraint(`*   **Proximity to City:** The user wants forts that are easily accessible from **${filters.proximity}**.\n`);
    }
    if (filters.mountainRange !== 'Any') {
        addConstraint(`*   **Mountain Range:** Prioritize forts located in the **${filters.mountainRange}** range.\n`);
    }
    if (filters.trekDuration !== 'Any') {
        addConstraint(`*   **Trek Duration:** The trek duration should be **${filters.trekDuration}**.\n`);
    }
    if (filters.trailTypes.length > 0) {
        addConstraint(`*   **Trail Type:** The trail should feature the following characteristics: **${filters.trailTypes.join(', ')}**.\n`);
    }
    if (filters.historicalSignificance !== 'Any') {
        addConstraint(`*   **Historical Period:** The fort should have significant history from the **${filters.historicalSignificance}**.\n`);
    }
    if (filters.fortType !== 'Any') {
        addConstraint(`*   **Fort Type:** The chosen fort should be a **${filters.fortType}** fort.\n`);
    }
    if (filters.keyFeatures.length > 0) {
        addConstraint(`*   **Key Features:** Please ensure the fort has the following features: **${filters.keyFeatures.join(', ')}**.\n`);
    }
    
    const userRequest = filters.fortsList.trim()
      ? `The user wants to visit the following fort(s): **${filters.fortsList.trim()}**. Create a detailed itinerary for this specific request.`
      : `The user has not specified a fort. Based on their preferences below, please **recommend one or two suitable forts** and then generate a detailed itinerary for them.`;


    const prompt = `
    You are "Swarajya Trail," an expert AI travel planner specializing in the historical forts of Maharashtra, India. Your task is to generate a personalized, practical, and inspiring travel itinerary for a user.

    **User's Request:**
    ${userRequest}
    
    ${constraints}

    **Itinerary Generation Instructions:**
    Generate a detailed itinerary. The tone should be encouraging and knowledgeable. If recommending a fort, briefly explain why it matches the user's criteria. For each fort or travel segment, provide the following information:

    1.  **Overview:** A brief, exciting summary of the journey ahead.
    2.  **Route & Transportation 🚌:**
        *   Clear directions for travel between forts if multiple are listed, or to the fort from a major city (like Pune or Mumbai).
        *   Include options for both private vehicles (car/bike) and public transport (MSRTC buses, trains, local jeeps).
        *   Mention key base cities/villages.
        *   Provide realistic estimated travel times.
    3.  **Best Time to Visit ⏰:**
        *   Specify the ideal seasons (e.g., Post-Monsoon: September to November) and explain why (e.g., for the lush greenery and pleasant climate).
    4.  **Accommodation & Food 🍽️:**
        *   Suggest accommodation types (e.g., hotels, homestays) near base villages.
        *   Recommend local Maharashtrian dishes to try.
    5.  **The Fort Experience 🚩:**
        *   A brief, engaging history of each fort.
        *   List key points of interest on the fort using a numbered list.
        *   Mention the approximate time needed to explore the fort.
    6.  **Pro-Tips ✨:** A small section with practical advice like what to carry, trek difficulty (confirming it matches the user's preference if specified), entry fees, and mobile network availability.
    
    **IMPORTANT**: At the very end of your response, include the coordinates for the main fort on a separate line in this exact format: \`Coordinates: 18.2345, 73.4456\`. This should be the last line of your response and will be used for mapping purposes. Do not include any text after the coordinates.

    Structure the entire response using clean, hierarchical markdown. Follow these rules strictly:
    -   **Main Title:** Use a single Level 1 heading (#) for the overall trip title (e.g., "# Your Epic Fort Adventure: Raigad").
    -   **Main Sections:** Use Level 2 headings (##) for the main sections listed above (e.g., "## Route & Transportation 🚌").
    -   **Sub-sections:** Use Level 3 headings (###) for specific points within a section, for example, for individual forts if multiple are listed under "The Fort Experience 🚩".
    -   **Lists:**
        -   Use bulleted lists (*) for simple, unordered items (like in Pro-Tips).
        -   Use numbered lists (1., 2., 3.) for sequential steps or points of interest on a fort.
    -   **Emphasis:** Use bold text (**) for important keywords or names.
    -   **DO NOT** mix heading levels improperly (e.g., putting a ## inside a list).
    -   **DO NOT** use triple backticks (\`\`\`) in your response.

    Sprinkle in relevant emojis as shown in the section titles above to make the plan more engaging.
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const response = await result.response;
        
        const itineraryText = response.text();
        let coordinates: { lat: number; lng: number } | null = null;

        const coordRegex = /Coordinates:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
        const match = itineraryText.match(coordRegex);

        if (match && match[1] && match[2]) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                coordinates = { lat, lng };
            }
        }
        
        const itineraryResult = { itineraryText, coordinates };
        
        // Cache the result for future requests
        cache.set(cacheKey, itineraryResult);
        
        return itineraryResult;

    } catch (error) {
        console.error("Error generating itinerary from Gemini:", error);
        throw new Error("Failed to generate itinerary. The AI service may be temporarily unavailable.");
    }
};
