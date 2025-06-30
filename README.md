# 🧳 TravelEase

**TravelEase** is an AI-powered travel assistant web app that automates trip planning and booking based on your preferences. It eliminates manual searching by learning what you like and automatically finding and booking the best flights and accommodations—at the best prices.

---

## ✈️ The Problem

Finding cheap flights and hotels is tedious. You have to check multiple sites (like Skyscanner or Google Flights), compare prices in different currencies, and sometimes even use a VPN to get the best deals. This process is time-consuming and confusing.

---

## 💡 The Solution

**TravelEase** solves this by:
- Integrating a VPN (NordVPN) to search from different regions for the best prices.
- Using AI to learn your preferences and automate the search and booking process.
- Comparing prices across multiple APIs and currencies, so you always get the best deal.

---

## 🌟 Features

- **Smart Trip Planning:** AI-powered itinerary generation based on your preferences.
- **Automated Booking:** Automatically books flights and hotels through integrated APIs.
- **Personalized Recommendations:** Learns and adapts to your travel style.
- **Dynamic Pricing:** Uses a VPN proxy layer to find the best prices worldwide.
- **Real-time Updates:** Live tracking of prices and availability.

---

## 🛠️ Tech Stack

**Frontend:**
- React
- TypeScript
- Tailwind CSS
- Vite

**Backend:**
- Python FastAPI
- PostgreSQL
- Redis (for caching)

**Containerization:**
- Docker
- Docker Compose

**APIs:**
- Skyscanner (Flights)
- Hotels.com (Accommodation)
- Mapbox (Maps & Location)
- Exchange Rates (Currency)
- NordVPN

**Infrastructure:**
- SmartProxy (VPN)
- Redis (Caching)
- Prometheus & Grafana (Monitoring)
- ELK Stack (Logging)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.12 or higher
- PostgreSQL
- Redis
- Docker & Docker Compose

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dandastino/travelease.git
   cd travelease
   ```

2. **Start the app with Docker Compose:**
   ```bash
   docker compose up --build
   ```

---

## 📁 Project Structure

```
TravelEase/
├── frontend/                 
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                
│   ├── app/
│   │   ├── main.py
│   │   └── db_connection.py
│   ├── Dockerfile
│   ├── db.sql
│   └── requirements.txt
│
├── database/
│   └── (init scripts, if any)
│
├── docker-compose.yml
└── .env
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Database
DB_USER=travelease
DB_PASSWORD=password
DB_NAME=travelease

# NordVPN
TOKEN=your_nordvpn_token
NORDVPN_CONNECT=your_nordvpn_server
```

Adjust values as needed for your setup.

---

## 🔧 Development

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000) (check your Docker/compose config for the exact port)

---

## 📝 License

Copyright (c) 2024 TravelEase. All rights reserved.

This software and its source code may not be copied, modified, distributed, or used in any form without the express written permission of the copyright holder.

For inquiries, please contact: moustafa.sheri204@gmail.com
