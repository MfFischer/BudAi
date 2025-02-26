budai/
├── backend/
│   ├── controllers/
│   │   ├── chatController.js
│   │   ├── emotionController.js
│   │   └── activityController.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── chatModel.js
│   │   └── activityModel.js
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   ├── emotionRoutes.js
│   │   └── activityRoutes.js
│   ├── services/
│   │   ├── emotionAnalysis.js
│   │   ├── aiResponse.js
│   │   └── activitySuggestion.js
│   ├── utils/
│   │   ├── emotionDetection.js
│   │   └── apiHelpers.js
│   ├── config/
│   │   └── db.js
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   └── budai-avatar.png
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js
│   │   │   ├── Chat.js
│   │   │   ├── ChatMessage.js
│   │   │   ├── ChatInput.js
│   │   │   ├── Activities.js
│   │   │   ├── Profile.js
│   │   │   ├── Navbar.js
│   │   │   ├── CookieConsent.js
│   │   │   ├── CookieSettings.js
│   │   │   ├── PrivacyPolicy.js
│   │   │   └── PrivacyCenter.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   ├── ChatContext.js
│   │   │   └── PrivacyContext.js
│   │   ├── hooks/
│   │   │   └── useChat.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── gemini.js
│   │   │   └── chatService.js
│   │   ├── utils/
│   │   │   ├── formatTimestamp.js
│   │   │   └── handleApiError.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── .gitignore
├── package.json
└── README.md