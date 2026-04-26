<p align="center">
  <img src="https://img.shields.io/badge/NeoHealth-Healthcare%20Platform-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTE5IDNoLTR2LTJhMSAxIDAgMCAwLTEtMWgtNGExIDEgMCAwIDAtMSAxdjJINWEyIDIgMCAwIDAtMiAydjE0YTIgMiAwIDAgMCAyIDJoMTRhMiAyIDAgMCAwIDItMlY1YTIgMiAwIDAgMC0yLTJ6bS01IDBoLTR2LTJoNHYyem0tMyA4aDJ2MmgtMnYyaC0ydi0yaC0ydi0yaDJ2LTJoMnYyeiIvPjwvc3ZnPg==&logoColor=white" alt="NeoHealth" />
  <br/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel" />
</p>

# 🏥 NeoHealth — Modern Healthcare Platform

> **A full-stack healthcare management platform that connects patients with hospitals, doctors, and emergency services — all in one seamless experience.**

NeoHealth is a modern, feature-rich healthcare ecosystem built with the MERN stack (MongoDB, Express, React, Node.js). It features a patient-facing portal for booking appointments & managing health, and a hospital admin portal for managing doctors, schedules, and operations.

> ⚠️ **Currently in active development** — See [Roadmap](#-roadmap--upcoming-features) below for planned features.

---

## 📸 Screenshots

### 🏠 Homepage — Hero Section
The animated hero showcases featured services like Doctor Appointments, Medicine Orders, and Lab Tests with a rotating carousel.

![Homepage Hero](./screenshots/homepage_hero.png)

### 🏥 Nearby Hospitals
Real hospital listings fetched from MongoDB Atlas, showing specialties, ratings, and quick appointment booking.

![Hospital Cards](./screenshots/hospital_cards.png)

### 🔐 Admin Portal
Role-based access for Hospital Admins and Doctors to manage their operations.

![Admin Portal](./screenshots/admin_portal.png)

### 📋 Full Page View
Complete homepage with footer showing company info, support links, and contact details.

![Footer Section](./screenshots/footer.png)

### 🤖 Healix AI Chatbot
AI-powered health assistant built with Groq, offering symptom guidance, platform navigation, and health tips.

![Healix Chatbot](./screenshots/chatbot.png)

---

## ✨ Features

### 👤 Patient Portal (`User_Interface`)
- 🏠 **Homepage** — Animated hero carousel, quick services, category browsing
- 🏥 **Hospital Discovery** — Browse nearby hospitals with ratings, specialties & live status
- 👨‍⚕️ **Doctor Profiles** — View qualifications, experience, fees & available slots
- 📅 **Appointment Booking** — Book in-person or virtual consultations with real-time slot selection
- 📋 **My Bookings** — View, track & manage all appointments
- 💊 **Pharmacy** — Browse medications with refill reminders
- 👤 **User Profile** — Manage personal health information
- 🤖 **Healix AI Chatbot** — AI-powered health assistant (Groq API)
- 🆘 **Emergency SOS** — One-tap emergency call (108 ambulance)
- 🔐 **Authentication** — Secure JWT-based login/register with auto-session restore

### 🏥 Admin Portal (`admin`)
- 🏥 **Hospital Dashboard** — Manage hospital details, specialties, facilities & settings
- 👨‍⚕️ **Doctor Management** — Add doctors, manage credentials & specializations
- 📅 **Schedule Management** — Configure custom time slots (in-person + virtual)
- 📊 **Booking Overview** — View and manage incoming patient appointments
- 💊 **Prescription System** — Write prescriptions and complete appointments
- 🔐 **Role-Based Auth** — Separate login flows for Hospital Admin & Doctor

### ⚙️ Backend API (`Backend_learn`)
- 🔒 **JWT Authentication** — Access + Refresh token rotation
- 📦 **RESTful API** — Clean, versioned endpoints (`/api/v1/*`)
- 🗄️ **MongoDB Atlas** — Cloud-hosted database with Mongoose ODM
- 📁 **Cloudinary** — Image upload for hospitals & user avatars
- 🤖 **Groq AI** — Integrated health chatbot with conversation memory
- 🔄 **CORS** — Dynamic origin allowlist for multi-domain deployment

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 6, React Router v7 |
| **Styling** | CSS3 Custom Properties, Glassmorphism, CSS Animations |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas, Mongoose 9 |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **AI** | Groq API |
| **Deployment** | Vercel (Serverless Functions + Static) |
| **Storage** | Cloudinary (media uploads) |

---

## 🚀 Live Demo

| App | URL |
|-----|-----|
| 🌐 **User Portal** | [neo-health-1.vercel.app](https://neo-health-1.vercel.app) |
| 🔧 **Admin Portal** | [neo-health-2.vercel.app](https://neo-health-2.vercel.app) |

---

## 📁 Project Structure

```
Neo_Health/
├── Backend_learn/          # Express.js REST API
│   ├── api/                # Vercel serverless entry point
│   ├── src/
│   │   ├── controllers/    # Route handlers (user, hospital, doctor, booking, chat)
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/     # JWT auth middleware
│   │   ├── utils/          # ApiError, ApiResponse, AsyncHandler
│   │   └── db/             # MongoDB connection
│   ├── vercel.json         # Serverless deployment config
│   └── package.json
│
├── User_Interface/         # Patient-facing React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── utils/          # API client, helpers
│   │   └── data/           # Mock data, slot utilities
│   ├── vercel.json         # SPA fallback config
│   └── package.json
│
├── admin/                  # Hospital & Doctor admin React app
│   ├── src/
│   │   ├── pages/          # Auth, Dashboard, Doctor views
│   │   ├── utils/          # Admin API client
│   │   └── data/           # Slot utilities
│   ├── vercel.json         # SPA fallback config
│   └── package.json
│
├── screenshots/            # App screenshots for README
└── README.md
```

---

## 🏗️ Getting Started

### Prerequisites

- **Node.js** v18+ 
- **MongoDB Atlas** account (or local MongoDB)
- **Groq API Key** 

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Neo_Health.git
cd Neo_Health
```

### 2. Set Up the Backend

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
DB_NAME=NeoHealth
PORT=2873
CORS_ORIGIN=*
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/NeoHealth
ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Set Up the User Interface

```bash
cd ../User_Interface
npm install
npm run dev
```

Opens at `http://localhost:5173`

### 4. Set Up the Admin Portal

```bash
cd ../admin
npm install
npm run dev
```

Opens at `http://localhost:5174`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Register new user |
| `POST` | `/api/v1/users/login` | User login |
| `POST` | `/api/v1/users/logout` | User logout |
| `GET` | `/api/v1/users/profile` | Get user profile |

### Hospitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/hospitals` | List all hospitals |
| `GET` | `/api/v1/hospitals/:id` | Get hospital details |
| `POST` | `/api/v1/hospitals/register` | Register hospital |
| `POST` | `/api/v1/hospitals/login` | Hospital admin login |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/doctors/add` | Add doctor (hospital admin) |
| `POST` | `/api/v1/doctors/login` | Doctor login |
| `PATCH` | `/api/v1/doctors/slots` | Update doctor slots |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/bookings` | Create new booking |
| `GET` | `/api/v1/bookings/my` | Get user's bookings |
| `PATCH` | `/api/v1/bookings/:id/complete` | Complete appointment |

### AI Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat` | Send message to Healix |
| `POST` | `/api/v1/chat/clear` | Clear chat history |

---

## 🗺️ Roadmap — Upcoming Features

NeoHealth is currently in **active development**. Here's what's coming next:

### 🔜 Phase 2 — In Progress
- [ ] 💳 **Payment Gateway Integration** — Razorpay/Stripe for online appointment payments
- [ ] 📹 **Video Consultation** — WebRTC-based virtual doctor visits
- [ ] 📍 **Location-Based Search** — GPS-powered nearby hospital discovery
- [ ] 🔔 **Push Notifications** — Appointment reminders & health alerts

### 🔮 Phase 3 — Planned
- [ ] 🧬 **AI Symptom Checker** — Advanced AI-powered symptom analysis & triage
- [ ] 📊 **Health Dashboard** — Track vitals, medications & health trends
- [ ] 💊 **E-Pharmacy** — Complete online medicine ordering with delivery tracking
- [ ] 📄 **Medical Records** — Upload, store & share health documents securely
- [ ] 🏥 **Multi-Branch Management** — Hospital chain management support
- [ ] 📱 **Mobile App** — React Native version for iOS & Android

### 🚀 Phase 4 — Future
- [ ] 🤝 **Insurance Integration** — Direct insurance claim processing
- [ ] 🌍 **Multi-Language Support** — Hindi, Tamil, Telugu & more
- [ ] 🧪 **Lab Test Booking** — Book pathology tests with home sample collection
- [ ] 📈 **Analytics Dashboard** — Hospital-level analytics & reporting
- [ ] 🔗 **FHIR Integration** — Interoperability with existing Health IT systems

---

## 👨‍💻 Author

**Dhruv Asanani**

- GitHub: [@dhruvasanani2024](https://github.com/dhruvasanani2024)

---

## 📄 License

This project is under active development and is not yet licensed for public use.

---

<p align="center">
  Made with ❤️ for better healthcare access
  <br/>
  <strong>NeoHealth</strong> — Healthcare, Reimagined.
</p>
