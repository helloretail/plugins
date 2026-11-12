/*
 * email-tile-inspect.js — shared by newsletter-developer and triggered-email-developer
 *
 * Run it on the customer's category page: Playwright `browser_evaluate`, or the
 * Claude-in-Chrome `javascript_tool` (with the page's tabId) on the fallback.
 * It returns the computed styles of one product tile's elements plus card and
 * image info, so the email tile's design tokens come from the real tile.
 *
 * The result is the value of the final expression (REPL semantics). Convert the
 * rgb(...) colours to hex, and always cross-check against a zoomed screenshot:
 * what shares a row, italics, and whether a buy button is visible WITHOUT hover.
 *
 * Unusual class names: set CARD_SELECTOR to the operator-supplied product-card
 * selector, or adjust the finders below.
 */
(() => {
  const CARD_SELECTOR =
    'product-card, li.product-card, [class*="product-card"], [class*="productCard"], [class*="product-tile"], [class*="product"]';
  function gcs(el) {
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50),
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 55),
      font: s.fontFamily,
      size: s.fontSize,
      weight: s.fontWeight,
      fstyle: s.fontStyle,
      transform: s.textTransform,
      letter: s.letterSpacing,
      color: s.color,
      align: s.textAlign,
      lh: s.lineHeight,
      bg: s.backgroundColor,
      deco: s.textDecorationLine,
      br: s.borderRadius,
      pad: s.padding,
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  }
  // the most tile-like card: has an image and a number, and the least text
  const cards = [...document.querySelectorAll(CARD_SELECTOR)].filter((el) => {
    const t = el.innerText || '';
    return el.querySelector('img') && /\d/.test(t) && t.length < 600;
  });
  cards.sort((a, b) => a.innerText.length - b.innerText.length);
  const card = cards[0];
  if (!card) return { error: 'No product card found — adjust CARD_SELECTOR.' };
  const q = (sel) => card.querySelector(sel);
  const title = q('h2 a, h3 a, [class*="title"] a, a[class*="title"], h2, h3, [class*="title"]');
  const brand = q('[class*="vendor"], [class*="brand"], [class*="merk"], [class*="fake-label"]');
  const oldPrice = q(
    'compare-at-price, [class*="compare"], [class*="old-price"], [class*="oldPrice"], [class*="previous"], s, del'
  );
  // price, found two ways: the shortest element whose whole text is a price (never the old
  // price), and the price class
  const priceByText = [...card.querySelectorAll('*')]
    .filter((el) => !(oldPrice && (oldPrice === el || oldPrice.contains(el))))
    .filter((el) => /^[€$£]?\s?\d[\d.,\s]*(kr|KR|,-)?$/.test((el.textContent || '').trim()))
    .sort((a, b) => a.textContent.length - b.textContent.length)[0];
  const priceByClass = q(
    'sale-price, [class*="price"]:not([class*="old"]):not([class*="compare"]):not([class*="previous"])'
  );
  const unit = q('[class*="unit"], [class*="per-"]');
  const discount = q(
    'on-sale-badge, [class*="discount"], [class*="badge"], [class*="sale"]:not([class*="price"])'
  );
  const soldout = q('sold-out-badge, [class*="sold-out"], [class*="soldout"]');
  const stock = q('[class*="stock"], [class*="delivery"], [class*="voorraad"]');
  const rating = q('[class*="rating"], [class*="review"], [class*="r6rt"]');
  const label = q('[class*="label"] span, [class*="s1lb"] span, [class*="badge"]');
  const cta = q(
    '[class*="quick-add"], [class*="add-to-cart"], [class*="buy"], [class*="cart"], button[type="submit"], button[name="add"]'
  );
  const img = card.querySelector('img');
  const cleanSrc = (src) => {
    try {
      return new URL(src).origin + new URL(src).pathname;
    } catch (e) {
      return src;
    }
  };
  return {
    cardBg: getComputedStyle(card).backgroundColor,
    cardFont: getComputedStyle(card).fontFamily,
    cardW: Math.round(card.getBoundingClientRect().width),
    image: img
      ? {
          w: Math.round(img.getBoundingClientRect().width),
          h: Math.round(img.getBoundingClientRect().height),
          objectFit: getComputedStyle(img).objectFit,
          src: cleanSrc(img.src),
        }
      : null,
    brand: gcs(brand),
    title: gcs(title),
    price: gcs(priceByText || priceByClass),
    priceByClass: gcs(priceByClass),
    oldPrice: gcs(oldPrice),
    unit: gcs(unit),
    discount: gcs(discount),
    badge: gcs(discount),
    soldout: gcs(soldout),
    stock: gcs(stock),
    rating: gcs(rating),
    label: gcs(label),
    cta: gcs(cta),
    ctaVisibleWithoutHover: cta
      ? cta.getBoundingClientRect().height > 0 &&
        getComputedStyle(cta).opacity !== '0' &&
        getComputedStyle(cta).visibility !== 'hidden'
      : false,
  };
})();
