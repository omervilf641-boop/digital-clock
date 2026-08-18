// Timezone data with major cities
const timezones = [
    { city: 'New York', tz: 'America/New_York', emoji: '🗽' },
    { city: 'London', tz: 'Europe/London', emoji: '🇬🇧' },
    { city: 'Tokyo', tz: 'Asia/Tokyo', emoji: '🗾' },
    { city: 'Sydney', tz: 'Australia/Sydney', emoji: '🦘' },
    { city: 'Dubai', tz: 'Asia/Dubai', emoji: '🏙️' },
    { city: 'Singapore', tz: 'Asia/Singapore', emoji: '🌴' },
    { city: 'Hong Kong', tz: 'Asia/Hong_Kong', emoji: '🎎' },
    { city: 'Mumbai', tz: 'Asia/Kolkata', emoji: '🇮🇳' },
    { city: 'Paris', tz: 'Europe/Paris', emoji: '🗼' },
    { city: 'Berlin', tz: 'Europe/Berlin', emoji: '🇩🇪' },
    { city: 'Moscow', tz: 'Europe/Moscow', emoji: '🍄' },
    { city: 'Bangkok', tz: 'Asia/Bangkok', emoji: '🏖️' },
    { city: 'Istanbul', tz: 'Europe/Istanbul', emoji: '🕌' },
    { city: 'São Paulo', tz: 'America/Sao_Paulo', emoji: '🇧🇷' },
    { city: 'Mexico City', tz: 'America/Mexico_City', emoji: '🌮' },
    { city: 'Los Angeles', tz: 'America/Los_Angeles', emoji: '☀️' },
    { city: 'Chicago', tz: 'America/Chicago', emoji: '🌊' },
    { city: 'Toronto', tz: 'America/Toronto', emoji: '🍁' },
    { city: 'Seoul', tz: 'Asia/Seoul', emoji: '🇰🇷' },
    { city: 'Bangkok', tz: 'Asia/Bangkok', emoji: '🏝️' }
];

let displayedTimezones = [];
let use24HourFormat = true;

// Initialize with default timezones
function initializeDefault() {
    const defaultCities = ['New York', 'London', 'Tokyo', 'Sydney'];
    displayedTimezones = timezones.filter(tz => defaultCities.includes(tz.city));
    renderClocks();
}

// Render all clock cards
function renderClocks() {
    const grid = document.getElementById('clocksGrid');
    grid.innerHTML = '';

    displayedTimezones.forEach((tz, index) => {
        const card = document.createElement('div');
        card.className = 'clock-card active';
        card.innerHTML = `
            <button class="close-btn" onclick="removeTimezone(${index})" title="Remove timezone">✕</button>
            <div class="timezone-name">${tz.emoji} ${tz.city}</div>
            <div class="digital-time" id="time-${index}">--:--:--</div>
            <div class="date-display" id="date-${index}">---</div>
            <div class="day-display" id="day-${index}">---</div>
            <div class="offset-info" id="offset-${index}">---</div>
        `;
        grid.appendChild(card);
    });

    updateClocks();
}

// Update time for all clocks
function updateClocks() {
    displayedTimezones.forEach((tz, index) => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz.tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !use24HourFormat
        });

        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz.tz,
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const dayFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz.tz,
            weekday: 'long'
        });

        // Calculate offset
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz.tz }));
        const offset = (tzDate - utcDate) / (1000 * 60 * 60);
        const offsetStr = offset >= 0 ? `UTC+${offset.toFixed(1)}` : `UTC${offset.toFixed(1)}`;

        document.getElementById(`time-${index}`).textContent = formatter.format(now);
        document.getElementById(`date-${index}`).textContent = dateFormatter.format(now);
        document.getElementById(`day-${index}`).textContent = dayFormatter.format(now);
        document.getElementById(`offset-${index}`).textContent = offsetStr;
    });
}

// Search and add timezone
function searchTimezone() {
    const input = document.getElementById('timezoneInput').value.toLowerCase().trim();
    
    if (!input) {
        alert('Please enter a timezone or city name');
        return;
    }

    const found = timezones.find(tz => tz.city.toLowerCase().includes(input));
    
    if (!found) {
        alert(`Timezone "${input}" not found. Try: New York, London, Tokyo, Sydney, etc.`);
        return;
    }

    // Check if already added
    if (displayedTimezones.some(tz => tz.city === found.city)) {
        alert(`${found.city} is already displayed!`);
        return;
    }

    displayedTimezones.push(found);
    document.getElementById('timezoneInput').value = '';
    renderClocks();
}

// Remove timezone
function removeTimezone(index) {
    displayedTimezones.splice(index, 1);
    renderClocks();
}

// Toggle 12/24 hour format
function toggleFormat() {
    use24HourFormat = !use24HourFormat;
    updateClocks();
}

// Reset to default timezones
function resetDefault() {
    initializeDefault();
}

// Update clocks every second
setInterval(updateClocks, 1000);

// Allow Enter key in search box
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('timezoneInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchTimezone();
            }
        });
    }
    initializeDefault();
});