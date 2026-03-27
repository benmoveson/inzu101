# EstateHub - Real Estate PWA 🏠

A modern, feature-rich Progressive Web Application for browsing and discovering real estate properties.

## ✨ Features

- **🏡 Property Listings**: Browse through a curated collection of premium properties
- **🔍 Advanced Search**: Filter by type, price range, bedrooms, and more
- **❤️ Favorites**: Save your favorite properties for later viewing
- **📱 PWA Support**: Install on mobile devices for app-like experience
- **🎨 Modern Design**: Beautiful UI with glassmorphism, gradients, and smooth animations
- **📸 Image Gallery**: Full-screen lightbox for property images
- **👤 User Profile**: Manage preferences and account settings
- **📞 Contact Agents**: Directly reach out to property agents
- **🌐 Offline Support**: Browse cached properties even without internet

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📱 PWA Installation

### Desktop
1. Visit the website in Chrome, Edge, or other PWA-compatible browsers
2. Look for the install icon in the address bar
3. Click "Install" to add EstateHub to your desktop

### Mobile
1. Visit the website on your mobile device
2. Tap the browser menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will appear on your home screen like a native app

## 🎨 PWA Icons

**Important**: You need to add PWA icons to the `public` folder:

1. Create two PNG icons:
   - `icon-192x192.png` (192x192 pixels)
   - `icon-512x512.png` (512x512 pixels)

2. Place them in the `public` folder

**Icon Design Suggestion**:
- Use a simple house/home icon in white
- Background: Blue gradient (#3b82f6 to #2563eb)
- Keep it minimal and recognizable at small sizes

You can use tools like:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Any graphic design tool (Figma, Canva, etc.)

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Routing**: React Router v6
- **Styling**: Vanilla CSS with CSS Variables
- **Icons**: Lucide React
- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa with Workbox

## 📂 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.jsx
│   ├── PropertyCard.jsx
│   └── ...
├── pages/              # Page components
│   ├── Home.jsx
│   ├── SearchPage.jsx
│   ├── PropertyDetails.jsx
│   ├── Favorites.jsx
│   └── Profile.jsx
├── data/               # Mock data
│   └── properties.js
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles & design system
```

## 🎨 Design System

The app uses a comprehensive design system with:
- **Color Palette**: Primary blues, accent oranges, and neutral grays
- **Typography**: Inter for body text, Outfit for headings
- **Spacing**: Consistent spacing scale
- **Shadows**: Multiple shadow levels for depth
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Customization

### Changing Colors

Edit the CSS variables in `src/index.css`:

```css
:root {
  --primary-500: hsl(220, 75%, 55%);
  --accent-500: hsl(25, 75%, 55%);
  /* ... more colors */
}
```

### Adding Properties

Edit `src/data/properties.js` to add or modify property listings.

### Modifying Filters

Update filter options in `src/data/properties.js`:
- `propertyTypes`
- `priceRanges`
- `bedroomOptions`

## 📱 Features in Detail

### Property Search
- Real-time search across title, location, type, and description
- Multiple filter options (type, price, bedrooms)
- Sort by featured, price, or year built

### Favorites System
- Uses localStorage for persistence
- Works across browser sessions
- Real-time updates when adding/removing favorites

### Property Details
- Image gallery with lightbox
- Full property information
- Contact agent functionality
- Share property feature

### PWA Capabilities
- Installable on desktop and mobile
- Offline caching of viewed properties
- Cached external images (Unsplash)
- App-like experience with no browser chrome

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 📄 License

This is a demo project for educational purposes.

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📞 Support

For questions or issues, please open an issue on the repository.

---

Built with ❤️ using React and Vite
