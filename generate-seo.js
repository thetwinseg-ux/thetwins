// generate-seo.js — يجيب المنتجات من Supabase ويعمل static HTML للـ SEO
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const SUPABASE_URL = "https://bgijvwneyxrgrugxeyor.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_seuq4SYX6RCWFRSBcEDchQ_SO7XHdPB";
const SITE_URL = "https://thetwinscoffee.com";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/product-images`;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getImageUrl(img) {
  if (!img) return `${SITE_URL}/logo.png`;
  if (img.startsWith("http")) return img;
  const clean = img.replace(/^uploads\//, "");
  return `${STORAGE_BASE}/${clean}`;
}

async function main() {
  console.log("Fetching products from Supabase...");
  const { data: products, error } = await supabase
    .from("products")
    .select("*, product_sizes(*)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) { console.error("ERROR:", error.message); process.exit(1); }
  console.log(`Got ${products.length} products`);

  // Best OG image
  let bestOgImage = `${SITE_URL}/logo.png`;
  for (const p of products) {
    const imgs = Array.isArray(p.images) ? p.images : [];
    if (imgs.length > 0) { bestOgImage = getImageUrl(imgs[0]); break; }
  }

  // Schema.org ItemList
  const itemListElements = products.map((p, i) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const imgUrl = getImageUrl(imgs[0] || null);
    const minPrice = p.product_sizes && p.product_sizes.length > 0
      ? Math.min(...p.product_sizes.map(s => s.price)) : 0;
    return {
      "@type": "ListItem", "position": i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "description": (p.description || "Premium hand-roasted 100% Arabica coffee from The Twins Coffee Egypt.").substring(0, 200),
        "image": imgUrl,
        "url": `${SITE_URL}/product-detail.html?id=${p.id}`,
        "brand": { "@type": "Brand", "name": "The Twins Coffee" },
        "offers": { "@type": "Offer", "priceCurrency": "EGP", "price": minPrice, "availability": "https://schema.org/InStock", "seller": { "@type": "Organization", "name": "The Twins Coffee" } }
      }
    };
  });

  const schema = {
    "@context": "https://schema.org", "@type": "ItemList",
    "name": "The Twins Coffee Products", "url": `${SITE_URL}/products.html`,
    "numberOfItems": products.length, "itemListElement": itemListElements
  };

  // Noscript static HTML
  const cards = products.map(p => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const imgUrl = getImageUrl(imgs[0] || null);
    const minPrice = p.product_sizes && p.product_sizes.length > 0
      ? Math.min(...p.product_sizes.map(s => s.price)) : 0;
    const desc = (p.description || "").substring(0, 160);
    return `<div itemscope itemtype="https://schema.org/Product" style="display:inline-block;margin:8px;vertical-align:top;width:200px">
  <a href="${SITE_URL}/product-detail.html?id=${p.id}" itemprop="url">
    <img src="${imgUrl}" alt="${p.name}" itemprop="image" width="200" height="200" loading="lazy" style="width:200px;height:200px;object-fit:cover"/>
  </a>
  <h3 itemprop="name" style="font-size:14px;margin:4px 0">${p.name}</h3>
  <p itemprop="description" style="font-size:12px;color:#666">${desc}</p>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <meta itemprop="priceCurrency" content="EGP"/>
    <meta itemprop="price" content="${minPrice}"/>
    <meta itemprop="availability" content="https://schema.org/InStock"/>
    <strong>${minPrice > 0 ? minPrice + " EGP" : ""}</strong>
  </div>
  <meta itemprop="brand" content="The Twins Coffee"/>
</div>`;
  }).join("\n");

  const noscript = `<noscript>\n<section id="seo-static-products" style="padding:2rem">\n<h2>Our Products</h2>\n${cards}\n</section>\n</noscript>`;

  fs.writeFileSync("seo-noscript.html", noscript, "utf8");
  fs.writeFileSync("seo-schema.json", JSON.stringify(schema, null, 2), "utf8");
  fs.writeFileSync("seo-summary.json", JSON.stringify({ bestOgImage, totalProducts: products.length, products: products.map(p => ({ id: p.id, name: p.name, image: getImageUrl((Array.isArray(p.images) ? p.images : [])[0] || null) })) }, null, 2), "utf8");

  console.log("bestOgImage:", bestOgImage);
  console.log("Done! Files: seo-noscript.html, seo-schema.json, seo-summary.json");
}

main().catch(console.error);
