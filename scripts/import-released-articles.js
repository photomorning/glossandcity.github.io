const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const releasedDir = path.join(root, "released");
const contentDir = path.join(root, "content");
const imageDir = path.join(root, "assets", "images");
const outputPath = path.join(contentDir, "articles.json");

function cleanText(value = "") {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/鈥\?/g, "—")
    .replace(/鈥檚/g, "'s")
    .replace(/鈥檛/g, "n't")
    .replace(/鈥檙/g, "'r")
    .replace(/鈥檒/g, "'l")
    .replace(/鈥檝/g, "'v")
    .replace(/鈥/g, "’")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–")
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€\u009d/g, '"');
}

function stripMarkdown(value = "") {
  return cleanText(value)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(value = "") {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function stableViews(slug) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 100 + (hash % 201);
}

function categoryFor(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  if (/vitamin|skincare|skin|sunscreen|wrinkle|dermatologist|peptide|licorice|volufiline|anti-aging|face/.test(text)) return "Skincare";
  if (/nail|manicure|haircut|haircuts|burgundy|amethyst|plaid|tweed/.test(text)) return "Fashion Tips and Tricks";
  if (/dior|louis vuitton|brand|designer|sza/.test(text)) return "Brand Spotlights";
  if (/rihanna|dakota|katy|hailey|golden globe|critics choice|red carpet|celebrity|winona|rocky|noah wyle/.test(text)) return "Neighborhood Gossip";
  if (/office|holiday|strike|shutdown|city|sidewalk|home/.test(text)) return "City Lifestyle";
  return "Trendy Outfits";
}

function imageFileName(url, slug, index) {
  const hash = crypto.createHash("sha1").update(`${url}:${index}`).digest("hex").slice(0, 10);
  return `${slug.slice(0, 46)}-${String(index + 1).padStart(2, "0")}-${hash}.avif`;
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function clearDirectory(target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(target);
  await Promise.all(entries.map((entry) => fs.rm(path.join(target, entry), { recursive: true, force: true })));
}

async function downloadAvif(url, slug, index) {
  await fs.mkdir(imageDir, { recursive: true });
  const fileName = imageFileName(url, slug, index);
  const filePath = path.join(imageDir, fileName);
  if (await pathExists(filePath)) return `assets/images/${fileName}`;

  const candidates = [
    url,
    url.replace(/\.(jpg|jpeg|png|webp)$/i, "."),
    url.endsWith(".") ? `${url}jpg` : "",
    url.endsWith(".") ? `${url}png` : "",
    url.endsWith(".") ? `${url}jpeg` : "",
  ].filter(Boolean);
  let response;
  let finalUrl = url;
  for (const candidate of [...new Set(candidates)]) {
    response = await fetch(candidate, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GlossAndCityReleasedImporter/1.0)",
        "Referer": "https://citygirldaily.cc/",
      },
    });
    if (response.ok) {
      finalUrl = candidate;
      break;
    }
  }
  if (!response.ok) throw new Error(`Image download failed ${response.status}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const converted = await sharp(bytes, { limitInputPixels: false })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .avif({ quality: 76, effort: 5 })
    .toBuffer();
  await fs.writeFile(filePath, converted);
  if (finalUrl !== url) console.warn(`Recovered image URL: ${url} -> ${finalUrl}`);
  return `assets/images/${fileName}`;
}

async function placeholderImage(category) {
  await fs.mkdir(imageDir, { recursive: true });
  const slug = slugify(category || "gloss-city");
  const fileName = `placeholder-${slug}.avif`;
  const filePath = path.join(imageDir, fileName);
  if (await pathExists(filePath)) return `assets/images/${fileName}`;
  const svg = `<svg width="1600" height="1100" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1100" fill="#f6f2ee"/>
    <rect x="90" y="90" width="1420" height="920" fill="#ffffff" stroke="#e6e3df" stroke-width="4"/>
    <text x="140" y="500" font-family="Georgia, serif" font-size="118" fill="#121212">Gloss &amp; City</text>
    <text x="145" y="620" font-family="Arial, sans-serif" font-size="42" fill="#c01544">${escapeHtml(category || "Fashion and Beauty")}</text>
  </svg>`;
  const converted = await sharp(Buffer.from(svg)).avif({ quality: 76, effort: 5 }).toBuffer();
  await fs.writeFile(filePath, converted);
  return `assets/images/${fileName}`;
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return stripMarkdown(match?.[1] || fallback.replace(/\.md$/i, ""));
}

function extractDeck(markdown) {
  const withoutTitle = markdown.replace(/^#\s+.+$/m, "");
  const paragraph = withoutTitle
    .split(/\n\s*\n/)
    .map((block) => stripMarkdown(block))
    .find((block) => block && !/^faq$/i.test(block) && block.length > 70);
  return paragraph ? `${paragraph.slice(0, 152).trimEnd()}${paragraph.length > 152 ? "..." : ""}` : "A polished Gloss & City edit on fashion, beauty, celebrity style, and modern city living.";
}

async function markdownToHtml(markdown, slug, imageMap) {
  const lines = markdown.split("\n");
  const html = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || /^-{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^#\s+/.test(line)) continue;
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      const src = imageMap.get(imageMatch[2]);
      if (src) {
        html.push(`<figure><img src="${src}" alt="${escapeHtml(imageMatch[1] || slug)}" loading="lazy" /><figcaption>${escapeHtml(imageMatch[1] || "Gloss & City image")}.</figcaption></figure>`);
      }
      continue;
    }
    if (/^###\s+/.test(line)) {
      flushParagraph();
      flushList();
      html.push(`<h3>${escapeHtml(stripMarkdown(line.replace(/^###\s+/, "")))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushParagraph();
      flushList();
      html.push(`<h2>${escapeHtml(stripMarkdown(line.replace(/^##\s+/, "")))}</h2>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

async function main() {
  if (!(await pathExists(releasedDir))) throw new Error("Missing released directory.");
  await fs.mkdir(contentDir, { recursive: true });
  await clearDirectory(imageDir);

  const files = (await fs.readdir(releasedDir))
    .filter((file) => /\.md$/i.test(file))
    .sort((a, b) => a.localeCompare(b));
  const authors = ["Mara Ellison", "Felicia Bloom", "Nina Vale", "June Hart", "Cleo Nash", "Ari Lane"];
  const articles = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const filePath = path.join(releasedDir, file);
    const stat = await fs.stat(filePath);
    const markdown = cleanText(await fs.readFile(filePath, "utf8"));
    const title = extractTitle(markdown, file);
    const slug = slugify(title);
    const imageUrls = [...new Set(Array.from(markdown.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)).map((match) => match[1]))];
    const imageMap = new Map();
    for (let imageIndex = 0; imageIndex < imageUrls.length; imageIndex += 1) {
      imageMap.set(imageUrls[imageIndex], await downloadAvif(imageUrls[imageIndex], slug, imageIndex));
    }
    const bodyHtml = await markdownToHtml(markdown, slug, imageMap);
    const category = categoryFor(title, markdown);
    const firstImage = imageMap.values().next().value || (await placeholderImage(category));
    articles.push({
      slug,
      title,
      category,
      author: authors[index % authors.length],
      date: stat.mtime.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      deck: extractDeck(markdown),
      views: stableViews(slug),
      image: [firstImage, title],
      bodyHtml,
      sourceFile: `released/${file}`,
    });
    console.log(`${index + 1}/${files.length} ${slug} (${imageUrls.length} images)`);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
  console.log(`Imported ${articles.length} released articles to ${path.relative(root, outputPath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
