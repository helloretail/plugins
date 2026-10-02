### Added

- `feed-setup` reads the platform plugin's info endpoint before mapping a Magento 2, WooCommerce or PrestaShop feed. On PrestaShop it adds `country_id` when the shop's default country would put the wrong VAT on prices, and `lang_id` to choose the language.
- `support-debugging` checks the plugin version through the same info endpoint first on feed and product-data tickets for those platforms.
- The wiki has a cross-platform page on the plugin info endpoints and a new PrestaShop page. The WooCommerce page now documents the info endpoint and `extraAttributes`.

### Fixed

- `feed-setup` no longer gives WooCommerce feeds the page parameter `paged` from 1. The plugin has never had that parameter, so those feeds stopped after the first page and imported only 200 products. It pages with `page` from 0.
- `feed-migration` lists WooCommerce in its pagination defaults and checks a PrestaShop feed's default country before porting prices.
