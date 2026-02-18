const express = require('express');
const router = express.Router();
const AnimeIndo = require('../scraper/AnimeIndo');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');
const bookmarkController = require('../controllers/bookmarkController');
const likeController = require('../controllers/likeController');
const historyController = require('../controllers/historyController');

const scraper = new AnimeIndo();

// Public endpoints (scraper)
router.get('/home', async (req, res) => {
  const page = req.query.page || 1;
  const data = await scraper.home(page);
  res.json(data);
});

router.get('/detail', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });
  const data = await scraper.detail(url);
  res.json(data);
});

router.get('/genre/:type', async (req, res) => {
  const { type } = req.params;
  const page = req.query.page || 1;
  const data = await scraper.genre(type, page);
  res.json(data);
});

router.get('/search', async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });
  const data = await scraper.search(q, page);
  res.json(data);
});

router.get('/stream', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });
  const data = await scraper.stream(url);
  res.json(data);
});

router.get('/anime-list', async (req, res) => {
  const data = await scraper.animeList();
  res.json(data);
});

router.get('/movie', async (req, res) => {
  const page = req.query.page || 1;
  const data = await scraper.movie(page);
  res.json(data);
});

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/profile', auth, authController.profile);

// Bookmarks (protected)
router.post('/bookmarks/add', auth, bookmarkController.addBookmark);
router.post('/bookmarks/remove', auth, bookmarkController.removeBookmark);
router.get('/bookmarks', auth, bookmarkController.getBookmarks);

// Comments
router.post('/comments/add', auth, commentController.addComment);
router.get('/comments/:animeSlug', commentController.getComments);

// Likes (protected)
router.post('/likes/like', auth, likeController.likeVideo);
router.post('/likes/unlike', auth, likeController.unlikeVideo);
router.get('/likes/:videoId', likeController.getLikes);

// History routes (protected)
router.post('/history/add', auth, historyController.addHistory);
router.get('/history', auth, historyController.getHistory);
router.delete('/history/item', auth, historyController.deleteHistoryItem); // optional
router.delete('/history/clear', auth, historyController.clearHistory);     // optional

module.exports = router;