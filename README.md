# ⏰ Digital Clock - Multi Timezone Dashboard

A beautiful, real-time digital clock dashboard that displays current time across multiple time zones worldwide.

## ✨ Features

- 🌍 **20+ Major Cities** - Pre-configured with major cities worldwide
- 🔄 **Real-time Updates** - Clock updates every second
- 🏙️ **Add Custom Timezones** - Search and add any timezone
- 🕐 **12/24 Hour Toggle** - Switch between time formats
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 📍 **Timezone Offset** - Shows UTC offset for each timezone
- 📅 **Date & Day Display** - Shows full date and day of week

## 🚀 Getting Started

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/omervilf641-boop/digital-clock.git
cd digital-clock
```

2. Open `index.html` in your web browser:
   - Simply double-click `index.html` or
   - Drag it to your browser window

3. That's it! The clock will start running immediately.

### Using a Local Server (Recommended)

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if installed)
npx http-server
```

Then open `http://localhost:8000` in your browser.

## 🎮 How to Use

### Default View
The clock comes pre-loaded with 4 major cities:
- 🗽 New York (America/New_York)
- 🇬🇧 London (Europe/London)
- 🗾 Tokyo (Asia/Tokyo)
- 🦘 Sydney (Australia/Sydney)

### Add a Timezone
1. Type a city name in the search box (e.g., "Paris", "Dubai", "Singapore")
2. Press Enter or click "Add Timezone"
3. The new clock will appear on the grid

### Remove a Timezone
- Click the ✕ button on any clock card to remove it

### Toggle Time Format
- Click "🔄 Toggle 12/24 Hour" to switch between formats
- Example: `14:30:45` ↔ `2:30:45 PM`

### Reset to Default
- Click "🔄 Reset to Default" to restore the original 4 cities

## 📋 Supported Timezones

The dashboard includes these cities:

**Americas**
- New York (EST/EDT)
- Los Angeles (PST/PDT)
- Chicago (CST/CDT)
- Toronto (EST/EDT)
- Mexico City (CST/CDT)
- São Paulo (BRT)

**Europe**
- London (GMT/BST)
- Paris (CET/CEST)
- Berlin (CET/CEST)
- Moscow (MSK)
- Istanbul (EET/EEST)

**Asia**
- Dubai (GST)
- Singapore (SGT)
- Hong Kong (HKT)
- Tokyo (JST)
- Seoul (KST)
- Bangkok (ICT)
- Mumbai (IST)

**Oceania**
- Sydney (AEDT/AEST)

## 🎨 Features Explained

### Real-time Updates
Each clock updates every second with the current time in its timezone.

### UTC Offset
Shows the difference from UTC time:
- `UTC+9.0` for Tokyo
- `UTC-5.0` for New York
- `UTC+0.0` for London

### Date Information
Each clock displays:
- Current date (e.g., "Aug 18, 2026")
- Day of week (e.g., "Monday")
- Time with seconds precision

### Responsive Layout
- Desktop: 3-4 clocks per row
- Tablet: 2 clocks per row
- Mobile: 1 clock per row

## 🛠️ Technical Details

### Technologies
- **HTML5** - Semantic markup
- **CSS3** - Gradient backgrounds, flexbox, CSS Grid
- **JavaScript** - Intl API for timezone handling

### Browser Support
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### File Structure
```
digital-clock/
├── index.html       # Main HTML file
├── style.css        # Styling and layout
├── script.js        # Clock logic and interactions
└── README.md        # This file
```

## 🎯 Use Cases

- **Global Teams** - Track time across team members in different zones
- **International Meetings** - Schedule across timezones easily
- **Travel Planning** - Check time differences before booking flights
- **Business Hours** - Know when offices open/close worldwide
- **Learning** - Understand timezone differences visually

## 🐛 Troubleshooting

### Clock not updating?
- Ensure JavaScript is enabled in your browser
- Try refreshing the page
- Check browser console for errors (F12)

### Timezone not found?
- Make sure you spelled the city name correctly
- Check the supported timezones list above
- Try a major city name instead

### Time seems incorrect?
- Check your system clock is set correctly
- Verify your computer's timezone setting
- The clock uses your device's system time

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Want to add more timezones or features? Feel free to fork and create a pull request!

### Ideas for Enhancement
- [ ] Add 12-hour/24-hour auto-detection based on locale
- [ ] Save favorite timezones to localStorage
- [ ] Add alarm/reminder functionality
- [ ] Show sunrise/sunset times
- [ ] Add analog clock display option
- [ ] Dark mode toggle
- [ ] Export schedule as image

## 🌟 Credits

Created with ❤️ for global teams and timezone enthusiasts.

---

**Version**: 1.0.0  
**Last Updated**: August 18, 2026
