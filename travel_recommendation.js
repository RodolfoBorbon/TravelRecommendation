// Global variable to store the fetched data
let travelData = null;

// Fetch travel data from JSON file
async function fetchTravelData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        travelData = await response.json();
        console.log('Travel data loaded successfully:', travelData);
        return travelData;
    } catch (error) {
        console.error('Error fetching travel data:', error);
        return null;
    }
}

// Search function to filter results based on keywords
function searchRecommendations(keyword) {
    if (!travelData) {
        console.log('No data available. Please try again.');
        return [];
    }

    const searchTerm = keyword.toLowerCase().trim();
    let results = [];

    // Helper function to check if text matches search term
    function matchesSearch(text) {
        return text.toLowerCase().includes(searchTerm);
    }

    // Search beaches - check name and description
    travelData.beaches.forEach(beach => {
        if (matchesSearch(beach.name) || matchesSearch(beach.description)) {
            results.push(beach);
        }
    });

    // Search temples - check name and description
    travelData.temples.forEach(temple => {
        if (matchesSearch(temple.name) || matchesSearch(temple.description)) {
            results.push(temple);
        }
    });

    // Search countries and cities - check country names, city names, and descriptions
    travelData.countries.forEach(country => {
        // Check if country name matches
        if (matchesSearch(country.name)) {
            results.push(...country.cities);
        } else {
            // Check each city individually
            country.cities.forEach(city => {
                if (matchesSearch(city.name) || matchesSearch(city.description)) {
                    results.push(city);
                }
            });
        }
    });

    // If searching for category terms, include all items from that category
    if (searchTerm.includes('beach') || searchTerm.includes('beaches')) {
        travelData.beaches.forEach(beach => {
            if (!results.find(item => item.name === beach.name)) {
                results.push(beach);
            }
        });
    }
    
    if (searchTerm.includes('temple') || searchTerm.includes('temples')) {
        travelData.temples.forEach(temple => {
            if (!results.find(item => item.name === temple.name)) {
                results.push(temple);
            }
        });
    }
    
    if (searchTerm.includes('country') || searchTerm.includes('countries') || 
        searchTerm.includes('city') || searchTerm.includes('cities')) {
        travelData.countries.forEach(country => {
            country.cities.forEach(city => {
                if (!results.find(item => item.name === city.name)) {
                    results.push(city);
                }
            });
        });
    }

    console.log('Search results for "' + keyword + '":', results);
    return results;
}

// Display search results
function displayResults(results) {
    const resultsSection = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');

    if (results.length === 0) {
        resultsList.innerHTML = '<p class="no-results">No recommendations found for your search.</p>';
        resultsSection.style.display = 'block';
        return;
    }

    let html = '';
    results.forEach(item => {
        const timeInfo = getTimeForDestination(item.name);
        
        html += `
            <div class="result-card">
                <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='background.jpg'">
                <div class="result-content">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    ${timeInfo ? `<p class="time-info"><strong>Current Local Time:</strong> ${timeInfo}</p>` : ''}
                    <button class="visit-btn">Visit Now</button>
                </div>
            </div>
        `;
    });

    resultsList.innerHTML = html;
    resultsSection.style.display = 'block';
}

// Get current time for destination
function getTimeForDestination(destination) {
    const timeZones = {
        'Sydney': 'Australia/Sydney',
        'Melbourne': 'Australia/Melbourne',
        'Tokyo': 'Asia/Tokyo',
        'Kyoto': 'Asia/Tokyo',
        'Rio de Janeiro': 'America/Sao_Paulo',
        'São Paulo': 'America/Sao_Paulo',
        'Angkor Wat': 'Asia/Phnom_Penh',
        'Taj Mahal': 'Asia/Kolkata',
        'Bora Bora': 'Pacific/Tahiti',
        'Copacabana Beach': 'America/Sao_Paulo'
    };

    // Find matching timezone based on destination name
    let timeZone = null;
    for (const [key, zone] of Object.entries(timeZones)) {
        if (destination.toLowerCase().includes(key.toLowerCase())) {
            timeZone = zone;
            break;
        }
    }

    if (!timeZone) return null;

    try {
        const options = { 
            timeZone: timeZone, 
            hour12: true, 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric',
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };
        const currentTime = new Date().toLocaleString('en-US', options);
        return currentTime;
    } catch (error) {
        console.error('Error getting time for timezone:', timeZone, error);
        return null;
    }
}

// Clear search results
function clearResults() {
    const resultsSection = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    const searchBar = document.getElementById('search-bar');

    resultsList.innerHTML = '';
    resultsSection.style.display = 'none';
    searchBar.value = '';
    
    console.log('Search results cleared');
}

// Handle search button click
function handleSearch() {
    const searchBar = document.getElementById('search-bar');
    const keyword = searchBar.value.trim();

    if (!keyword) {
        alert('Please enter a search keyword');
        return;
    }

    const results = searchRecommendations(keyword);
    displayResults(results);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Fetch data when page loads
    await fetchTravelData();

    // Add event listeners
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const searchBar = document.getElementById('search-bar');
    const closeBtn = document.getElementById('close-results');

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', clearResults);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', clearResults);
    }

    if (searchBar) {
        // Allow searching by pressing Enter
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    console.log('Travel recommendation app initialized');
});