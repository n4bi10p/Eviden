# 🎫 Eviden - Blockchain-Powered Event Attendance Verification Platform

<div align="center">

![Eviden Logo](https://img.shields.io/badge/Eviden-Blockchain%20Events-6366f1?style=for-the-badge&logo=blockchain.info&logoColor=white)

**Revolutionizing Event Attendance with Blockchain Technology & Peer Validation**

[![Version](https://img.shields.io/badge/Version-4.0.0-blue?style=flat-square)](./Move.toml)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Aptos](https://img.shields.io/badge/Blockchain-Aptos-black?style=flat-square&logo=aptos)](https://aptoslabs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 🌟 **Project Importance & Vision**

Eviden addresses critical challenges in the modern event industry:

### **Why Eviden Matters:**
- **🎭 Trust Crisis**: Traditional event attendance systems lack transparency and are prone to fraud
- **📜 Certificate Verification**: Difficulty in verifying authentic event participation certificates
- **🤝 Peer Validation**: No reliable way to confirm genuine attendance through community consensus
- **🔗 Blockchain Integration**: Need for immutable, decentralized event attendance records
- **🌐 Web3 Evolution**: Bridging traditional event management with blockchain technology

### **Our Solution:**
Eviden creates a **trustless, peer-validated, blockchain-secured** event attendance system that provides:
- **Immutable attendance records** on the Aptos blockchain
- **Community-driven validation** through peer verification
- **NFT certificates** as proof of authentic participation
- **Geolocation-based check-ins** to prevent fraud
- **Real-time analytics** for event organizers

---

## 🏗️ **Tech Stack Overview**

### **🎨 Frontend (React + TypeScript)**
```typescript
React 18.2.0 + TypeScript + Vite
├── 🎨 UI/UX: Tailwind CSS + Framer Motion
├── 🌙 Theme: Dark/Light mode with Glassmorphism design
├── 📱 Responsive: Mobile-first responsive design
├── 🔗 Routing: React Router DOM
├── 📊 Charts: Recharts for analytics
├── 📷 QR Codes: QR Scanner + QR Generator
├── 🗺️ Maps: Leaflet for location services
└── 🔐 Auth: JWT + Wallet Integration
```

### **⚡ Backend (Node.js + Express)**
```typescript
Node.js + Express + TypeScript
├── 🛡️ Security: JWT, Rate Limiting, CORS
├── ✅ Validation: Joi schema validation
├── 📧 Email: Nodemailer with templates
├── 🔄 Real-time: Socket.IO for live updates
├── 📁 File Upload: Multer for media handling
├── 📱 Push: Web Push notifications
├── ⚡ Cache: Redis for session management
└── 🐘 Database: PostgreSQL with Prisma ORM
```

### **⛓️ Blockchain (Aptos Move)**
```move
Aptos Blockchain + Move Language
├── 📋 Smart Contracts: Event management
├── 🏆 NFT Certificates: Token Objects
├── 👥 Peer Validation: Community consensus
├── 📍 Geofencing: Location-based verification
├── ⏰ Time-locks: Event scheduling
└── 🔒 Security: Immutable attendance records
```

---

## 🚀 **Core Features (MVP)**

### **1. 🎪 Event Management**
- **Create Events**: Organizers can create events with geolocation, time constraints
- **Event Discovery**: Browse upcoming events with filtering and search
- **Event Details**: Comprehensive event information and requirements

### **2. 📍 Smart Check-in System**
- **QR Code Check-in**: Scan QR codes to check into events
- **Geolocation Verification**: GPS-based attendance verification
- **Time-based Validation**: Automatic check-in window management

### **3. 🤝 Peer Validation Network**
- **Community Validation**: Attendees validate each other's presence
- **Consensus Mechanism**: Multiple validations required for certificate eligibility
- **Anti-fraud Protection**: Prevents fake check-ins through social proof

### **4. 🏆 NFT Certificate System**
- **Automated Minting**: Certificates minted after successful validation
- **Tiered Rewards**: Bronze, Silver, Gold certificates based on validation count
- **Blockchain Storage**: Immutable certificates on Aptos blockchain

### **5. 🔐 Wallet Authentication**
- **Web3 Login**: Signature-based authentication
- **Multi-wallet Support**: Compatible with major Aptos wallets
- **Secure Sessions**: JWT-based session management

---

## 🎯 **Main Features (Current Implementation)**

### **🎨 Frontend Features**
- ✅ **Glassmorphism UI**: Modern, beautiful glass-effect design
- ✅ **Responsive Design**: Mobile-first, tablet and desktop optimized
- ✅ **Dark/Light Theme**: Toggle between themes with smooth transitions
- ✅ **Dashboard Analytics**: Real-time statistics and event insights
- ✅ **Event Management**: Create, view, and manage events
- ✅ **Certificate Gallery**: View earned NFT certificates
- ✅ **Profile Management**: User profile with stats and history
- ✅ **Advanced Search**: Filter and search events by multiple criteria

### **⚡ Backend Features**
- ✅ **RESTful API**: Complete API with 25+ endpoints
- ✅ **Authentication System**: JWT + wallet signature authentication
- ✅ **Event CRUD Operations**: Full event lifecycle management
- ✅ **File Upload System**: Image and document handling
- ✅ **Email Notifications**: Automated email system
- ✅ **Push Notifications**: Real-time browser notifications
- ✅ **Rate Limiting**: API protection and abuse prevention
- ✅ **Validation Middleware**: Request validation with Joi schemas

### **⛓️ Blockchain Features**
- ✅ **Event Smart Contracts**: On-chain event management
- ✅ **NFT Certificate Minting**: Automated certificate generation
- ✅ **Peer Validation Logic**: Community-driven validation system
- ✅ **Geolocation Verification**: Smart contract-based location checking
- ✅ **Time-locked Operations**: Event scheduling and check-in windows

---

## 🔮 **Post-MVP Features (Planned)**

### **📊 Advanced Analytics**
- 🔄 **Real-time Event Analytics**: Live attendance tracking
- 📈 **Organizer Dashboard**: Comprehensive event insights
- 🎯 **Attendee Behavior Analysis**: Participation patterns
- 📱 **Mobile Analytics**: App usage and engagement metrics

### **🌐 Social Features**
- 👥 **Social Profiles**: Enhanced user profiles with social features
- 💬 **Event Chat**: Real-time chat during events
- 📱 **Social Sharing**: Share certificates and achievements
- 🏅 **Leaderboards**: Top attendees and validators

### **💰 Monetization Features**
- 💳 **Event Ticketing**: Paid event support with crypto payments
- 🎁 **NFT Marketplace**: Trade and sell event certificates
- 💎 **Premium Features**: Advanced organizer tools
- 🏆 **Rewards System**: Token rewards for active participants

---

## 🚀 **Future Features (Roadmap)**

### **🤖 AI Integration**
- 🧠 **AI Event Recommendations**: Personalized event suggestions
- 📸 **Computer Vision Validation**: Photo-based attendance verification
- 🔍 **Fraud Detection**: AI-powered fake attendance detection
- 📊 **Predictive Analytics**: Event success prediction

### **🌍 Multi-chain Support**
- 🔗 **Cross-chain Certificates**: Certificates across multiple blockchains
- 🌉 **Bridge Integration**: Move certificates between chains
- 💱 **Multi-token Support**: Accept various cryptocurrencies

### **🏢 Enterprise Features**
- 🏭 **Corporate Events**: Enterprise event management tools
- 📋 **Compliance Reporting**: Automated compliance and reporting
- 🔐 **Enterprise SSO**: Single sign-on integration
- 📊 **White-label Solutions**: Customizable branded platforms

### **📱 Mobile Applications**
- 📱 **Native iOS App**: Full-featured iOS application
- 🤖 **Native Android App**: Full-featured Android application
- 🔔 **Push Notifications**: Native mobile push notifications
- 📍 **Background Location**: Background location tracking

---

## 📦 **Current Integration Status**

### **✅ Completed Integrations**

#### **Frontend Integrations:**
- ✅ **Theme System**: Complete dark/light theme with context
- ✅ **Authentication Flow**: Wallet connection and JWT management
- ✅ **Dashboard Integration**: Real-time data from backend APIs
- ✅ **Event Management**: Full CRUD operations with backend
- ✅ **Certificate Display**: NFT certificate gallery with blockchain data
- ✅ **Analytics Dashboard**: Real-time analytics and charts
- ✅ **Responsive Navigation**: Mobile-first sidebar navigation
- ✅ **Error Handling**: Comprehensive error states and messages
- ✅ **Loading States**: Skeleton screens and loading indicators

#### **Backend Integrations:**
- ✅ **Database Layer**: PostgreSQL with Prisma ORM setup
- ✅ **Authentication Middleware**: JWT + wallet signature verification
- ✅ **File Upload System**: Multer integration for images and documents
- ✅ **Email Service**: Nodemailer with HTML templates
- ✅ **Push Notifications**: Web Push service implementation
- ✅ **Rate Limiting**: Express rate limiter for API protection
- ✅ **CORS Configuration**: Cross-origin resource sharing setup
- ✅ **Validation Layer**: Joi schemas for all API endpoints
- ✅ **Error Handling**: Centralized error handling middleware

#### **Blockchain Integrations:**
- ✅ **Smart Contract Deployment**: Events v3 contract on Aptos
- ✅ **NFT Certificate System**: Token Objects implementation
- ✅ **Peer Validation Logic**: Community consensus mechanism
- ✅ **Geolocation Verification**: On-chain location checking
- ✅ **Event Lifecycle**: Complete event management on blockchain

### **🔄 In Progress Integrations**
- 🔄 **Real-time Updates**: Socket.IO for live event updates
- 🔄 **Advanced Search**: Elasticsearch integration for better search
- 🔄 **Cache Layer**: Redis integration for improved performance
- 🔄 **Image Processing**: Sharp integration for image optimization

### **⏳ Pending Integrations**
- ⏳ **Database Migration**: Full PostgreSQL integration (currently in-memory)
- ⏳ **Payment Gateway**: Stripe/crypto payment processing
- ⏳ **Third-party APIs**: Maps, weather, and external event data
- ⏳ **Monitoring**: Application performance monitoring (APM)

---

## 🏗️ **Project Architecture**

```
Eviden Platform
├── 🎨 Frontend (React + TypeScript)
│   ├── Components: Reusable UI components
│   ├── Pages: Main application pages
│   ├── Services: API communication layer
│   ├── Contexts: State management
│   ├── Hooks: Custom React hooks
│   └── Utils: Helper functions
│
├── ⚡ Backend (Node.js + Express)
│   ├── Routes: API endpoint definitions
│   ├── Controllers: Business logic
│   ├── Middleware: Authentication, validation
│   ├── Services: External service integrations
│   ├── Models: Data models and schemas
│   └── Utils: Helper functions
│
└── ⛓️ Blockchain (Aptos Move)
    ├── Contracts: Smart contract modules
    ├── Scripts: Deployment scripts
    ├── Tests: Contract test suites
    └── Build: Compiled bytecode
```

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Aptos CLI
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/n4bi10p/eviden.git
cd eviden
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Root dependencies
cd ..
npm install
```

3. **Environment Setup**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

4. **Start Development Servers**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev

# Blockchain deployment (Terminal 3)
aptos move compile
aptos move test
```

5. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs

---

## 📁 **Project Structure**

```
eviden/
├── 📁 frontend/                 # React TypeScript frontend
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 pages/           # Application pages
│   │   ├── 📁 contexts/        # React contexts
│   │   ├── 📁 services/        # API services
│   │   ├── 📁 hooks/           # Custom hooks
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📁 assets/          # Static assets
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   └── 📄 tailwind.config.js
│
├── 📁 backend/                  # Node.js Express backend
│   ├── 📁 src/
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 controllers/     # Business logic
│   │   ├── 📁 middleware/      # Custom middleware
│   │   ├── 📁 services/        # External services
│   │   ├── 📁 models/          # Data models
│   │   ├── 📁 config/          # Configuration
│   │   └── 📁 utils/           # Utility functions
│   ├── 📁 uploads/             # File uploads
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📁 sources/                  # Move smart contracts
│   ├── 📄 events_v3.move      # Main event contract
│   └── 📄 events.move         # Legacy contract
│
├── 📁 tests/                   # Smart contract tests
├── 📁 scripts/                 # Deployment scripts
├── 📁 build/                   # Compiled contracts
├── 📄 Move.toml               # Move package configuration
├── 📄 package.json            # Root package configuration
└── 📄 README.md               # This file
```

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### **Code Standards**
- TypeScript for all new code
- ESLint + Prettier for code formatting
- Jest for testing
- Conventional commits for commit messages

---

## 📚 **Documentation**

- 📖 [API Documentation](./backend/API_DOCUMENTATION.md)
- 🔐 [Security Features](./backend/SECURITY_FEATURES.md)
- 📱 [QR Push API](./backend/QR_PUSH_API_DOCS.md)
- 🏗️ [Installation Guide](./frontend/INSTALLATION_STATUS.md)

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Aptos Labs** for the amazing blockchain infrastructure
- **React Team** for the powerful frontend framework
- **Open Source Community** for the incredible tools and libraries

---

## 📞 **Contact & Support**

- 🌐 **Website**: [Coming Soon]
- 📧 **Email**: [Your Email]
- 🐦 **Twitter**: [Your Twitter]
- 💬 **Discord**: [Your Discord Server]

---

<div align="center">

**Built with ❤️ by the Eviden Team**

*Revolutionizing Event Attendance with Blockchain Technology*

[![Aptos](https://img.shields.io/badge/Powered%20by-Aptos-black?style=for-the-badge&logo=aptos)](https://aptoslabs.com/)
[![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Frontend-React-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)

</div>
