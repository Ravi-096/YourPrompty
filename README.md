# YourPrompty 🎨

A full-stack AI prompt sharing platform where users can discover, share, and like creative AI prompts. Built with React, Node.js, MongoDB, AWS S3, and Groq AI.

---

## ✨ Features

- 🔐 Professional JWT authentication (signup, signin, refresh tokens)
- 📸 AWS S3 photo storage for prompts and avatars
- 🤖 AI chatbot powered by Groq (Llama 3.1)
- ❤️ Like system with real-time UI updates
- 🔔 Notifications (likes, follows)
- 👤 Public & private user profiles
- 🔍 Search prompts and users
- 🗑️ Delete prompts with automatic S3 cleanup
- 📱 Fully responsive (mobile + desktop)

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- bcryptjs (password hashing)
- AWS S3 (photo storage)
- Groq AI (chatbot)
- multer-s3 (file uploads)

---

## 📁 Project Structure

```
YourPrompty/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── lib/             # api.ts, helpers
│   │   └── App.tsx
│   └── package.json
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # db.js
│   │   ├── models/          # User, Prompt, RefreshToken, Notification
│   │   ├── routes/          # auth, prompts, users, chat, notifications
│   │   ├── middleware/       # auth.js, errorHandler.js, rateLimiter.js
│   │   ├── services/        # groq.js
│   │   ├── lib/             # jwt.js, s3.js
│   │   └── app.js
│   └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- [Node.js v20+](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/atlas) ( Atlas)
- [AWS Account](https://aws.amazon.com) (for S3)
- [Groq API Key](https://console.groq.com) (free)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ravi-096/YourPrompty.git
cd YourPrompty
```

### 2. Install dependencies

```bash
# Install client dependencies
npm install
# Install server dependencies

cd server
npm install




```

### 3. Setup environment variables

Create a `.env` file inside the `server/` folder:

```env
# Server
PORT=4000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/promptshare

# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/promptshare?retryWrites=true&w=majority

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Groq AI (free at https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

# Rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=10
```

### 4. Generate JWT secrets

Run this command twice to generate two different secret keys:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the first output as `JWT_SECRET` and the second as `JWT_REFRESH_SECRET`.

### 5. Setup AWS S3

1. Create an S3 bucket in AWS Console
2. Uncheck **"Block all public access"**
3. Add this **bucket policy** (replace `your-bucket-name`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Add this **CORS policy**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

5. Create an IAM user with `AmazonS3FullAccess` and copy the access keys to `.env`

### 6. Start the development servers

```bash
# Start backend (from server/ folder)
cd server
node src/index.js
# OR with auto-reload:
npx nodemon src/index.js

# Start frontend (from client/ folder)
cd client
npm run dev
```

### 7. Open the app

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:4000**

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/signout` | Logout |

### Prompts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts` | Get all prompts |
| POST | `/api/prompts` | Create prompt (auth required) |
| POST | `/api/prompts/:id/like` | Like/unlike prompt (auth required) |
| DELETE | `/api/prompts/:id` | Delete prompt (auth required) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/:email/profile` | Get user profile |
| POST | `/api/users/:email/follow` | Follow user (auth required) |
| DELETE | `/api/users/:email/follow` | Unfollow user (auth required) |
| PATCH | `/api/users/me/avatar` | Update avatar (auth required) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications (auth required) |
| PATCH | `/api/notifications/read` | Mark all as read (auth required) |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send message to AI chatbot |
| GET | `/api/chat/health` | Check chatbot status |

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **Access tokens** expire in 15 minutes
- **Refresh token rotation** — old token deleted on every refresh
- Refresh tokens stored in MongoDB with **TTL auto-expiry**
- **Rate limiting** on all routes (200 req/15min global, 10 req/min chat)
- Input validation with **express-validator**
- CORS configured for frontend origin only

---

## 🌱 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Server port (default 4000) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | 64-char secret for access tokens |
| `JWT_REFRESH_SECRET` | ✅ | 64-char secret for refresh tokens |
| `JWT_EXPIRES_IN` | ✅ | Access token expiry (e.g. 15m) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Refresh token expiry (e.g. 7d) |
| `AWS_ACCESS_KEY_ID` | ✅ | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS IAM secret key |
| `AWS_REGION` | ✅ | S3 bucket region |
| `AWS_S3_BUCKET` | ✅ | S3 bucket name |
| `GROQ_API_KEY` | ✅ | Groq API key (free) |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |

---

## 🐛 Common Issues

**MongoDB connection failed**
- Check your `MONGODB_URI` format
- If using Atlas, whitelist your IP: Atlas → Network Access → `0.0.0.0/0`

**S3 upload not working**
- Make sure "Block all public access" is unchecked on the bucket
- Verify IAM user has `AmazonS3FullAccess`

**JWT errors**
- Make sure `JWT_SECRET` and `JWT_REFRESH_SECRET` are different
- Both must be at least 32 characters long

**Groq chatbot not responding**
- Get a free key at [https://console.groq.com](https://console.groq.com)
- Key must start with `gsk_`

---

## 📄 License

MIT License — feel free to use this project for learning or building your own apps.

---

## 🙌 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

Built with ❤️ by [Ravi](https://github.com/Ravi-096)
