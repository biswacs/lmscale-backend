const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

class WebsiteCrawler {
  constructor() {
    this.visited = new Set();
    this.results = [];
  }

  async crawl(startUrl) {
    try {
      const response = await axios.get(startUrl);
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const content = [];
        $("p, h1, h2, h3, h4, h5, h6, article, main, .content").each(
          (_, el) => {
            const text = $(el).text().trim();
            if (text.length > 50) {
              content.push(text);
            }
          }
        );

        const links = [];
        $("a[href]").each((_, el) => {
          try {
            const href = $(el).attr("href");
            const url = new URL(href, startUrl);
            if (url.protocol.startsWith("http")) {
              links.push(url.href);
            }
          } catch (error) {
            console.log(error);
          }
        });

        const icons = [];
        $('link[rel*="icon"]').each((_, el) => {
          try {
            const href = $(el).attr("href");
            const type = $(el).attr("type") || "";
            const rel = $(el).attr("rel") || "";
            const url = new URL(href, startUrl);
            icons.push({
              url: url.href,
              type: type,
              rel: rel,
            });
          } catch (error) {
            console.log(error);
          }
        });

        return {
          url: startUrl,
          title: $("title").text().trim(),
          content,
          links,
          icons,
        };
      }
    } catch (error) {
      console.error(`Error crawling ${startUrl}:`, error.message);
      return {
        url: startUrl,
        error: error.message,
      };
    }
  }
}

const crawler = new WebsiteCrawler();
crawler
  .crawl("https://lmscale.tech")
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

module.exports = WebsiteCrawler;
