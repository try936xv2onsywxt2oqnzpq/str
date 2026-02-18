const { updateFile, getFile } = require('../githubDb');

exports.likeVideo = async (req, res) => {
  try {
    const { videoId } = req.body; // misal episode URL atau ID
    const userId = req.userId;

    await updateFile('like', videoId, (likes) => {
      if (!likes.includes(userId)) {
        likes.push(userId);
      }
      return likes;
    });

    const { content: likes } = await getFile('like', videoId);
    res.json({ likes, count: likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unlikeVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    const userId = req.userId;

    await updateFile('like', videoId, (likes) => {
      return likes.filter(id => id !== userId);
    });

    const { content: likes } = await getFile('like', videoId);
    res.json({ likes, count: likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content: likes } = await getFile('like', videoId);
    res.json({ likes, count: likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};