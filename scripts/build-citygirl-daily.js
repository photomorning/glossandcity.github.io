const fs = require("fs/promises");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = root;
const articleDir = path.join(outDir, "articles");
const categoryDir = path.join(outDir, "categories");
const siteName = "Gloss & City";
const siteDomain = "glossandcity.com";
const siteUrl = `https://${siteDomain}/`;
const siteDescription =
  "Gloss & City covers fashion, beauty, celebrity style, skincare, and modern city living with polished trend reporting for women in the U.S. and Europe.";
const homeTitle = "Gloss & City | Fashion, Beauty, Celebrity Style and City Living";
const homeDescription =
  "Discover polished fashion trends, beauty ideas, celebrity style, skincare notes, nail inspiration, and city lifestyle stories for modern women.";
const pageTitleSuffix = "Fashion, Beauty and City Style Magazine";
const buildDate = new Date().toISOString().slice(0, 10);
const assetVersion = formatVersion(new Date());
const navCategoryLabels = {
  "Fashion Tips and Tricks": "Style",
  "Neighborhood Gossip": "Buzz",
  "City Lifestyle": "City",
  "Brand Spotlights": "Brands",
  Skincare: "Beauty",
};

function formatVersion(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
}

let categories = [
  "City Lifestyle",
  "Heard It In The Streets",
  "Uncovered",
  "Fashion Tips and Tricks",
  "Fashion Designer",
  "Brand Spotlights",
  "Trendy Outfits",
  "Skincare",
];

const imagePool = [
  ["https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=82", "Woman carrying shopping bags on a city street"],
  ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=82", "Editorial fashion portrait in neutral styling"],
  ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=82", "Street style model in a dramatic outfit"],
  ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=82", "Beauty products arranged on a vanity"],
  ["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=82", "Close editorial portrait with clean makeup"],
  ["https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=82", "City fashion look with sunglasses"],
  ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=82", "Woman in a tailored coat near a window"],
  ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=82", "Minimal beauty portrait with soft light"],
  ["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=82", "Fashion model posing outdoors"],
  ["https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1200&q=82", "Wardrobe rack with neutral clothing"],
  ["https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=82", "Makeup brushes and cosmetics"],
  ["https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=82", "Curated clothing rack in a boutique"],
];

function stableViews(slug) {
  let hash = 0;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return 100 + (hash % 201);
}

let baseArticles = [
  ["fashion-strike-city-style", "When Fashion Pauses, Street Style Gets More Personal", "City Lifestyle", "Mara Ellison", "May 19, 2026", "Boutiques, stylists, and shoppers are treating the city sidewalk as a quieter kind of runway this week."],
  ["rihanna-maternity-dior-moment", "The Maternity Look Everyone Will Reference All Summer", "Heard It In The Streets", "Felicia Bloom", "May 18, 2026", "A sculptural silhouette, a relaxed smile, and one perfectly placed accessory turned a formal appearance into a mood board."],
  ["dakota-johnson-soft-tailoring", "Soft Tailoring Is Replacing the Going-Out Dress", "Uncovered", "Nina Vale", "May 17, 2026", "The new evening formula is slouchier, smarter, and far easier to wear after midnight."],
  ["midnight-blue-nails", "Midnight Blue Nails Are the Cooler Answer to Burgundy", "Fashion Tips and Tricks", "June Hart", "May 16, 2026", "Deep navy polish has the same drama as wine red, but it feels cleaner, sharper, and unexpectedly expensive."],
  ["topical-filler-skincare", "The Truth About the Viral Topical Filler Trend", "Fashion Designer", "Ari Lane", "May 15, 2026", "Beauty TikTok loves a miracle texture, but plumping claims deserve a closer look before they reach your bathroom shelf."],
  ["valentines-nails-grown-up", "Romantic Nails Are Getting a Grown-Up Rewrite", "Fashion Tips and Tricks", "June Hart", "May 14, 2026", "Tiny hearts have not disappeared, but the best versions now look delicate, glossy, and deliberate."],
  ["licorice-extract-glow", "Licorice Extract Might Be Your Quiet Glow Ingredient", "Brand Spotlights", "Cleo Nash", "May 13, 2026", "The skincare ingredient has a calm reputation, but its brightening potential is why formulators keep returning to it."],
  ["new-romantics-couture", "The New Romantics Have Arrived at Couture Week", "Trendy Outfits", "Mara Ellison", "May 12, 2026", "Soft volume, careful shine, and dreamier proportions are changing the temperature of high fashion."],
  ["london-haircuts-winter", "The Three Haircuts London Stylists Keep Recommending", "Fashion Tips and Tricks", "Nina Vale", "May 11, 2026", "The brief is simple: movement, polish, and just enough shape to make air-drying feel intentional."],
  ["first-lady-inspired-style", "The Curious Return of First Lady Inspired Style", "Fashion Tips and Tricks", "Mara Ellison", "May 10, 2026", "Structured coats, careful gloves, and ceremonial color are quietly entering celebrity dressing again."],
  ["smoky-amethyst-manicure", "Smoky Amethyst Is the Manicure Shade With Main Character Energy", "Fashion Tips and Tricks", "June Hart", "May 9, 2026", "Purple has softened into something moodier, glassier, and easier to wear with winter neutrals."],
  ["best-dressed-classic-week", "The Best-Dressed Stars Proved Classic Style Still Wins", "City Lifestyle", "Felicia Bloom", "May 8, 2026", "The strongest looks this week did not shout. They relied on proportion, polish, and one memorable detail."],
  ["office-return-outfits", "Back-to-Office Looks That Do Not Feel Like a Costume", "City Lifestyle", "Ari Lane", "May 7, 2026", "A softer work wardrobe is emerging: fluid trousers, fine knits, and shoes that can survive a full commute."],
  ["face-era-beauty", "What Era Does Your Face Belong To?", "Skincare", "Cleo Nash", "May 6, 2026", "Beauty trends keep reviving old decades, but your features may already know which references make sense."],
  ["award-season-silver", "Silver Dressing Is Taking Over Early Award Season", "Heard It In The Streets", "Felicia Bloom", "May 5, 2026", "Metallic gowns and liquid accessories are making red carpets feel sharper than the usual champagne sparkle."],
  ["neck-wrinkle-routine", "How Editors Think About Neck Care Now", "Skincare", "Cleo Nash", "May 4, 2026", "The conversation has moved beyond panic buying: sunscreen, retinoids, and consistency are doing the real work."],
  ["cobalt-blue-celebrity-style", "Celebrities Are Falling Hard for Cobalt Blue", "Brand Spotlights", "Nina Vale", "May 3, 2026", "The color reads energetic without feeling neon, which is exactly why stylists are reaching for it."],
  ["red-carpet-method-dressing", "Which Movie Tours Are Ready for Full Method Dressing?", "Uncovered", "Mara Ellison", "May 2, 2026", "The best promotional wardrobes now build a whole visual language around a film before opening weekend."],
  ["winter-sunscreen", "Winter Sunscreen Is the Beauty Rule Editors Keep", "Skincare", "Cleo Nash", "May 1, 2026", "Cold weather changes texture preferences, but it does not cancel UV exposure."],
  ["holiday-code-switching-style", "Mastering Fashion Code-Switching at Home", "Brand Spotlights", "Ari Lane", "April 30, 2026", "Family dinners, old friends, and hometown errands all ask for a slightly different version of your closet."],
  ["preppy-plaid-nails", "Preppy Plaids Are the Tiny Nail Trend Worth Trying", "Fashion Tips and Tricks", "June Hart", "April 29, 2026", "Tweed textures and school-uniform checks look surprisingly chic when scaled down to a manicure."],
  ["oversized-sunglasses-return", "Oversized Sunglasses Are Back in Their Shield Era", "Fashion Tips and Tricks", "Nina Vale", "April 28, 2026", "The shape is less beach glamour now and more urban armor, especially with sleek hair and spare jewelry."],
  ["quiet-luxury-denim", "The New Denim Formula Is Clean, Dark, and Unfussy", "Trendy Outfits", "Ari Lane", "April 27, 2026", "Indigo washes, long hems, and crisp shirting are making denim feel dressed again."],
  ["city-bag-edit", "The City Bag Edit: What Actually Fits a Long Day", "City Lifestyle", "Mara Ellison", "April 26, 2026", "The best everyday bag is not the biggest one. It is the one with the right compartments and a little restraint."],
].map((item, index) => ({
  slug: item[0],
  title: item[1],
  category: item[2],
  author: item[3],
  date: item[4],
  deck: item[5],
  views: stableViews(item[0]),
  image: imagePool[index % imagePool.length],
}));

async function loadContentArticles() {
  const contentPath = path.join(root, "content", "articles.json");
  try {
    const imported = JSON.parse(await fs.readFile(contentPath, "utf8"));
    if (Array.isArray(imported) && imported.length) {
      baseArticles = imported.map((article) => ({
        ...article,
        views: article.views || stableViews(article.slug),
      }));
      categories = [...new Set(baseArticles.map((article) => article.category))];
    }
  } catch {
    // Use bundled fallback articles when no imported content exists.
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function previewText(value, maxLength = 96) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function stripText(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function seoDescription(value = siteDescription) {
  return previewText(stripText(value) || siteDescription, 155);
}

function absoluteUrl(relativePath = "") {
  return new URL(relativePath.replace(/\\/g, "/").replace(/^\/+/, ""), siteUrl).href;
}

function absoluteImage(src = "") {
  if (/^https?:\/\//i.test(src)) return src;
  return absoluteUrl(src);
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function jsonScript(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("#organization"),
    name: siteName,
    url: siteUrl,
    email: `hello@${siteDomain}`,
    publishingPrinciples: absoluteUrl("privacy-policy.html"),
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("#website"),
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    publisher: { "@id": absoluteUrl("#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

function pageShell({ title, description = siteDescription, body, canonical = "", image = "", type = "website", schema = [], breadcrumbs = [] }) {
  const fullTitle = canonical === "" ? homeTitle : `${title} - ${siteName} | ${pageTitleSuffix}`;
  const metaDescription = seoDescription(description);
  const canonicalUrl = absoluteUrl(canonical);
  const imageUrl = image ? absoluteImage(image) : absoluteImage(baseArticles[0]?.image?.[0] || "");
  const scripts = [organizationSchema(), websiteSchema(), ...schema];
  if (breadcrumbs.length) scripts.push(breadcrumbSchema(breadcrumbs));
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="author" content="${escapeHtml(siteName)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <link rel="stylesheet" href="${absoluteUrl(`styles.css?v=${assetVersion}`)}" />
    ${scripts.map((item) => `<script type="application/ld+json">${jsonScript(item)}</script>`).join("\n    ")}
  </head>
  <body>
    ${renderHeader(canonical)}
    ${body}
    ${renderFooter(canonical)}
    <script src="${absoluteUrl(`script.js?v=${assetVersion}`)}"></script>
  </body>
</html>
`;
}

function relPrefix(canonical) {
  return canonical.startsWith("articles/") || canonical.startsWith("categories/") ? "../" : "";
}

function assetSrc(src, prefix = "") {
  if (/^https?:\/\//i.test(src)) return src;
  return absoluteUrl(src);
}

function renderHeader(canonical = "") {
  const categoryNav = categories
    .map((name) => `<a href="${absoluteUrl(`categories/${slugify(name)}.html`)}">${escapeHtml(navCategoryLabels[name] || name)}</a>`)
    .join("");
  return `<header class="site-header">
      <nav class="top-nav" aria-label="Primary">
        <a href="/">Home</a>
        <a href="${absoluteUrl("#latest")}">Latest</a>
        ${categoryNav}
        <button class="plain-button" type="button" data-search-toggle>Search</button>
        <a href="${absoluteUrl("contact.html")}">Login</a>
      </nav>
      <div class="brand-row">
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button>
        <a class="wordmark" href="/" aria-label="${siteName} home"><strong>Gloss</strong><span>&amp; City</span></a>
        <button class="search-icon" type="button" aria-label="Search" data-search-toggle></button>
      </div>
      <nav class="mobile-nav" aria-label="Mobile" data-mobile-nav>
        <a href="/">Home</a>
        <a href="${absoluteUrl("#latest")}">Latest</a>
        ${categoryNav}
        <a href="${absoluteUrl("about.html")}">About</a>
        <a href="${absoluteUrl("contact.html")}">Contact</a>
      </nav>
      <div class="search-panel" data-search-panel>
        <form data-search-form>
          <label for="site-search">Search the latest stories</label>
          <div><input id="site-search" name="q" type="search" placeholder="Try nails, denim, skincare..." autocomplete="off" /><button type="submit">Search</button></div>
        </form>
      </div>
    </header>`;
}

function renderFooter(canonical = "") {
  return `<footer class="site-footer">
      <a class="wordmark footer-logo" href="/"><strong>Gloss</strong><span>&amp; City</span></a>
      <nav>
        <a href="${absoluteUrl("about.html")}">About Us</a>
        <a href="${absoluteUrl("contact.html")}">Contact Us</a>
        <a href="${absoluteUrl("advertise.html")}">Advertise</a>
        <a href="${absoluteUrl("privacy-policy.html")}">Privacy Policy</a>
      </nav>
      <p>Independent fashion, beauty, and city lifestyle coverage. Contact: hello@${siteDomain}</p>
    </footer>`;
}

function card(article, index, compact = false, prefix = "") {
  return `<article class="story-card ${compact ? "compact" : ""}" data-title="${escapeHtml(article.title.toLowerCase())}" data-category="${escapeHtml(article.category.toLowerCase())}">
      <a class="category-pill" href="${absoluteUrl(`categories/${slugify(article.category)}.html`)}">${escapeHtml(article.category)}</a>
      <a class="image-link" href="${absoluteUrl(`articles/${article.slug}.html`)}">
        <img src="${assetSrc(article.image[0], prefix)}" alt="${escapeHtml(article.image[1])}" loading="${index < 6 ? "eager" : "lazy"}" />
      </a>
      <div class="meta-row"><span>${index < 1 ? "2 hours ago" : index === 1 ? "23 hours ago" : `${index} days ago`}</span><span>${article.views}</span></div>
      <h2><a href="${absoluteUrl(`articles/${article.slug}.html`)}">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(previewText(article.deck))}</p>
      <div class="byline"><span>${escapeHtml(article.author)}</span></div>
    </article>`;
}

function renderHome() {
  const lead = baseArticles[0];
  const secondary = baseArticles.slice(1, 5);
  const feed = baseArticles.slice(5, 29);
  const leadSummary =
    "Your daily edit of polished fashion, beauty, celebrity style, skincare, nail ideas, and modern city living.";
  const categoryLinks = categories
    .map((name) => `<a href="${absoluteUrl(`categories/${slugify(name)}.html`)}"><span>${escapeHtml(name)}</span><strong>${baseArticles.filter((article) => article.category === name).length}</strong></a>`)
    .join("");
  const popular = baseArticles
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((article, index) => `<a href="${absoluteUrl(`articles/${article.slug}.html`)}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(article.title)}</a>`)
    .join("");

  return pageShell({
    title: siteName,
    description: homeDescription,
    canonical: "",
    image: lead.image[0],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": absoluteUrl("#home"),
        name: siteName,
        url: siteUrl,
        description: homeDescription,
        isPartOf: { "@id": absoluteUrl("#website") },
        publisher: { "@id": absoluteUrl("#organization") },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: baseArticles.slice(0, 12).map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`articles/${article.slug}.html`),
            name: article.title,
          })),
        },
      },
    ],
    body: `<main>
      <section class="lead-grid">
        <article class="lead-story">
          <a class="category-pill" href="${absoluteUrl(`categories/${slugify(lead.category)}.html`)}">${escapeHtml(lead.category)}</a>
          <a href="${absoluteUrl(`articles/${lead.slug}.html`)}"><img src="${assetSrc(lead.image[0])}" alt="${escapeHtml(lead.image[1])}" /></a>
          <div class="meta-row"><span>2 hours ago</span><span>${lead.views}</span></div>
          <h1><a href="${absoluteUrl(`articles/${lead.slug}.html`)}">${escapeHtml(lead.title)}</a></h1>
          <p>${escapeHtml(leadSummary)}</p>
          <div class="byline"><span>${escapeHtml(lead.author)}</span></div>
        </article>
        <aside class="side-stack">${secondary.map((article, index) => card(article, index + 1, true)).join("")}</aside>
      </section>

      <section class="content-shell">
        <div>
          <div class="section-title" id="latest"><h2>Latest</h2><span>Fresh stories</span></div>
          <div class="story-grid" data-story-grid>${feed.map((article, index) => card(article, index + 5)).join("")}</div>
          <nav class="pagination" aria-label="Pagination"><span>Previous</span><strong>1</strong><a href="#">2</a><a href="#">3</a><a href="#">4</a><a href="#">5</a><span>...</span><a href="#">17</a><a href="#">Next</a></nav>
        </div>
        <aside class="rail">
          <section id="popular"><h2>Popular</h2>${popular}</section>
          <section id="categories"><h2>Categories</h2><div class="category-list">${categoryLinks}</div></section>
        </aside>
      </section>
    </main>`,
  });
}

function articleBody(article) {
  if (article.bodyHtml) return null;
  if (Array.isArray(article.body) && article.body.length) return article.body;
  const subject = article.title.replace(/[:?].*$/, "");
  return [
    `${subject} is the kind of fashion story that starts as a small styling note and quickly becomes a full conversation. It touches what women are wearing to work, what they are saving on mood boards, and what feels current without looking over-rehearsed.`,
    `The appeal is its flexibility. A city reader can translate the idea into a polished commute look, a weekend dinner outfit, or a beauty detail that makes an old wardrobe feel freshly edited. That is why the trend has moved so quickly from celebrity images to everyday closets.`,
    `What matters most is proportion. The strongest version keeps one focal point and lets everything else support it. If the color is bold, the silhouette can stay clean. If the shape is dramatic, hair and makeup can become softer. The result feels intentional instead of crowded.`,
    `${article.deck} The detail may be small, but it changes how the full look reads. Good styling has always worked that way: one smart adjustment can make familiar pieces feel new again.`,
    `For readers trying the idea now, start with the pieces already doing the most work in your wardrobe. A reliable coat, a black trouser, a white shirt, a soft knit, or a glossy manicure can carry more than one trend when the finish is right.`,
    `The broader mood is less about chasing novelty and more about editing with confidence. Women are asking for clothes and beauty routines that photograph well, move through real days, and still leave room for personality.`,
    `That is why this story belongs in the current City Girl Daily rotation. It is pretty, practical, and just specific enough to make tomorrow morning's getting-dressed decision easier.`,
  ];
}

function renderArticleContent(article) {
  if (article.bodyHtml) {
    return article.bodyHtml.replace(/src="assets\//g, `src="${absoluteUrl("assets/")}`);
  }
  return articleBody(article).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function renderArticle(article, index) {
  const articleText = article.bodyHtml ? stripText(article.bodyHtml) : articleBody(article).join(" ");
  const related = baseArticles
    .filter((item) => item.slug !== article.slug)
    .slice(index, index + 8)
    .concat(baseArticles.slice(0, 8))
    .slice(0, 8);
  return pageShell({
    title: article.title,
    description: article.deck,
    canonical: `articles/${article.slug}.html`,
    image: article.image[0],
    type: "article",
    breadcrumbs: [
      { name: "Home", url: "" },
      { name: article.category, url: `categories/${slugify(article.category)}.html` },
      { name: article.title, url: `articles/${article.slug}.html` },
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": absoluteUrl(`articles/${article.slug}.html#article`),
        mainEntityOfPage: absoluteUrl(`articles/${article.slug}.html`),
        headline: article.title,
        description: seoDescription(article.deck),
        image: [absoluteImage(article.image[0])],
        datePublished: isoDate(article.date),
        dateModified: isoDate(article.date),
        author: {
          "@type": "Person",
          name: article.author,
        },
        publisher: { "@id": absoluteUrl("#organization") },
        articleSection: article.category,
        wordCount: articleText.split(/\s+/).filter(Boolean).length,
      },
    ],
    body: `<main class="article-layout">
      <article class="article-page">
        <a class="category-pill" href="${absoluteUrl(`categories/${slugify(article.category)}.html`)}">${escapeHtml(article.category)}</a>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="dek">${escapeHtml(article.deck)}</p>
        <div class="article-meta"><span>By ${escapeHtml(article.author)}</span><span>${escapeHtml(article.date)}</span><span>${article.views} views</span></div>
        <figure><img src="${assetSrc(article.image[0], "../")}" alt="${escapeHtml(article.image[1])}" /><figcaption>${escapeHtml(article.image[1])}.</figcaption></figure>
        <div class="article-content">${renderArticleContent(article)}</div>
      </article>
      <aside class="article-rail">
        <h2>Related</h2>
        ${related.map((item) => `<a href="${absoluteUrl(`articles/${item.slug}.html`)}">${escapeHtml(item.title)}</a>`).join("")}
      </aside>
    </main>`,
  });
}

function renderCategory(name) {
  const articles = baseArticles.filter((article) => article.category === name);
  return pageShell({
    title: name,
    description: `Read the latest ${name.toLowerCase()} stories from ${siteName}, including fashion, beauty, celebrity style, and city lifestyle coverage.`,
    canonical: `categories/${slugify(name)}.html`,
    image: articles[0]?.image?.[0] || baseArticles[0]?.image?.[0],
    breadcrumbs: [
      { name: "Home", url: "" },
      { name, url: `categories/${slugify(name)}.html` },
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": absoluteUrl(`categories/${slugify(name)}.html#collection`),
        name: `${name} - ${siteName}`,
        url: absoluteUrl(`categories/${slugify(name)}.html`),
        description: `Latest ${name.toLowerCase()} stories from ${siteName}.`,
        isPartOf: { "@id": absoluteUrl("#website") },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: articles.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`articles/${article.slug}.html`),
            name: article.title,
          })),
        },
      },
    ],
    body: `<main class="category-page">
      <header><span>Category</span><h1>${escapeHtml(name)}</h1></header>
      <div class="story-grid">${articles.map((article, index) => card(article, index, false, "")).join("")}</div>
    </main>`,
  });
}

function simplePage(title, body, description) {
  const file = `${slugify(title)}.html`.replace("privacy-policy", "privacy-policy");
  return pageShell({
    title,
    description: description || stripText(body),
    canonical: file,
    breadcrumbs: [
      { name: "Home", url: "" },
      { name: title, url: file },
    ],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": absoluteUrl(`${file}#webpage`),
        name: `${title} - ${siteName}`,
        url: absoluteUrl(file),
        description: seoDescription(description || body),
        isPartOf: { "@id": absoluteUrl("#website") },
      },
    ],
    body: `<main class="simple-page"><h1>${escapeHtml(title)}</h1>${body}</main>`,
  });
}

const aboutPageBody = `
<p>Gloss &amp; City is an independent digital magazine covering fashion, beauty, celebrity style, skincare, nails, hair, red carpet moments, and the rituals of modern city living.</p>
<p>Our point of view is polished but practical. We follow the runway, the front row, the beauty counter, the street style photograph, and the small styling decisions that make everyday dressing feel more intentional.</p>
<h2>What We Cover</h2>
<p>We publish trend reports, beauty explainers, celebrity style analysis, shopping-adjacent inspiration, and editorial guides designed for readers in the United States, Europe, and other style-conscious cities around the world.</p>
<p>Gloss &amp; City is not built around noise. We care about context, wearability, visual taste, and whether a trend can actually live outside a press photo or a social media feed.</p>
<h2>Editorial Standards</h2>
<p>Our articles are edited for clarity, usefulness, and reader experience. When we cover beauty or skincare, the goal is to explain the trend in plain language and encourage thoughtful decisions rather than panic buying.</p>
<p>For corrections, rights questions, or editorial notes, please contact us through the Contact page.</p>`;

const contactPageBody = `
<p>For editorial notes, corrections, partnerships, advertising, and general inquiries, contact Gloss &amp; City by email.</p>
<p><strong>Email:</strong> <a href="mailto:hello@${siteDomain}">hello@${siteDomain}</a></p>
<h2>Editorial and Corrections</h2>
<p>If you notice an error, outdated detail, broken link, incorrect attribution, or image concern, include the page URL and a short explanation so we can review it quickly.</p>
<h2>Partnerships and Advertising</h2>
<p>For sponsored content, display placements, product launches, affiliate collaborations, and brand partnerships, include your brand name, campaign timeline, target region, and preferred placement type.</p>
<h2>Response Time</h2>
<p>We review messages regularly. Time-sensitive corrections and rights requests are prioritized over general pitches.</p>`;

const advertisePageBody = `
<p>Gloss &amp; City works with fashion, beauty, skincare, wellness, lifestyle, and culture brands that want to reach readers who care about style, taste, and modern urban living.</p>
<h2>Audience</h2>
<p>Our readers come for polished trend coverage, celebrity style context, beauty guidance, nail and hair inspiration, and practical ideas they can bring into their own wardrobes and routines.</p>
<h2>Opportunities</h2>
<p>Available partnership formats may include sponsored editorial features, product spotlights, display placements, seasonal trend packages, newsletter-style integrations, and custom brand storytelling.</p>
<h2>Brand Fit</h2>
<p>We are best suited for brands in fashion, beauty, skincare, fragrance, wellness, accessories, lifestyle, travel, and culture. We prioritize partnerships that feel useful to readers and aligned with the visual tone of Gloss &amp; City.</p>
<h2>Contact</h2>
<p>To discuss availability, rates, and campaign ideas, email <a href="mailto:hello@${siteDomain}">hello@${siteDomain}</a> with your brand name, campaign goals, target market, timeline, and preferred placement.</p>`;

const privacyPageBody = `
<p>This Privacy Policy explains how Gloss &amp; City handles basic information connected with operating this website.</p>
<h2>Information We May Receive</h2>
<p>When you visit the site, standard hosting logs may collect technical information such as browser type, device information, referring pages, approximate location data, and pages viewed. If you email us, we receive the information you choose to include in that message.</p>
<h2>How Information Is Used</h2>
<p>Information may be used to operate the website, understand site performance, respond to reader messages, review corrections, evaluate advertising inquiries, and maintain site security.</p>
<h2>Cookies and Third-Party Services</h2>
<p>The site may use hosting, analytics, advertising, affiliate, or embedded media services that rely on cookies or similar technologies. These third parties may process data according to their own privacy policies.</p>
<h2>Email Communications</h2>
<p>If you contact us by email, we may use your email address to respond to your request. We do not sell personal email correspondence.</p>
<h2>External Links</h2>
<p>Gloss &amp; City may link to third-party websites. We are not responsible for the privacy practices, content, or policies of external sites.</p>
<h2>Updates</h2>
<p>This policy may be updated as the site develops. Continued use of the website means you accept the current version of this policy.</p>
<h2>Contact</h2>
<p>For privacy-related questions, contact <a href="mailto:hello@${siteDomain}">hello@${siteDomain}</a>.</p>`;

async function writeFile(name, content) {
  await fs.writeFile(path.join(outDir, name), content, "utf8");
}

async function main() {
  await loadContentArticles();
  await fs.mkdir(articleDir, { recursive: true });
  await fs.mkdir(categoryDir, { recursive: true });
  await Promise.all((await fs.readdir(articleDir)).filter((file) => file.endsWith(".html")).map((file) => fs.rm(path.join(articleDir, file))));
  await Promise.all((await fs.readdir(categoryDir)).filter((file) => file.endsWith(".html")).map((file) => fs.rm(path.join(categoryDir, file))));

  await writeFile("index.html", renderHome());
  await writeFile(
    "about.html",
    simplePage(
      "About",
      aboutPageBody,
      "Learn about Gloss & City, a fashion, beauty, celebrity style, and city lifestyle magazine for style-conscious readers."
    )
  );
  await writeFile(
    "contact.html",
    simplePage(
      "Contact",
      contactPageBody,
      "Contact Gloss & City for editorial notes, corrections, advertising, brand partnerships, and reader feedback."
    )
  );
  await writeFile(
    "advertise.html",
    simplePage(
      "Advertise",
      advertisePageBody,
      "Advertise with Gloss & City to reach fashion, beauty, wellness, lifestyle, and culture readers in the United States and Europe."
    )
  );
  await writeFile(
    "privacy-policy.html",
    simplePage(
      "Privacy Policy",
      privacyPageBody,
      "Read the Gloss & City privacy policy, including information about hosting logs, voluntary emails, and reader communications."
    )
  );

  await Promise.all(baseArticles.map((article, index) => fs.writeFile(path.join(articleDir, `${article.slug}.html`), renderArticle(article, index), "utf8")));
  await Promise.all(categories.map((name) => fs.writeFile(path.join(categoryDir, `${slugify(name)}.html`), renderCategory(name), "utf8")));
  await writeFile("articles.json", JSON.stringify(baseArticles.map(({ image, ...article }) => article), null, 2));

  const sitemapUrls = [
    { loc: "", lastmod: buildDate, changefreq: "daily", priority: "1.0" },
    { loc: "about.html", lastmod: buildDate, changefreq: "monthly", priority: "0.6" },
    { loc: "contact.html", lastmod: buildDate, changefreq: "monthly", priority: "0.5" },
    { loc: "advertise.html", lastmod: buildDate, changefreq: "monthly", priority: "0.5" },
    { loc: "privacy-policy.html", lastmod: buildDate, changefreq: "yearly", priority: "0.3" },
    ...baseArticles.map((article) => ({
      loc: `articles/${article.slug}.html`,
      lastmod: isoDate(article.date).slice(0, 10),
      changefreq: "monthly",
      priority: "0.8",
    })),
    ...categories.map((name) => ({
      loc: `categories/${slugify(name)}.html`,
      lastmod: buildDate,
      changefreq: "weekly",
      priority: "0.7",
    })),
  ];
  await writeFile(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
      .map(
        (item) => `  <url>
    <loc>${absoluteUrl(item.loc)}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
      )
      .join("\n")}\n</urlset>\n`
  );
  await writeFile("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap.xml", siteUrl).href}\n`);
  await writeFile("CNAME", siteDomain);

  console.log(`Built ${siteName}: ${baseArticles.length} articles, ${categories.length} categories.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
