const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const sourceUrl = "https://citygirldaily.cc/";
const contentDir = path.join(root, "content");
const imageDir = path.join(root, "assets", "images");
const outputPath = path.join(contentDir, "articles.json");

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value = "") {
  return decodeHtml(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[#?'"()$]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function stableViews(slug) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 100 + (hash % 201);
}

function meta(html, property) {
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
  return decodeHtml(html.match(pattern)?.[1] || "");
}

function extractParagraphs(html) {
  const h1Index = html.indexOf("<h1");
  const region = h1Index >= 0 ? html.slice(h1Index, h1Index + 12000) : html;
  return Array.from(region.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => stripTags(match[1]))
    .filter((text) => text && !/googlesyndication|adsbygoogle|script async/i.test(text))
    .filter((text) => text.length > 30)
    .slice(0, 8);
}

function titleCaseCategory(slug) {
  const words = slug
    .split("-")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part));
  return words.map((word, index) => (index > 0 && word.toLowerCase() === "and" ? "and" : word)).join(" ");
}

function getHomeArticles(html) {
  const hrefs = Array.from(html.matchAll(/href="(https:\/\/citygirldaily\.cc\/posts\/[^"]+)"/g)).map((match) => match[1]);
  const unique = [...new Set(hrefs)].slice(0, 24);

  return unique.map((url) => {
    const index = html.indexOf(url);
    const before = html.slice(Math.max(0, index - 900), index);
    const after = html.slice(index, index + 900);
    const categoryHref = before.match(/href="https:\/\/citygirldaily\.cc\/category\/([^"]+)"/g)?.pop() || "";
    const categorySlug = categoryHref.match(/category\/([^"]+)/)?.[1] || "city-lifestyle";
    const img = before.match(/<img[^>]+class="[^"]*card-img[^"]*"[^>]+src="([^"]+)"/)?.[1] || after.match(/<img[^>]+src="([^"]+)"/)?.[1] || "";
    return {
      sourceUrl: url,
      sourceCategory: titleCaseCategory(categorySlug),
      sourceImage: img,
    };
  });
}

function rewriteTitle(title) {
  const rewritten = title
    .replace(/^Fashion Goes on Strike to Protest ICE and a National Shutdown$/i, "Fashion Paused for a Day, and the Message Was Impossible to Miss")
    .replace(/^Rihanna Reimagines/i, "Rihanna Softly Reworks")
    .replace(/^Dakota Johnson Reveals the Fashion Trend She’s Embracing for 2026 and the One She’s Quietly Retiring$/i, "Dakota Johnson Is Betting on Soft Tailoring for 2026")
    .replace(/^Bye-Bye Burgundy: Midnight Blue Nails Are the Moodiest Manicure of Winter 2026$/i, "Midnight Blue Nails Are Winter’s Chicest Burgundy Alternative")
    .replace(/^Volufiline:/i, "Volufiline, Explained:")
    .replace(/^53 Valentine’s Day Nail Trends for the Hopeless Romantic \(and the Stylish Realist\)$/i, "Valentine’s Day Nails Are Getting a Grown-Up Rewrite")
    .replace(/^Licorice Extract Might Be/i, "Licorice Extract Is Becoming")
    .replace(/^The New Romantics Arrive/i, "The New Romantics Return")
    .replace(/^These Are the Three Most In Demand/i, "The Three Most Requested")
    .replace(/^The Curious Case of/i, "Why Everyone Is Talking About")
    .replace(/^A combination of Smoky Ameth and Pink Sheers with Sage: The 9 amulets\. Nail Color Trends Defining 2026\.$/i, "Smoky Amethyst and Pink Sheers Are Defining 2026 Nails")
    .replace(/^The Best-Dressed Stars of the Week Proved/i, "This Week’s Best-Dressed Stars Proved")
    .replace(/^10 Manicure Colors and Nail Trends to Try in 2026$/i, "The Manicure Colors Worth Trying in 2026")
    .replace(/^Ease Into the New Year With/i, "Ease Back Into Work With")
    .replace(/^All the Celebrity Looks From/i, "The Standout Celebrity Looks From")
    .replace(/^The Best Dressed Celebrities at/i, "The Best-Dressed Celebrities at")
    .replace(/^How to Treat Neck Wrinkles, According to Dermatologists$/i, "How Dermatologists Really Think About Neck Wrinkles")
    .replace(/^From Red Carpets to Sidewalks,/i, "From Red Carpets to Sidewalks,")
    .replace(/^A\$AP Rocky's latest video "Punk Rocky" features Winona Ryder performing a stunt that leaves her stunned\.$/i, "Winona Ryder’s Punk Rocky Cameo Is a 2026 Pop-Culture Curveball")
    .replace(/^Sunscreen in Winter Isn’t Optional Here’s/i, "Winter Sunscreen Is Not Optional. Here’s")
    .trim();
  return rewritten.replace(/\.\.+$/g, ".").replace(/\s+/g, " ");
}

function rewriteDeck(title, description) {
  const clean = decodeHtml(description).replace(/\s+/g, " ").trim();
  const firstSentence = clean.split(/(?<=[.!?])\s+/)[0] || clean;
  if (firstSentence.length > 80) {
    return `${firstSentence.slice(0, 132).trimEnd()}...`;
  }
  return firstSentence || `${title} is the latest style conversation worth keeping on your radar.`;
}

function rewriteBody(article, sourceParagraphs) {
  const title = article.title.replace(/[?.!]+$/, "");
  const source = sourceParagraphs.join(" ");
  const hasBeauty = /skin|nail|manicure|sunscreen|peptide|wrinkle|beauty|haircut|extract/i.test(`${title} ${source}`);
  const hasCelebrity = /rihanna|dakota|katy|hailey|golden globes|red carpet|celebrity|a\$ap|winona|noah|sara/i.test(`${title} ${source}`);
  const hasWork = /office|work|shutdown|strike|business|shopping/i.test(`${title} ${source}`);
  const angle = hasBeauty ? "beauty routine" : hasCelebrity ? "celebrity style cycle" : hasWork ? "city wardrobe" : "fashion conversation";

  return [
    `${title} lands in that sweet spot between a trend report and a getting-dressed note. It has enough visual pull to make people stop scrolling, but it also says something practical about how style is moving through real life right now.`,
    `The interesting part is not simply that the look or idea is visible. It is that it feels easy to translate. A reader can take the mood and turn it into a cleaner manicure, a sharper coat, a softer office outfit, or a beauty step that makes an existing routine feel more considered.`,
    `For an American and European audience, the appeal is usually in restraint. The strongest version does not try to wear every trend at once. It chooses one focal point, keeps the rest of the styling disciplined, and lets proportion, texture, color, or finish do the talking.`,
    `${article.deck} That is why the story feels timely: it gives readers a reference point without asking them to rebuild their whole closet or bathroom shelf around a single moment.`,
    `The smarter way to approach this ${angle} is to start with what already works. If the idea is about color, pair it with dependable neutrals. If it is about shape, keep accessories clean. If it is about skincare, give the ingredient time and pay attention to how the skin actually responds.`,
    `There is also a wider shift underneath it. Fashion and beauty readers are becoming more selective. They still want novelty, but they want it to fit into commutes, dinners, school runs, office days, weekends away, and photographs that do not feel over-styled five minutes later.`,
    `That is what makes this story useful beyond the headline. It is less about chasing a single viral moment and more about editing taste with confidence. The best takeaway is simple: borrow the mood, refine it for your life, and leave room for personal instinct.`,
  ];
}

function imageName(url, slug) {
  const ext = ".avif";
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  return `${slug.slice(0, 48)}-${hash}${ext}`;
}

async function downloadAvif(url, slug) {
  await fs.mkdir(imageDir, { recursive: true });
  const fileName = imageName(url, slug);
  const filePath = path.join(imageDir, fileName);
  try {
    await fs.access(filePath);
    return `assets/images/${fileName}`;
  } catch {
    // continue
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GlossAndCityImporter/1.0)",
      "Referer": sourceUrl,
    },
  });
  if (!response.ok) throw new Error(`Image download failed ${response.status}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const converted = await sharp(bytes, { limitInputPixels: false })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .avif({ quality: 76, effort: 5 })
    .toBuffer();
  await fs.writeFile(filePath, converted);
  return `assets/images/${fileName}`;
}

async function main() {
  await fs.mkdir(contentDir, { recursive: true });
  const home = await (await fetch(sourceUrl)).text();
  const homeArticles = getHomeArticles(home);
  const articles = [];

  for (let index = 0; index < homeArticles.length; index += 1) {
    const item = homeArticles[index];
    const html = await (await fetch(item.sourceUrl)).text();
    const originalTitle = meta(html, "og:title") || stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
    const sourceDescription = meta(html, "og:description");
    const sourceImage = meta(html, "og:image") || item.sourceImage;
    const sourceParagraphs = extractParagraphs(html);
    const title = rewriteTitle(originalTitle);
    const slug = slugify(title);
    const deck = rewriteDeck(title, sourceDescription || sourceParagraphs[0] || "");
    const localImage = await downloadAvif(sourceImage, slug);
    const article = {
      slug,
      title,
      category: item.sourceCategory,
      author: ["Mara Ellison", "Felicia Bloom", "Nina Vale", "June Hart", "Cleo Nash", "Ari Lane"][index % 6],
      date: new Date(Date.UTC(2026, 4, 19 - index)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
      deck,
      views: stableViews(slug),
      image: [localImage, title],
      body: rewriteBody({ title, deck }, sourceParagraphs),
      sourceUrl: item.sourceUrl,
    };
    articles.push(article);
    console.log(`${index + 1}/24 ${article.slug}`);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
  console.log(`Imported ${articles.length} rewritten articles to ${path.relative(root, outputPath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
