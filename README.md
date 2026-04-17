# 🚀 GigShield AI
GigShield AI is an **AI-powered parametric insurance platform** designed for gig workers.  
It automatically detects real-world disruptions (like rain, pollution, traffic), verifies them using AI, and provides **instant, zero-touch compensation**.
---
## 🎥 Demo Video
👉 https://youtu.be/bOk4UYP9gq8
---
## 📊 Pitch Deck
👉 https://drive.google.com/file/d/13-r52GXL8-urKho26dy9Nc57D4nC5DNm/view?usp=sharing
---
## 🌍 Problem Statement
Gig workers face **income instability** due to unpredictable disruptions such as:
- Weather (rain, heatwaves)
- Pollution (high AQI)
- Traffic restrictions
- Local curfews
They lose **20–30% of their income**, with no protection system in place.
---
## 💡 Solution
GigShield AI introduces:
- 📡 Real-time disruption detection  
- 🤖 AI-powered risk scoring & fraud detection  
- ⚡ Automatic claim generation (zero-touch)  
- 💰 Instant payout system (simulated / integrated)  
👉 No claims. No paperwork. Just protection.
---
## ✨ Key Features
### 👷 Worker Portal
- View real-time risk & premium
- Subscribe to policies
- Track claims & payouts
- Receive alerts & notifications
### 🛡️ Admin Dashboard
- Monitor system performance
- Analyze claims & fraud detection
- Manage users & policies
- Review and approve claims
### 🤖 AI Engine
- Risk Prediction Model
- Fraud Detection Model
- Income Loss Estimation
### 📡 Event Detection System
- Weather API integration
- AQI API integration
- Traffic data monitoring
---
## 🏗️ System Architecture
![System Design](./frontend/public/devtrails_system_design.jpeg)
**Flow:**
Frontend → Backend APIs → AI Service → Database → External APIs  
---
## 🗄️ Database Design
![Database Model](./frontend/public/model_devtraails.jpeg)
**Core Entities:**
- Users  
- Policies  
- Claims  
- Payments  
- Events  
- Notifications  
---
## ⚙️ Tech Stack
### Frontend
- Next.js (App Router)
- React (TypeScript)
- Tailwind CSS
### Backend
- Next.js API Routes (TypeScript)
- Prisma ORM
### AI/ML
- Python (FastAPI)
- Scikit-learn
- Pandas, NumPy
### Database
- PostgreSQL
- Redis (optional caching)
### APIs
- OpenWeatherMap API
- AQI API
- Google Maps API
### Cloud & DevOps (Planned / Partial)
- AWS
- Docker
---
## 🔁 Application Workflow
1. Worker subscribes to a policy  
2. System monitors real-time external data  
3. Disruption detected (e.g., heavy rain)  
4. AI verifies event + calculates loss  
5. Claim generated automatically  
6. Fraud check performed  
7. Payment processed  
---
## 🧠 AI Integration
- Risk Score → Dynamic premium calculation  
- Fraud Detection → Identify abnormal claims  
- Loss Prediction → Estimate payout amount  
---
## 💻 Local Setup Instructions
### 🔹 Prerequisites
- Node.js
- Python 3.x
- PostgreSQL
---
### 🔹 Clone Repository
```bash
git clone https://github.com/mdnm18/GigShield-AI.git
cd GigShield-AI

⸻

🔹 Frontend Setup

cd frontend
npm install

Create .env:

DATABASE_URL="postgresql://user:password@localhost:5432/gigshield"

Run:

npx prisma generate
npx prisma db push
npm run dev

⸻

🔹 AI Backend Setup

cd backend
pip install -r requirements.txt
python main.py

⸻

📦 Project Structure

GigShield-AI/
│
├── frontend/        # Next.js App (UI + API)
├── backend/         # Python AI Service
├── prisma/          # Database schema
├── public/          # Assets & diagrams

⸻

🚧 Future Enhancements

* 💳 Real payment integration (Razorpay / UPI)
* 📱 Mobile app version
* 🌍 Multi-city deployment
* 📊 Advanced analytics dashboard
* ☁️ Full cloud deployment (AWS)

⸻

🏆 Innovation Highlights

* Zero-touch claims
* Real-time parametric triggers
* AI-driven pricing
* Fraud detection using location intelligence

⸻

👨‍💻 Team

Team Quants
SRM Institute of Science and Technology

⸻

📌 Submission Details

* ✅ Source Code: GitHub Repository
* ✅ Pitch Deck: Included above
* ✅ Demo Video: Included above
* ✅ Fully working prototype with AI integration

⸻

📄 License

This project is for academic and hackathon purposes.

---