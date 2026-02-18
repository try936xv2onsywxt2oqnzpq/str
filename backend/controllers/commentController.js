const { v4: uuidv4 } = require('uuid');
const { updateFile, getFile } = require('../githubDb');

exports.addComment = async (req, res) => {
  try {
    const { animeSlug, text } = req.body;
    const userId = req.userId;
    const username = req.username;

    const newComment = {
      _id: uuidv4(),
      userId,
      username,
      text,
      createdAt: new Date().toISOString(),
    };

    await updateFile('comment', animeSlug, (comments) => {
      comments.push(newComment);
      return comments;
    });

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { animeSlug } = req.params;
    const { content: comments } = await getFile('comment', animeSlug);
    // Urutkan dari terbaru
    const sorted = comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};