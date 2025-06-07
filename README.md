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
git clone https://github.com/yourusername/travelease.git
cd travelease
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Backend Setup**
```bash
cd backend
python -m venv myenv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. **Environment Setup**
Create `.env` files in both frontend and backend directories with necessary API keys and configurations.

## 📁 Project Structure

```
TravelEase/
├── frontend/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                  # Python backend
│   ├── app/
│   └── requirements.txt
│
└── docs/                     # Documentation
```

## 🔧 Development

- Frontend runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
