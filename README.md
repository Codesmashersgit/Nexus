<div align="center">
  <img src="https://nexus1802.netlify.app/assets/Group-BxPgapkn.png" alt="Nexus Logo" width="200"/>
  <h1>🎥 Nexus - Ultra Modern Video Conferencing & Chat Hub</h1>
</div>


**Nexus** is a high-performance, real-time communication platform built for the modern web. It combines seamless video meetings with interactive chat features, all packaged in a stunning, user-friendly interface.

---

## 🎨 Visual Tour

<div align="center">
  <h3>✨ Landing Page</h3>
  <img src="./Frontend/src/assets/Screenshot 2026-02-21 220836.png" alt="Landing Page Placeholder" width="600"/>
  <p><i>Modern, sleek entrance with quick action buttons.</i></p>

  <br/>

  <h3>💻 Meeting Dashboard</h3>
  <img src="./Frontend/src/assets/Screenshot 2026-02-21 225422.png" alt="Dashboard Placeholder" width="600"/>
  <p><i>Intuitive meeting controls and real-time user list.</i></p>

  <br/>

  <h3>📅 Pricing & Subscription</h3>
  <img src="./Frontend/src/assets/Screenshot 2026-02-21 225506.png" alt="Pricing Placeholder" width="600"/>
  <p><i>Flexible plans with integrated Razorpay payment flow.</i></p>
</div>

---

## ✨ Key Features

- 🔒 **Secure Authentication**: Robust login/signup system with JWT & Google OAuth integration.
- 📹 **HD Video Meetings**: Peer-to-peer video conferencing powered by WebRTC for low latency.
- 💬 **Real-time Chat**: Interaction-rich chat system with typing indicators and instant messaging.
- 💳 **Premium Plans**: Integrated Razorpay payment gateway for subscription management.
- 📊 **Dynamic Analytics**: Visualized meeting history and usage stats with interactive charts.
- 📧 **OTP Verification**: Email-based OTP system for secure password resets and verification.
- 📱 **Responsive Design**: Flawless experience across Desktop, Tablet, and Mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **State Management**: React Context API
- **Real-time**: Socket.io-client & Simple-peer (WebRTC)
- **Charts**: Chart.js
- **Animations**: Lottie-React & Framer Motion

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Auth**: Passport.js & JWT
- **Payments**: Razorpay Node SDK
- **Mailing**: Nodemailer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Razorpay Account (for payments)

### 1. Clone the repository
```bash
git clone https://github.com/Codesmashersgit/Nexus.git
cd Nexus
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
VITE_CLIENT_URL=http://localhost:5173
```
Run the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```
Create a `.env` file in the `Frontend` folder:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY=your_razorpay_id
```
Run the development server:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
Nexus/
├── Frontend/           # React + Vite Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Main application screens
│   │   ├── context/    # Global state (Auth/Context)
│   │   └── rtc/        # WebRTC & Socket logic
├── Backend/            # Node.js + Express API
│   ├── Controller/     # Request handlers
│   ├── Routes/         # API endpoints
│   ├── Model/          # Database schemas
│   └── server.js       # Entry point
└── README.md           # You are here!
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by **Codesmashers**
