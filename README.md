# 🧳 TravelEase

TravelEase is an AI-powered travel assistant webapp that automates trip planning and booking based on user preferences. It eliminates manual searching by learning user preferences and automatically finding and booking flights and accommodations.

## 🌟 Features

- **Smart Trip Planning**: AI-powered itinerary generation based on user preferences
- **Automated Booking**: Automatic flight and hotel booking through integrated APIs
- **Personalized Recommendations**: Learning-based system that adapts to user preferences
- **Dynamic Pricing**: VPN proxy layer for finding the best prices across regions
- **Real-time Updates**: Live tracking of prices and availability

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

### Backend
- Python FastAPI
- PostgreSQL
- Redis (for caching)

### Container
- docker
- docker-compose

### APIs
- Skyscanner API (Flights)
- Hotels.com (Accommodation)
- Mapbox API (Maps & Location)
- Exchange Rates API (Currency)

### Infrastructure
- SmartProxy (VPN)
- Redis (Caching)
- Prometheus & Grafana (Monitoring)
- ELK Stack (Logging)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.12 or higher
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dandastino/travelease.git
cd travelease
```
2. **Run Backend, FrontEnd with Docker Compose**
```bash
docker compose up --build
```

## 📁 Project Structure

```
TravelEase/
├── frontend/                 
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                
    ├── app/
        ├── main.py
        └── db_connection.py
    ├── Dockerfile
    ├── db.sql
    └── requirements.txt


```

## 🔧 Development

- Frontend runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:8001`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
