const { updateFile, getFile } = require('../githubDb');

exports.addBookmark = async (req, res) => {
  try {
    const { animeUrl, title, image } = req.body;
    const userId = req.userId;

    await updateFile('bookmark', userId, (bookmarks) => {
      // bookmarks adalah array bookmark user
      if (!bookmarks.some(b => b.url === animeUrl)) {
        bookmarks.push({
          url: animeUrl,
          title,
          image,
          addedAt: new Date().toISOString()
        });
      }
      return bookmarks;
    });

    const { content: bookmarks } = await getFile('bookmark', userId);
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const { animeUrl } = req.body;
    const userId = req.userId;

    await updateFile('bookmark', userId, (bookmarks) => {
      return bookmarks.filter(b => b.url !== animeUrl);
    });

    const { content: bookmarks } = await getFile('bookmark', userId);
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.userId;
    const { content: bookmarks } = await getFile('bookmark', userId);
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};