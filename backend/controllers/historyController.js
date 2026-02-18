const { updateFile, getFile } = require('../githubDb');

/**
 * Catat riwayat tontonan
 * Body: { animeUrl, episodeUrl, title, image }
 */
exports.addHistory = async (req, res) => {
  try {
    const { animeUrl, episodeUrl, title, image } = req.body;
    const userId = req.userId;

    if (!animeUrl || !episodeUrl || !title) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newEntry = {
      animeUrl,
      episodeUrl,
      title,
      image: image || null,
      watchedAt: new Date().toISOString(),
    };

    await updateFile('history', userId, (history) => {
      // Tambahkan di awal array (terbaru)
      history.unshift(newEntry);
      // Batasi jumlah history? Misal simpan 100 terakhir
      if (history.length > 100) history.pop();
      return history;
    });

    res.status(201).json({ message: 'History added', entry: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ambil riwayat tontonan user (terbaru)
 * Query params: limit (default 50)
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 50;

    const { content: history } = await getFile('history', userId);
    // history sudah terurut descending (karena unshift)
    const limited = history.slice(0, limit);
    res.json(limited);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus satu item history berdasarkan episodeUrl (opsional)
 */
exports.deleteHistoryItem = async (req, res) => {
  try {
    const { episodeUrl } = req.body;
    const userId = req.userId;

    if (!episodeUrl) {
      return res.status(400).json({ message: 'episodeUrl required' });
    }

    await updateFile('history', userId, (history) => {
      return history.filter(item => item.episodeUrl !== episodeUrl);
    });

    res.json({ message: 'History item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus semua history user (opsional)
 */
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.userId;

    await updateFile('history', userId, () => {
      return []; // kosongkan array
    });

    res.json({ message: 'All history cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};