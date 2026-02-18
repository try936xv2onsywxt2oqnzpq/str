const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { updateFile, getFile } = require('../githubDb');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const newUser = {
      _id: uuidv4(),
      username,
      email,
      password: hashed,
      createdAt: new Date().toISOString(),
    };

    // Simpan user ke users.json
    await updateFile('user', null, (users) => {
      if (users.some(u => u.email === email)) {
        throw new Error('Email already exists');
      }
      users.push(newUser);
      return users;
    });

    // Inisialisasi bookmark untuk user baru (file bookmark/userId.json akan dibuat saat pertama kali add)
    // Tidak perlu inisialisasi sekarang, nanti otomatis saat addBookmark pertama

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true }).status(201).json({
      user: { id: newUser._id, username: newUser.username }
    });
  } catch (err) {
    if (err.message === 'Email already exists') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { content: users } = await getFile('user', null);
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, { httpOnly: true }).json({
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
};

exports.profile = async (req, res) => {
  try {
    const { content: users } = await getFile('user', null);
    const user = users.find(u => u._id === req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};