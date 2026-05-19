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
  "A polished women's fashion, beauty, celebrity style, and city lifestyle magazine for readers who like their trend coverage quick, sharp, and elegant.";
const buildDate = new Date().toISOString().slice(0, 10);

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
  const fullTitle = title === siteName ? siteName : `${title} - ${siteName}`;
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
    <link rel="stylesheet" href="${canonical.startsWith("articles/") || canonical.startsWith("categories/") ? "../" : ""}styles.css" />
    ${scripts.map((item) => `<script type="application/ld+json">${jsonScript(item)}</script>`).join("\n    ")}
  </head>
  <body>
    ${renderHeader(canonical)}
    ${body}
    ${renderFooter(canonical)}
    <script src="${canonical.startsWith("articles/") || canonical.startsWith("categories/") ? "../" : ""}script.js"></script>
  </body>
</html>
`;
}

function relPrefix(canonical) {
  return canonical.startsWith("articles/") || canonical.startsWith("categories/") ? "../" : "";
}

function assetSrc(src, prefix = "") {
  if (/^https?:\/\//i.test(src)) return src;
  return `${prefix}${src}`;
}

function renderHeader(canonical = "") {
  const prefix = relPrefix(canonical);
  return `<header class="site-header">
      <nav class="top-nav" aria-label="Primary">
        <a href="${prefix}index.html">Home</a>
        <a href="${prefix}index.html#popular">Popular</a>
        <a href="${prefix}index.html#categories">Categories</a>
        <button class="plain-button" type="button" data-search-toggle>Search</button>
        <a href="${prefix}contact.html">Login</a>
      </nav>
      <div class="brand-row">
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button>
        <a class="wordmark" href="${prefix}index.html" aria-label="${siteName} home"><strong>Gloss</strong><span>&amp; City</span></a>
        <button class="search-icon" type="button" aria-label="Search" data-search-toggle></button>
      </div>
      <nav class="mobile-nav" aria-label="Mobile" data-mobile-nav>
        <a href="${prefix}index.html">Home</a>
        <a href="${prefix}index.html#popular">Popular</a>
        <a href="${prefix}index.html#categories">Categories</a>
        <a href="${prefix}about.html">About</a>
        <a href="${prefix}contact.html">Contact</a>
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
  const prefix = relPrefix(canonical);
  return `<footer class="site-footer">
      <a class="wordmark footer-logo" href="${prefix}index.html"><strong>Gloss</strong><span>&amp; City</span></a>
      <nav>
        <a href="${prefix}about.html">About Us</a>
        <a href="${prefix}contact.html">Contact Us</a>
        <a href="${prefix}advertise.html">Advertise</a>
        <a href="${prefix}privacy-policy.html">Privacy Policy</a>
      </nav>
      <p>Independent fashion, beauty, and city lifestyle coverage. Contact: hello@${siteDomain}</p>
    </footer>`;
}

function card(article, index, compact = false, prefix = "") {
  return `<article class="story-card ${compact ? "compact" : ""}" data-title="${escapeHtml(article.title.toLowerCase())}" data-category="${escapeHtml(article.category.toLowerCase())}">
      <a class="category-pill" href="${prefix}categories/${slugify(article.category)}.html">${escapeHtml(article.category)}</a>
      <a class="image-link" href="${prefix}articles/${article.slug}.html">
        <img src="${assetSrc(article.image[0], prefix)}" alt="${escapeHtml(article.image[1])}" loading="${index < 6 ? "eager" : "lazy"}" />
      </a>
      <div class="meta-row"><span>${index < 1 ? "2 hours ago" : index === 1 ? "23 hours ago" : `${index} days ago`}</span><span>${article.views}</span></div>
      <h2><a href="${prefix}articles/${article.slug}.html">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(previewText(article.deck))}</p>
      <div class="byline"><span>${escapeHtml(article.author)}</span></div>
    </article>`;
}

function renderHome() {
  const lead = baseArticles[0];
  const secondary = baseArticles.slice(1, 5);
  const feed = baseArticles.slice(5);
  const categoryLinks = categories
    .map((name) => `<a href="categories/${slugify(name)}.html"><span>${escapeHtml(name)}</span><strong>${baseArticles.filter((article) => article.category === name).length}</strong></a>`)
    .join("");
  const popular = baseArticles
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((article, index) => `<a href="articles/${article.slug}.html"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(article.title)}</a>`)
    .join("");

  return pageShell({
    title: siteName,
    canonical: "",
    image: lead.image[0],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": absoluteUrl("#home"),
        name: siteName,
        url: siteUrl,
        description: siteDescription,
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
          <a class="category-pill" href="categories/${slugify(lead.category)}.html">${escapeHtml(lead.category)}</a>
          <a href="articles/${lead.slug}.html"><img src="${assetSrc(lead.image[0])}" alt="${escapeHtml(lead.image[1])}" /></a>
          <div class="meta-row"><span>2 hours ago</span><span>${lead.views}</span></div>
          <h1><a href="articles/${lead.slug}.html">${escapeHtml(lead.title)}</a></h1>
          <p>${escapeHtml(previewText(lead.deck, 112))}</p>
          <div class="byline"><span>${escapeHtml(lead.author)}</span></div>
        </article>
        <aside class="side-stack">${secondary.map((article, index) => card(article, index + 1, true)).join("")}</aside>
      </section>

      <section class="content-shell">
        <div>
          <div class="section-title"><h2>Latest</h2><span>Fresh stories</span></div>
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

function renderArticle(article, index) {
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
        wordCount: articleBody(article).join(" ").split(/\s+/).length,
      },
    ],
    body: `<main class="article-layout">
      <article class="article-page">
        <a class="category-pill" href="../categories/${slugify(article.category)}.html">${escapeHtml(article.category)}</a>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="dek">${escapeHtml(article.deck)}</p>
        <div class="article-meta"><span>By ${escapeHtml(article.author)}</span><span>${escapeHtml(article.date)}</span><span>${article.views} views</span></div>
        <figure><img src="${assetSrc(article.image[0], "../")}" alt="${escapeHtml(article.image[1])}" /><figcaption>${escapeHtml(article.image[1])}.</figcaption></figure>
        <div class="article-content">${articleBody(article).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      </article>
      <aside class="article-rail">
        <h2>Related</h2>
        ${related.map((item) => `<a href="${item.slug}.html">${escapeHtml(item.title)}</a>`).join("")}
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
      <div class="story-grid">${articles.map((article, index) => card(article, index, false, "../")).join("")}</div>
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
      "<p>Gloss &amp; City is a modern editorial magazine for fashion, beauty, celebrity style, and city living.</p><p>The site is built as a static publication with fast pages, strong internal linking, and a visual feed modeled on contemporary women's media.</p>",
      "Learn about Gloss & City, a fashion, beauty, celebrity style, and city lifestyle magazine for style-conscious readers."
    )
  );
  await writeFile(
    "contact.html",
    simplePage(
      "Contact",
      `<p>For editorial notes, partnerships, corrections, and advertising, email <a href="mailto:hello@${siteDomain}">hello@${siteDomain}</a>.</p>`,
      "Contact Gloss & City for editorial notes, corrections, advertising, brand partnerships, and reader feedback."
    )
  );
  await writeFile(
    "advertise.html",
    simplePage(
      "Advertise",
      `<p>Gloss &amp; City works with fashion, beauty, wellness, lifestyle, and culture brands that want to reach style-conscious readers in the United States and Europe.</p><p>For sponsored placements, display campaigns, product features, and editorial partnerships, contact <a href="mailto:hello@${siteDomain}">hello@${siteDomain}</a>.</p>`,
      "Advertise with Gloss & City to reach fashion, beauty, wellness, lifestyle, and culture readers in the United States and Europe."
    )
  );
  await writeFile(
    "privacy-policy.html",
    simplePage(
      "Privacy Policy",
      "<p>This publication does not require account registration. Standard hosting logs and voluntary email messages may be used to operate the site and respond to readers.</p>",
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
