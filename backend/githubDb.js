const axios = require('axios');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';

const api = axios.create({
  baseURL: `https://api.github.com/repos/${OWNER}/${REPO}/contents/`,
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

/**
 * Dapatkan path file berdasarkan tipe dan identifier
 */
function getPath(type, identifier) {
  switch (type) {
    case 'user':
      return 'users.json';
    case 'comment':
      return `comments/${encodeURIComponent(identifier)}.json`;
    case 'bookmark':
      return `bookmarks/${encodeURIComponent(identifier)}.json`;
    case 'like':
      return `likes/${encodeURIComponent(identifier)}.json`;
    case 'history':
      return `history/${encodeURIComponent(identifier)}.json`;
    default:
      throw new Error('Unknown type');
  }
}

/**
 * Baca file dari GitHub
 */
async function getFile(type, identifier) {
  const path = getPath(type, identifier);
  try {
    const response = await api.get(path, { params: { ref: BRANCH } });
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return {
      sha: response.data.sha,
      content: JSON.parse(content),
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // File belum ada, kembalikan nilai default sesuai tipe
      const defaultContent = type === 'like' ? [] : (type === 'user' ? [] : (type === 'comment' ? [] : []));
      return { sha: null, content: defaultContent };
    }
    throw error;
  }
}

/**
 * Simpan file ke GitHub
 */
async function saveFile(path, data, sha = null) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = {
    message: `Update ${path}`,
    content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  await api.put(path, body);
}

/**
 * Update file dengan mekanisme retry jika konflik
 * @param {string} type - 'user', 'comment', 'bookmark', 'like'
 * @param {string} identifier - misal animeSlug, userId, videoId
 * @param {Function} updateFn - (oldContent) => newContent
 * @param {number} maxRetries
 */
async function updateFile(type, identifier, updateFn, maxRetries = 3) {
  const path = getPath(type, identifier);
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { sha, content } = await getFile(type, identifier);
      const newContent = updateFn(content);
      await saveFile(path, newContent, sha);
      return; // Sukses
    } catch (error) {
      if (error.response?.status === 409 && attempt < maxRetries - 1) {
        // Konflik, tunggu sebentar lalu coba lagi
        await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
      } else {
        throw error;
      }
    }
  }
}

module.exports = { getFile, updateFile };