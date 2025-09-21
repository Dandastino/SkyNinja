# 🥷 SkyNinja

**SkyNinja** is a cutting-edge flight search and booking platform that revolutionizes how travelers find and book flights.
Our advanced AI-powered system analyzes flight prices across multiple regions using VPN technology, predicts optimal booking times, and provides seamless booking experiences with real-time price tracking and notifications.

---

## 🎯 The Vision

SkyNinja eliminates the complexity of flight booking by providing:
- **Intelligent Price Analysis:** AI-driven predictions for the best time to book
- **Global Price Comparison:** VPN-powered searches across different regions
- **One-Click Booking:** Streamlined booking process with multiple airline integrations
- **Smart Notifications:** Real-time alerts for price drops and booking opportunities

---

## 🚀 Key Features

- **AI-Powered Price Prediction:** Machine learning algorithms predict optimal booking times
- **Multi-Region Search:** VPN integration to find the best prices worldwide
- **Real-Time Price Tracking:** Live monitoring of flight prices with instant notifications
- **Seamless Booking:** Direct integration with major airlines and booking platforms
- **User Dashboard:** Comprehensive flight management and booking history
- **Mobile-First Design:** Optimized for mobile and desktop experiences

---

## 🛠️ Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite for fast development
- Modern CSS with responsive design
- Real-time WebSocket connections

**Backend:**
- Python with FastAPI
- PostgreSQL database
- Redis for caching and session management
- Celery for background tasks

**Infrastructure:**
- Docker & Docker Compose
- NordVPN integration
- Elasticsearch for search and analytics
- Kibana for monitoring and logging

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python 3.12 or higher
- Docker & Docker Compose
- NordVPN account (for regional price comparison)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/skyninja.git
   cd skyninja
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application:**
   
   **Windows:**
   ```cmd
   start.bat
   ```
   
   **Linux/Mac:**
   ```bash
   ./start.sh
   ```
   
   **Manual start:**
   ```bash
   docker compose up --build
   ```

4. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Kibana Dashboard: [http://localhost:5601](http://localhost:5601)

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
│   └── Dockerfile
│
├── docker-compose.yml      # Multi-service orchestration
└── .env                    # Environment configuration
```

---

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

---

## 🛠️ Troubleshooting

### Common Issues

**Docker not starting:**
- Ensure Docker Desktop is running
- Check if ports 5173, 8000, 5434, 6379, 9200, 5601 are available

**Database connection issues:**
- Wait for PostgreSQL to fully initialize (can take 30-60 seconds)
- Check database logs: `docker compose logs db`

**Frontend not loading:**
- Ensure Node.js dependencies are installed: `cd frontend && npm install`
- Check frontend logs: `docker compose logs frontend`

**API not responding:**
- Check backend logs: `docker compose logs backend`
- Verify environment variables in `.env` file

**VPN integration issues:**
- Ensure NordVPN credentials are correct in `.env`
- Check VPN container logs: `docker compose logs nordvpn`

### Reset Everything
```bash
docker compose down -v
docker system prune -f
docker compose up --build
```

---

## 🔧 Development Setup

### Local Development

1. **Frontend Development:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Development:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

### Docker Development

```bash
# Start all services
docker compose up --build

# Start specific service
docker compose up frontend backend

# View logs
docker compose logs -f backend
```

---

## 🔒 Security & Privacy

SkyNinja prioritizes user security and data privacy:

- **End-to-End Encryption:** All sensitive data is encrypted in transit and at rest
- **Secure API Management:** API keys and credentials are securely managed using environment variables
- **User Authentication:** JWT-based authentication with secure session management
- **Data Privacy Compliance:** GDPR and CCPA compliant data handling practices
- **Regular Security Audits:** Automated security scanning and dependency updates
- **VPN Integration:** Secure regional price comparison without compromising user privacy

---

## 🚀 Roadmap

### Phase 1 (Current)
- [x] Core flight search functionality
- [x] VPN integration for regional pricing
- [x] Modern user interface with React 19
- [x] Docker containerization
- [x] AI-powered price prediction algorithms
- [x] Advanced user dashboard
- [x] Real-time notifications system
- [x] Secure authentication system

### Phase 2 (Upcoming)
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Enhanced AI predictions

### Phase 3 (Future)
- [ ] Machine learning price optimization
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API marketplace integration

---

## 🤝 Contributing

We welcome contributions to SkyNinja! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- **Documentation:** [docs.skyninja.com](https://docs.skyninja.com)
- **Issues:** [GitHub Issues](https://github.com/yourusername/skyninja/issues)
- **Email:** support@skyninja.com
- **Discord:** [Join our community](https://discord.gg/skyninja)

---

## 📝 License

Copyright (c) 2024 SkyNinja. All rights reserved.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Skyscanner API for flight data
- NordVPN for regional access capabilities
- The open-source community for amazing tools and libraries
