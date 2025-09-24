# 🥷 SkyNinja - Complete Beginner's Guide

**SkyNinja** is an AI-powered flight search and booking platform that helps you find the best flight deals using advanced technology. This guide will walk you through everything you need to know to get started!

## 🎯 What is SkyNinja?

SkyNinja is a modern web application that:
- **Searches for flights** across multiple airlines and regions
- **Predicts the best time to book** using AI technology
- **Compares prices** from different countries using VPN technology
- **Tracks price changes** and notifies you of deals
- **Provides a beautiful, easy-to-use interface** for booking flights

Think of it as a smarter, more powerful version of Expedia or Kayak!

---

## 🎯 **What You Can Do with SkyNinja**

### **For Travelers:**
- Search for flights across multiple airlines
- Compare prices from different regions
- Get AI-powered booking recommendations
- Track price changes for your desired routes
- Book flights with a simple, secure process

---

## 🚀 **Advanced Features (Coming Soon)**

- **Price Alerts:** Email notifications when prices drop
- **Multi-language Support:** Use SkyNinja in your language
---

## 🛠️ **Technical Details**

### **Architecture:**
- **Frontend:** React 19 with TypeScript, Vite, Tailwind CSS
- **Backend:** FastAPI (Python), PostgreSQL, Redis
- **Infrastructure:** Docker, Docker Compose
- **AI/ML:** Price prediction algorithms, regional price comparison

### **Key Technologies:**
- **React 19** - Modern frontend framework
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Robust relational database
- **Docker** - Containerization platform
- **Tailwind CSS** - Utility-first CSS framework

---

## 📁 Project Architecture

```
SkyNinja/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API service layer
│   └── package.json
│
├── backend/                 # FastAPI Python application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── requirements.txt
│   
│
└── .env                    # Environment configuration

```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_USER=skyninja
DB_PASSWORD=your_secure_password
DB_NAME=skyninja

# NordVPN Configuration
NORDVPN_TOKEN=your_nordvpn_token
NORDVPN_CONNECT=your_preferred_server

# API Keys
SKYSCANNER_API_KEY=your_skyscanner_key
EXCHANGE_RATE_API_KEY=your_exchange_rate_key

# Security
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret

```

### **Running Individual Services:**

**Frontend Only:**
```bash
cd frontend
npm install
npm run dev
```

**Backend Only:**
```bash
cd backend
pip install -r requirements.simple.txt
uvicorn app.main:app --reload
```
---

## 🔒 **Security & Privacy**

SkyNinja is designed with security in mind:

- **No Real Payment Processing:** This is a demo application
- **Local Data Only:** All data stays on your computer
- **Secure Authentication:** JWT tokens for user sessions
- **Environment Variables:** Sensitive data stored securely
- **Docker Isolation:** Services run in isolated containers

---
