# 💬 React Firebase Chat App

A modern, real-time chat application built with React and Firebase, featuring Google authentication, file sharing, and a sleek user interface.

![Chat App Demo](https://img.shields.io/badge/React-18.2+-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🔐 Authentication
- Email/Password authentication
- Google OAuth integration
- Protected routes
- Session persistence

### 💬 Real-time Messaging
- Instant message delivery using Firebase Firestore
- Real-time message synchronization
- Message timestamps
- Read receipts (unread count badges)

### 📎 File Sharing
- **Images & Videos**: Upload and display inline
- **Documents**: PDF, Word, Excel, PowerPoint support
- **Audio Files**: Share audio messages
- Upload progress indicators
- Preview before sending
- Retry failed uploads
- Multiple file support

### 👤 User Management
- Custom profile creation
- Profile picture upload (or use Google profile pic)
- Display name customization
- User presence indicators

### 🎨 Modern UI/UX
- Responsive design for all devices
- Gradient backgrounds and smooth animations
- Hover effects and transitions
- Message bubbles with sender/receiver distinction
- File type-specific rendering (images, videos, audio, documents)
- Loading states and spinners
- Sticky navigation bar

### 🗑️ Chat Management
- Clear chat history (local & Firebase)
- Delete failed messages
- Contact information view
- Options dropdown menu

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
```
git clone https://github.com/yourusername/react-firebase-chat-app.git
cd react-firebase-chat-app
npm install
```
2. **Configure Firebase Project**
```
1. Create a Firebase Project:
-Go to https://console.firebase.google.com
-Create a new project
-Add a Web App
-Copy the Firebase config and paste it into src/firebase.js

2. Enable Authentication:
-Firebase Console → Authentication → Sign-in Methods
-Enable Email/Password
-Enable Google

3. Set Up Firestore and Storage:
-Create Firestore Database
-Create Storage Bucket

4. Add Authorized Domains:
-Firebase Console → Authentication → Settings → Authorized Domains
add these:
-localhost
-your-netlify-site.netlify.app
```
3. **Run the Project**
```
Development Server: npm run dev
and visit: http://localhost:5173
```
