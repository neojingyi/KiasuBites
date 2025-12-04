# KiasuBites 🍽️

A modern food rescue platform that connects consumers with local vendors to save surplus food from going to waste. Built with React, TypeScript, and Vite.

## 🌟 Features

### For Consumers
- **Browse Surprise Bags**: Discover discounted surplus food from local vendors
- **Save Money**: Get quality food for 50-70% off the original price
- **Favorites**: Save your favorite vendors for quick access
- **Order Management**: Track your orders and pickup times
- **Profile Customization**: Set dietary preferences and search radius
- **Interactive 3D Globe**: Explore vendors on an interactive 3D globe map with auto-rotation and theme switching

### For Vendors
- **Dashboard Analytics**: Track sales, revenue, and meals saved
- **Bag Management**: Create and manage surprise bag listings
- **Availability Settings**: Set weekly pickup schedules
- **Order Tracking**: Monitor reservations and pickup status
- **Business Verification**: Secure verification with company details
- **Reviews & Ratings**: View customer feedback and ratings

## 🎨 Design

- **Theme**: Classy red and yellow color scheme
- **Background**: Cream beige (`#fefbf1`)
- **Animation**: Bouncing bag logo animation on landing page
- **UI**: Modern, clean interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.9.6
- **State Management**: React Query (TanStack Query) 5.90.11
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **3D Globe**: Mapbox GL JS 3.15.0

## 📋 Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd KiasuBites
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add:
   ```env
   # Mapbox Access Token (required for 3D Globe feature)
   # Get your free token at https://account.mapbox.com
   # Free tier: 50,000 map loads per month
   VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
   
   # Gemini API Key (if using AI features)
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

## 📁 Project Structure

```
KiasuBites/
├── assets/              # Static assets (images, etc.)
├── components/          # Reusable React components
│   ├── Layout.tsx      # Main layout with navigation
│   └── UI.tsx          # UI components (Button, Input, Card, etc.)
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── consumer/       # Consumer-facing pages
│   └── vendor/         # Vendor-facing pages
├── services/           # API and service layer
│   └── api.ts          # Mock API service
├── App.tsx             # Main app component with routing
├── index.tsx           # Entry point
├── index.html          # HTML template
├── index.css           # Global styles and animations
├── types.ts            # TypeScript type definitions
└── vite.config.ts      # Vite configuration
```

## 🎯 Key Features

### Authentication
- User registration and login
- Role-based access (Consumer/Vendor)
- Protected routes

### Surprise Bags
- Browse available bags by location
- Filter by category, dietary preferences, and price
- View detailed bag information
- Reserve bags with confirmation codes

### Vendor Dashboard
- Sales analytics and charts
- Revenue tracking
- Meals saved statistics
- Pickup rate monitoring
- Payout history

### Order Management
- Real-time order status
- Pickup time windows
- Order history
- Rating and review system

## 🎨 Customization

### Theme Colors

The app uses a red and yellow color scheme defined in `index.html`:

- **Primary (Red)**: `#dc2626`, `#b91c1c`, `#991b1b`
- **Accent (Yellow)**: `#eab308`, `#ca8a04`, `#a16207`
- **Background**: `#fefbf1` (cream beige)

### Animations

The landing page features a bouncing bag animation defined in `index.css` that simulates a realistic ball bounce with decreasing height.

## 🔒 Security

- Protected routes based on user roles
- Business verification for vendors
- Secure authentication context

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📞 Support

For support, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for reducing food waste**

