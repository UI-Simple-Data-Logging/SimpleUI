# 🧪 Simple Data Logging UI

A full-stack MERN app for logging sensor items with values and timestamps. Built with React, Express, MongoDB Atlas, and styled using Tailwind CSS.

---

## 🚀 Features

- ✅ Add, edit, and delete sensor items
- 🕒 Automatically generates timestamp on creation
- ♻️ Instant UI update without full reload
- 🔔 Toast notifications for actions and errors
- 🌐 Connected to MongoDB Atlas (cloud database)
- 🎨 Beautiful responsive UI using Tailwind CSS
- 🔄 Loading spinner feedback during async actions

---

## 🏗️ Tech Stack

| Layer       | Tech                           |
|-------------|--------------------------------|
| Frontend    | React, Tailwind CSS            |
| Backend     | Node.js, Express               |
| Database    | MongoDB Atlas                  |
| HTTP Client | Axios                          |

---

## 📦 Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/UI-Simple-Data-Logging/SimpleUI.git
cd SimpleUI
```

### 🛠️ Backend Setup

```bash
cd backend
npm install

# Create a .env file based on the provided example
cp .env.example .env

# Start backend server
npm run dev
```

### 💻 Frontend Setup

```bash
cd ../frontend
npm install

# Create a .env file for React
cp .env.example .env

# Start frontend
npm start
```

---

## 🗂️ Environment Variables

### 📍 `frontend/.env.example`

```env
REACT_APP_API_BASE_URL=http://localhost:5050/api
```

### 📍 `backend/.env.example`

```env
MONGO_URI=your_mongodb_connection_string
PORT=5050
```

---

## 📸 Preview

> Add a screenshot here later:
> `![UI Preview](./screenshots/preview.png)`
