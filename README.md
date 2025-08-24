# Eviden Frontend - MacOS-Inspired Web Application

A beautiful React + TypeScript + Vite application with glassmorphism aesthetics inspired by MacOS Big Sur/Sonoma, built for the Eviden decentralized event attendance verification platform.

## ✨ Design Features

- **Glassmorphism UI**: Frosted glass panels with backdrop blur effects
- **MacOS Aesthetics**: Clean, airy design inspired by Apple's design language
- **SF Pro Typography**: Apple-style minimal typography (system fonts)
- **Smooth Animations**: Elegant hover effects and transitions
- **Pastel Color Palette**: Soft gradients with white, gray, blue, and teal accents
- **Responsive Design**: Mobile-first approach with adaptive layouts

## 🚀 Pages & Features

### 🏠 Dashboard (Split View)
- **Organizer View**: Event management, quick stats, "Create Event" button
- **Attendee View**: Upcoming events, owned certificates, reputation score
- Toggle between user types with smooth transitions

### 📅 Event Management
- **Event Creation**: Centered modal with frosted glass styling
- **Event Details**: Glass cards with comprehensive event information
- **Check-in System**: QR code widget with glowing animations
- **Real-time Updates**: Live attendance counters and progress bars

### 🏆 Certificate Viewer
- **Apple Wallet Style**: Certificate display like iOS Wallet passes
- **Blockchain Verification**: Transaction hashes and verification scores
- **NFT Badges**: Beautiful gradient badges with achievement types
- **Metadata Display**: Comprehensive certificate information

### 👤 Profile & Reputation
- **Circular Progress Ring**: Animated reputation score visualization
- **Achievement Badges**: Grid layout with glassmorphism effects
- **Activity Timeline**: Recent actions and point earnings
- **Statistics Dashboard**: Personal metrics and rankings

### 📊 Analytics Dashboard (Organizer)
- **Real-time Metrics**: Live attendance counters and engagement stats
- **Interactive Charts**: Check-in activity with smooth bar animations
- **Geographic Heatmap**: Location-based attendance visualization
- **Performance Tables**: Event statistics with color-coded metrics

## 🎨 Color Palette

```css
/* Primary Colors */
--macos-blue: #007AFF
--macos-purple: #AF52DE
--macos-teal: #5AC8FA
--macos-green: #34C759

/* Glass Effects */
--glass-white: rgba(255, 255, 255, 0.9)
--glass-light: rgba(255, 255, 255, 0.7)
--glass-medium: rgba(255, 255, 255, 0.5)

/* Gradients */
background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)
```

## 🏗️ Component Architecture

```
src/
├── components/
│   ├── GlassCard.tsx       # Glassmorphism container component
│   ├── MacOSButton.tsx     # Apple-style button with variants
│   ├── MacOSSwitch.tsx     # iOS-style toggle switch
│   └── Sidebar.tsx         # Navigation with glass effect
├── pages/
│   ├── Dashboard.tsx       # Main dashboard with user type switching
│   ├── EventCreate.tsx     # Event creation form with map picker
│   ├── EventCheckin.tsx    # QR check-in with location verification
│   ├── Certificates.tsx    # NFT certificate gallery and viewer
│   ├── Profile.tsx         # User profile with reputation scoring
│   ├── Events.tsx          # Event discovery and registration
│   └── Analytics.tsx       # Organizer analytics dashboard
└── styles/
    ├── index.css          # Global styles with glass utilities
    └── tailwind.config.js # MacOS color palette and effects
```

## 🔧 Key Technologies

- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **Tailwind CSS** with custom MacOS color palette
- **Glassmorphism** CSS effects with backdrop-filter
- **React Router** for seamless navigation
- **Custom Hooks** for state management
- **CSS Animations** for smooth interactions

## 🎯 MacOS-Inspired Features

- **Frosted Glass Panels**: Authentic glassmorphism with backdrop blur
- **Depth Layering**: Multiple glass layers for visual hierarchy
- **Smooth Transitions**: 300ms ease-out animations throughout
- **Rounded Corners**: Consistent 12px-24px border radius
- **Subtle Shadows**: Soft drop shadows for depth perception
- **Progress Rings**: Circular progress with SVG animations
- **Glow Effects**: Subtle box-shadow glows on interactive elements

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:5173`

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation with multi-column layouts
- **Tablet**: Collapsible sidebar with adaptive grid systems  
- **Mobile**: Bottom navigation bar with single-column cards

## 🌟 Accessibility Features

- **High Contrast**: Ensures readability across all glass effects
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Friendly**: Semantic HTML with proper ARIA labels
- **Focus Indicators**: Clear focus states for all interactive elements

## 🔮 Future Enhancements

- **Dark Mode**: macOS-style dark theme toggle
- **Haptic Feedback**: Subtle vibrations for mobile interactions
- **Advanced Animations**: Lottie animations for micro-interactions
- **Native Integration**: PWA capabilities for app-like experience

The application successfully captures the essence of modern macOS applications while providing a comprehensive platform for decentralized event management and verification.
