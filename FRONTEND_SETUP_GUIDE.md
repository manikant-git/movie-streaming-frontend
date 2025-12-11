# React Frontend - Complete Setup Guide

## QUICK START (5 Minutes)

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Git

### Setup Steps

```bash
# 1. Clone the frontend repository
git clone https://github.com/manikant-git/movie-streaming-frontend.git
cd movie-streaming-frontend

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=5000
REACT_APP_DEBUG=true
EOF

# 4. Start development server
npm start

# 5. Open browser
# Navigate to http://localhost:3000
```

---

## PROJECT STRUCTURE

```
movie-streaming-frontend/
├── public/
│   ├── index.html          # Main HTML file
│   └── favicon.ico
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Header.jsx      # Navigation header
│   │   ├── MovieCard.jsx   # Movie display card
│   │   ├── MovieList.jsx   # Movie listing
│   │   └── Player.jsx      # Video player
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Home/Dashboard
│   │   ├── Login.jsx       # Login page
│   │   ├── MovieDetails.jsx# Movie details page
│   │   └── Watch.jsx       # Streaming page
│   ├── services/           # API services
│   │   ├── api.js          # Axios instance
│   │   ├── movieService.js # Movie API calls
│   │   ├── userService.js  # User API calls
│   │   └── authService.js  # Auth API calls
│   ├── context/            # React Context (State management)
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── MovieContext.jsx# Movies state
│   ├── styles/             # CSS files
│   │   ├── App.css
│   │   ├── components.css
│   │   └── pages.css
│   ├── App.jsx             # Main App component
│   ├── index.jsx           # Entry point
│   └── config.js           # Configuration
├── package.json            # Dependencies
├── .env                    # Environment variables
├── .gitignore
└── README.md
```

---

## CONNECTING TO BACKEND

### API Gateway Connection

**File: src/services/api.js**

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || 5000),
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example API Calls

**File: src/services/movieService.js**

```javascript
import api from './api';

export const movieService = {
  // Get all movies from Movie Service (via API Gateway)
  getAllMovies: async () => {
    return api.get('/api/v1/movies');
  },

  // Get specific movie
  getMovieById: async (id) => {
    return api.get(`/api/v1/movies/id?id=${id}`);
  },

  // Search movies
  searchMovies: async (query) => {
    return api.get(`/api/v1/search?q=${query}`);
  },
};
```

---

## COMPONENT EXAMPLES

### Home Component (Fetching Movies)

```javascript
// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getAllMovies();
        setMovies(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div>Loading movies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="movie-list">
      <h1>Available Movies</h1>
      <div className="movies-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default Home;
```

### Authentication Flow

```javascript
// src/services/authService.js
import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/v1/users/login', {
      email,
      password,
    });
    
    // Store token
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },
};
```

---

## RUNNING IN DOCKER

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run

```bash
# Build Docker image
docker build -t movie-streaming-frontend:latest .

# Run container
docker run -p 3000:80 \
  -e REACT_APP_API_URL=http://api-gateway:8080 \
  movie-streaming-frontend:latest
```

---

## ENVIRONMENT VARIABLES

Create `.env` file in root:

```
# API Configuration
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=5000

# Feature Flags
REACT_APP_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=true

# App Info
REACT_APP_NAME=Movie Streaming
REACT_APP_VERSION=1.0.0
```

---

## TESTING THE FRONTEND

### Manual Testing

```bash
# 1. Start backend services
cd ../movie-streaming-deployment
docker-compose up -d

# 2. Start frontend
cd ../movie-streaming-frontend
npm start

# 3. Open http://localhost:3000

# 4. Test flows:
#    - Login/Registration
#    - Browse movies (GET /api/v1/movies)
#    - Search movies (GET /api/v1/search?q=inception)
#    - Watch movie (GET /api/v1/stream/:id)
```

### Unit Tests

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## DEPLOYMENT

### Production Build

```bash
# Build optimized version
npm run build

# Test production build locally
npm install -g serve
serve -s build
```

### Deploy to Netlify

```bash
# Connect GitHub repo to Netlify
# Build command: npm run build
# Publish directory: build
```

### Deploy to AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## TROUBLESHOOTING

### CORS Issues

**Error**: `No 'Access-Control-Allow-Origin' header`

**Solution**: API Gateway should send proper CORS headers

```go
// In API Gateway
w.Header().Set("Access-Control-Allow-Origin", "*")
w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
```

### Authentication Not Working

**Check**:
1. Token stored in localStorage: `localStorage.getItem('authToken')`
2. Token sent in headers: Network tab → Headers → Authorization
3. API Gateway verifies token before routing

### API Not Responding

**Debug**:
```bash
# Check if backend is running
curl -H "Authorization: Bearer test" http://localhost:8080/api/v1/movies

# Check frontend console for errors
# Check Network tab in DevTools
```

---

## KEY POINTS FOR DEVOPS

✅ Frontend is **separate deployment** from backend
✅ API Gateway (port 8080) is **single point of contact**
✅ Frontend runs on **port 3000** (dev) or **Nginx** (production)
✅ **Environment variables** control API endpoint
✅ **Dockerfile** provided for containerization
✅ Can be **deployed independently** from backend

---

## NEXT STEPS

1. **Frontend Files to Create**:
   - src/components/*.jsx
   - src/pages/*.jsx
   - src/services/*.js
   - src/styles/*.css

2. **Integrate with Backend**:
   - Update .env with API Gateway URL
   - Test all API endpoints
   - Implement authentication

3. **Deployment**:
   - Build Docker image
   - Push to registry
   - Deploy with docker-compose or Kubernetes

---

## COMPLETE SETUP CHECKLIST

- [ ] Clone frontend repo
- [ ] Install dependencies (npm install)
- [ ] Create .env file
- [ ] Verify backend is running
- [ ] Start frontend (npm start)
- [ ] Test login page
- [ ] Test movie listing
- [ ] Test search functionality
- [ ] Test video player
- [ ] Create production build
- [ ] Dockerize application
- [ ] Deploy to production
