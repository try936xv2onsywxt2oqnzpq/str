require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({
    message: 'Anime API is running',
    endpoints: {
      home: '/api/home',
      detail: '/api/detail?url=...',
      search: '/api/search?q=...',
      genre: '/api/genre/:type',
      stream: '/api/stream?url=...',
      animeList: '/api/anime-list',
      movie: '/api/movie',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        profile: '/api/auth/profile'
      },
      bookmarks: '/api/bookmarks (with auth)',
      comments: '/api/comments/:animeSlug',
      likes: '/api/likes/:videoId',
      history: '/api/history (with auth)'
    }
  });
});

app.use('/api', apiRoutes);

module.exports = app;