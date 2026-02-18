const cheerio = require("cheerio");

class AnimeIndo {
  
  static validGenres = [
    'action', 'adventrue', 'adventure', 'anthropomorphic',
    'avant-garde', 'cars', 'cgdct', 'childcare',
    'comdey', 'comedy', 'crossdressing', 'delinquents',
    'dementia', 'demons', 'detective', 'donghua',
    'drama', 'ecchi', 'echhi', 'educational',
    'erotica', 'family', 'fantasy', 'gag-humor',
    'game', 'girls-love', 'gore', 'gourmet',
    'harem', 'historical', 'horror', 'idols-female',
    'idols-male', 'isekai', 'josei', 'kids',
    'life', 'live-action', 'love-polygon', 'love-status-quo',
    'magic', 'mahou-shoujo', 'martial-arts', 'mecha',
    'medical', 'military', 'music', 'mystery',
    'mythology', 'organized-crime', 'otaku-culture', 'parody',
    'performing-arts', 'pets', 'police', 'psychological',
    'racing', 'reincarnation', 'reverse-harem', 'romance',
    'romantic-subtext', 'samurai', 'school', 'sci-fi',
    'seinen', 'shoujo', 'shoujo-ai', 'shounen',
    'shounen-ai', 'showbiz', 'slice-of-life', 'space',
    'sports', 'strategy-game', 'super-power', 'supernatural',
    'survival', 'suspense', 'team-sports', 'thriller',
    'time-travel', 'tokusatsu', 'urban-fantasy', 'vampire',
    'video-game', 'villainess', 'work-life', 'workplace',
    'yaoi'
  ];

  constructor(baseUrl = "https://anime-indo.lol") {
    this.baseUrl = baseUrl;
  }

  #absoluteUrl(url) {
    if (!url) return null;
    return url.startsWith("http") ? url : this.baseUrl + url;
  }

  #parseHome(html) {
    const $ = cheerio.load(html);
    const updateTerbaru = [];
    $(".ngiri .menu a").each((i, el) => {
      const link = this.#absoluteUrl($(el).attr("href"));
      const img = $(el).find("img").attr("data-original") || $(el).find("img").attr("src");
      const title = $(el).find("p").text().trim();
      const eps = $(el).find(".eps").text().trim();
      updateTerbaru.push({ title, eps, link, image: this.#absoluteUrl(img) });
    });

    const popular = [];
    $(".nganan .ztable").each((i, el) => {
      const link = this.#absoluteUrl($(el).find("td.zvidesc a").attr("href"));
      const title = $(el).find("td.zvidesc a").text().trim();
      const image = this.#absoluteUrl($(el).find("td.zvithumb img").attr("src"));
      const genres = $(el).find("td.zvidesc").clone().children("a").remove().end().text().trim();
      popular.push({ title, link, image, genres });
    });

    return { latest: updateTerbaru, popular };
  }

  #parseDetail(html) {
    const $ = cheerio.load(html);
    const title = $(".ngirix h1.title").text().trim();
    const img = this.#absoluteUrl($(".ngirix .detail img").attr("src"));
    const altTitle = $(".ngirix .detail h2").text().trim();
    const genres = [];
    $(".ngirix .detail li a").each((i, el) => {
      genres.push({ name: $(el).text().trim(), url: this.#absoluteUrl($(el).attr("href")) });
    });
    const description = $(".ngirix .detail p").text().trim();
    const episodes = [];
    $(".menu .ep a").each((i, el) => {
      episodes.push({ episode: $(el).text().trim(), url: this.#absoluteUrl($(el).attr("href")) });
    });
    return { title, altTitle, img, genres, description, episodes };
  }

  #parseGenre(html) {
    const $ = cheerio.load(html);
    const data = [];
    $(".ngiri .menu table.otable").each((i, el) => {
      const row = $(el);
      const link = this.#absoluteUrl(row.find("td.vithumb a").attr("href"));
      const img = this.#absoluteUrl(row.find("td.vithumb img").attr("src"));
      const title = row.find("td.videsc a").first().text().trim();
      const labels = row.find("td.videsc .label").map((i, span) => $(span).text().trim()).get();
      const type = labels[0] || null;
      const status = labels[1] || null;
      const year = labels[2] || null;
      const description = row.find("td.videsc p.des").text().trim();
      data.push({ title, link, img, type, status, year, description });
    });
    return data;
  }

  #parseSearch(html) {
    const $ = cheerio.load(html);
    const results = [];
    $("table.otable").each((i, el) => {
      const row = $(el);
      const link = this.#absoluteUrl(row.find(".videsc a").first().attr("href"));
      const title = row.find(".videsc a").first().text().trim();
      const img = this.#absoluteUrl(row.find(".vithumb img").attr("src"));
      const labels = row.find(".videsc .label").map((i, el) => $(el).text().trim()).get();
      const description = row.find(".videsc p.des").text().trim();
      results.push({
        title,
        link,
        img,
        type: labels[0] || null,
        duration: labels[1] || null,
        year: labels[2] || null,
        description,
      });
    });
    return results;
  }

  #parseStream(html) {
  const $ = cheerio.load(html);

  const result = {
    animeDetails: {},
    videoPlayer: {},
    navigation: {},
    downloads: [],
    popularAnime: []
  };

  const detailContainer = $('.detail');
  result.animeDetails = {
    title: $('h1.title').first().text().trim(),
    imageUrl: this.#absoluteUrl(detailContainer.find('img').attr('src')),
    synopsis: detailContainer.find('p').text().trim()
  };

  result.videoPlayer = {
    servers: []
  };

  $('a.server').each((index, element) => {
  const serverName = $(element).text().trim();
  let serverUrl = $(element).data('video');

  if (serverName && serverUrl) {
    if (serverName.toUpperCase() === 'B-TUBE') {
      serverUrl = this.#absoluteUrl(serverUrl);
    }

    result.videoPlayer.servers.push({
      name: serverName,
      url: serverUrl
    });
  }
});

  const naviContainer = $('.navi');
  result.navigation = {
    prevEpisode: this.#absoluteUrl(naviContainer.find('a:contains("Prev")').attr('href')),
    allEpisodes: this.#absoluteUrl(naviContainer.find('a:contains("Semua Episode")').attr('href')),
    nextEpisode: this.#absoluteUrl(naviContainer.find('a:contains("Next")').attr('href'))
  };

  naviContainer.find('a[target="_blank"]').each((index, element) => {
    const name = $(element).text().trim();
    const url = $(element).attr('href');
    if (name && url) {
      result.downloads.push({ name, url });
    }
  });

  $('.nganan .ztable').each((index, element) => {
    const title = $(element).find('.zvidesc a').text().trim();
    const link = this.#absoluteUrl($(element).find('.zvidesc a').attr('href'));
    const imageUrl = this.#absoluteUrl($(element).find('.zvithumb img').attr('src'));

    let genres = '';

const zvidesc = $(element).find('.zvidesc');
const br = zvidesc.find('br').first();

if (br.length) {
  genres = br[0].nextSibling
    ? $(br[0].nextSibling).text().trim()
    : '';
}

    if (title && link) {
      result.popularAnime.push({
        title,
        link,
        imageUrl,
        genres
      });
    }
  });

  return result;
}
  
  #parseAnimeList(html) {
  const $ = cheerio.load(html);
  const result = [];

  $(".anime-list li").each((_, el) => {
    const a = $(el).find("a");
    if (!a.length) return;

    result.push({
      title: a.text().trim(),
      url: this.#absoluteUrl(a.attr("href"))
    });
  });

  return result;
}
 
  #parseMovie(html) {
  const $ = cheerio.load(html)
  const results = []

  $(".menu table.otable").each((_, table) => {
    const el = $(table)

    const linkEl = el.find("td.vithumb a")
    const infoEl = el.find("td.videsc")

    const title = infoEl.find("a").first().text().trim()
    const href = linkEl.attr("href") || ""
    const src  = linkEl.find("img").attr("src") || ""
    const url = href ? this.#absoluteUrl(href) : null
    const thumbnail = src ? this.#absoluteUrl(src) : null
    const labels = infoEl.find("span.label").map((_, s) =>
      $(s).text().trim()
    ).get()
    const description = infoEl.find("p.des").text().trim() || null

    results.push({
      title,
      url,
      thumbnail,
      type: labels[0] || null,
      duration: labels[1] || null,
      year: labels[2] || null,
      description
    })
  })

  return results
}

  async home(page = 1) {
    try {
      const response = await fetch(`${this.baseUrl}/page/${page}/`, {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          "sec-ch-ua": "\"Chromium\";v=\"139\", \"Not;A=Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "GET"
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const html = await response.text();
      return this.#parseHome(html);
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  }

  async detail(url) {
    try {
      const res = await fetch(url, {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          "sec-ch-ua": "\"Chromium\";v=\"139\", \"Not;A=Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "Referer": `${this.baseUrl}/page/1/`,
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        method: "GET"
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const html = await res.text();
      return this.#parseDetail(html);
    } catch (err) {
      console.error("Fetch gagal:", err);
      return null;
    }
  }

  async genre(type, page = 1) {
    try {
      const genre = String(type).toLowerCase().trim();
      
      if (!AnimeIndo.validGenres.includes(genre)) {
        return {
          message: `Invalid genre: '${type}'. Allowed genres: ${AnimeIndoScraper.validGenres.join(', ')}`
          };
      }
      const res = await fetch(`${this.baseUrl}/genres/${type}/page/${page}/`, {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "sec-ch-ua": "\"Chromium\";v=\"139\", \"Not;A=Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "upgrade-insecure-requests": "1",
        },
        method: "GET"
      });
      const html = await res.text();
      return this.#parseGenre(html);
    } catch (e) {
      console.log("ERROR GENRE: " + e);
      return {
        message: 'Invalid Parameter Atau Url nya Path nya salah wajib pakai hasil dari search jangan di hapus hapus'
      };
    }
  }

  async search(query, page = 1) {
    try {
      const res = await fetch(`${this.baseUrl}/search/${query}/page/${page}/`, {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "sec-ch-ua": "\"Chromium\";v=\"139\", \"Not;A=Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "Referer": `${this.baseUrl}/search/${query}/`,
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        method: "GET"
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const html = await res.text();
      return this.#parseSearch(html);
    } catch (err) {
      console.error("Gagal fetch:", err);
      return null;
    }
  }

  async stream(url) {
    try {
      const res = await fetch(url, {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          "sec-ch-ua": "\"Chromium\";v=\"139\", \"Not;A=Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "GET"
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const html = await res.text();
      return this.#parseStream(html);
    } catch (err) {
      console.error("Error fetch episode:", err);
      return null;
    }
  }
  
  async animeList() {
  const url = `${this.baseUrl}/anime-list/`
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
        "Accept-Language": "id-ID,id;q=0.9"
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`)
    }
    const html = await response.text()
    return this.#parseAnimeList(html)
  } catch (error) {
    console.error("Gagal fetch anime list:", error.message)
    throw error
    }
  }
  
  async movie(page = 1) {
  const url = `${this.baseUrl}/movie/page/${page}/`

  const headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`)
    }

    const html = await response.text()
    return this.#parseMovie(html)
  } catch (error) {
    console.error("Gagal fetch movie page:", error.message)
    throw error
    }
  }
}
module.exports = AnimeIndo;