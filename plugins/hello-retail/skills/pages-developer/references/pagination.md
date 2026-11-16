# Pagination — the shop's chrome, numbered pages with an ellipsis, and "load more"

Read the section the step names: *Pagination chrome parity* whenever the design paginates (step 4g); the other two only when the operator asked for them (steps 4h and 4i). Step numbers in this file are the workflow steps of `../SKILL.md`.

## Pagination chrome parity (step 4g)

**Pagination chrome parity — the base pagination is not the shop's.** Field-proven
2026-09-29: the default `templateCss` ships a fixed 45px button height, a blue `#337ab7`
active page, a 2px gap, and no rule at all for the prev/next `.direction-links` buttons,
which therefore render as bare browser buttons; because those two hold only a 17px SVG
they also come out shorter than the number buttons. Whenever the design paginates
(`paginated = true`, or the operator asked for numbered pages), restyle it to the shop:

- **Reference, in this order.** (1) The shop's own pagination on the category page —
  measure it like any other chrome (link/active/hover/disabled colours, border, radius,
  padding, font, gap). (2) The shop has none (single page, "load more", infinite scroll):
  use the theme's own pagination rules instead — scan the linked stylesheets for
  `.pagination` / `.page-link` / `.page-item` selectors, and read the framework's
  pagination variables from a temporary `<ul class="pagination">` element the survey
  appends and removes (Bootstrap 5 exposes `--bs-pagination-*` on it). Never keep HR's
  defaults, never invent a palette; the design's own injected CSS is not a reference.
- **Write.** Value-swap the base pagination block (`gap`, `height`, the `.active` colours)
  and add the measured declarations as rules scoped to `.hr-pagination-container`, always
  for `.page-link` **and** `.direction-links` together: padding, font, colour, background,
  border, the joined `-1px` overlap, end radii on the first/last item, hover, focus and
  active. Give both button kinds the same fixed `height` — the number buttons' rendered
  height (text line + padding + border) — so the SVG-only arrows cannot end up shorter.
- **JS — three one-line fixes to the base pagination handlers**, on every paginated build:
  (1) the declaration becomes `var current_page = parseInt(options.get_pagination(), 10) || 1;`
  — the page is read back from the `hr-page` URL state, and `current_page += 1` on a text
  value concatenates (`"3"` → `"31"`); (2) the `#prev-page` handler clears `active` from the
  page it leaves, as the `#next-page` handler already does — without it two pages show as
  active after a prev click; (3) the `.page-link`, `#prev-page` and `#next-page` click
  handlers each start with `if (options.loading) { return; }` — `load_more()` ignores a
  click while a request runs, but the handler has already moved `current_page`, so two
  quick clicks leave the active page one off from the products shown. The prev handler
  after the edits:

  ```javascript
  prevPageLink.addEventListener("click", function() {
  	if (options.loading) {
  		return;
  	}
  	if (current_page > 1) {
  		pagination_container.querySelector("#page-link-" + current_page)?.classList.remove("active");
  		current_page -= 1
  		options.start = (current_page - 1) * 24
  		load_more();
  	}
  })
  ```

- **Verify on-site** (step 7): every visible button, arrows included, has the same
  rendered height and top edge at 1440 and 375px; the active page uses the shop's active
  colour; the row is centred and does not overflow a phone width. Then click: prev from
  page 3 leaves exactly one active page; two quick clicks on next land on the page the
  products show; a reload on page 3 keeps page 3 active and next goes to 4.

## Numbered pagination with ellipsis (step 4h)

**Numbered pagination with ellipsis — opt-in, when the operator asks for it.** Some shops
want `1 2 3 … 20` instead of the base's sliding window of five neighbours. Field-proven
2026-09-30. The behaviour: page 1 and the last page always shown, the current page ±
`paginations_per_side` (the existing JS number, default 2) around it, a `…` cell only where
two or more pages are skipped — a single skipped page shows as its number, since the `…`
would take the same space (`‹ 1 2 3 4 [5]`, not `‹ 1 … 3 4 [5]`) — prev hidden on page 1
and next hidden on the last page — e.g. `‹ 1 … 8 9 [10] 11 12 … 20 ›`. Liquid still
renders every page item; the JS only toggles which are visible, so no extra requests.
Apply step 4g's three handler fixes first, then three edits, value- and slot-level only:

- **Liquid** — the base `{% for item in (1..totalPages) %}` loop becomes exactly this
  (1-based; keep it — a 0-based rewrite needs an off-by-one correction for exact multiples of
  the page size). The ellipses sit **inside** the first and last `<li>`, which are always
  visible:

  ```liquid
  {% for item in (1..totalPages) %}
  	<li class="page-item pagination-item" name="{{item}}">
  		{% if item == totalPages and totalPages > 1 %}<span id="end-ellipsis" class="hr-pagination-ellipsis hr-hidden" aria-hidden="true">&hellip;</span>{% endif %}
  		<button class="page-link" id="page-link-{{item}}" value="{{item}}">
  			{{ item }}
  		</button>
  		{% if item == 1 %}<span id="start-ellipsis" class="hr-pagination-ellipsis hr-hidden" aria-hidden="true">&hellip;</span>{% endif %}
  	</li>
  {% endfor %}
  ```

- **JS** — replace `handle_pagination_limit()` with this function and add the
  `toggle_visible()` helper below it. It already runs after the first render and after every
  page load:

  ```javascript
  function handle_pagination_limit() {
  	if (!paginated || !pagination_container) {
  		return;
  	}
  	var paginations = pagination_container.querySelectorAll(".pagination-item");
  	var total_pages = paginations.length;
  	if (total_pages === 0) {
  		return;
  	}
  	// Clamp: a stale URL can name a page that no longer exists
  	var current = Math.min(Math.max(parseInt(current_page, 10) || 1, 1), total_pages);
  	var first = current - paginations_per_side;
  	var last = current + paginations_per_side;
  	// An ellipsis that would hide a single page shows that page instead
  	if (first === 3) {
  		first = 2;
  	}
  	if (last === total_pages - 2) {
  		last = total_pages - 1;
  	}
  	paginations.forEach(function(element) {
  		var page = parseInt(element.getAttribute("name"), 10);
  		var visible = page === 1 || page === total_pages || (page >= first && page <= last);
  		visible ? show(element) : hide(element);
  		var link = element.querySelector(".page-link");
  		if (link) {
  			link.classList.toggle("active", page === current);
  			page === current ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
  		}
  	});
  	toggle_visible(pagination_container.querySelector("#start-ellipsis"), first > 2);
  	toggle_visible(pagination_container.querySelector("#end-ellipsis"), last < total_pages - 1);
  	toggle_visible(pagination_container.querySelector("#prev-page")?.parentElement, current > 1);
  	toggle_visible(pagination_container.querySelector("#next-page")?.parentElement, current < total_pages);
  }

  function toggle_visible(element, visible) {
  	if (element) {
  		visible ? show(element) : hide(element);
  	}
  }
  ```

  The `active` toggle is not optional: it is the one place that sets the active page, so an
  `active` class left behind by any handler is cleared on the next load. Compare pages as
  numbers (`current`), never `current_page` directly: when that holds text, `===` never
  matches and `current_page + 2` concatenates, which shows every page from the current one
  up and hides the end `…`.
- **CSS** (scoped to `.hr-pagination-container`, values from step 4g) — the `…` cell gets the
  page buttons' own box: same height, border, font, `-1px` overlap, not clickable; the page
  items become `display: inline-flex` (the base `li { display: inline }` renders the
  whitespace between the `…` and its button as a visible gap); and at the shop's mobile band
  shrink the cells (e.g. `min-width: 30px; padding: 6px 4px`) — a middle page is 11 cells,
  ~400 px at desktop size, which wraps on a 375 px phone. When the shop's pagination has
  rounded ends, a hidden arrow still counts as `:first-child` / `:last-child`, so move the
  end radius to the first/last visible button as well:
  `.pagination > li.hr-hidden:first-child + li > .page-link` (left) and
  `.pagination > li:has(+ li.hr-hidden:last-child) > .page-link` (right).

Verify on-site by clicking, not by reading the code: page 1, next several times, a middle page,
the last page, prev twice, back to 1 — at each step exactly one active page, a `…` only where
two or more pages are skipped, arrows hidden at the ends, rounded ends on the outer visible
buttons (when the shop rounds them), one row of equal-height cells at 1440 and 375 px. Then
reload on a middle page: the same window and one active page.

## "Load more" button (step 4i)

**"Load more" button — opt-in, the third loading mode.** The base knows two: infinite
scroll (`paginated = false`) and numbered pages (`paginated = true`). Some shops want the
first page, then a button under the grid that appends the next page on each click, with a
"24 of 339 products" counter and no auto-loading on scroll — and the shop's own listing
usually already looks like that (a centred button after the grid, a counter, the button
gone once everything is shown). Field-proven 2026-09-30. Build it as a switch on top of
the infinite-scroll path so the base's request, append and reload-restore logic is reused:

- **Liquid** — a new token section below the last base token,
  `{# section Load more #}` with `{# text load_more_text = "Load more" #}` and
  `{# text load_more_count_separator = "of" #}` (copy the shop's own words), and a new
  capture rendered between `{{ product_container }}` and `{{ pagination_container }}` in
  **both** `filter_position` branches:

  ```liquid
  {% capture load_more_container %}
  	<div class="hr-load-more-container">
  		<p class="hr-load-more-count"><span class="hr-load-more-shown">{{ count }}</span> {{ load_more_count_separator }} <span class="hr-load-more-total">{{ totalResults }}</span> {{ product_title_multiple }}</p>
  		<button type="button" class="hr-load-more-button">{{ load_more_text }}</button>
  	</div>
  {% endcapture %}
  ```

- **JS** — `/* boolean */ var load_more_button = true;` next to `paginated` (which stays
  `false`), and `var page_size = 24;` under it — the base has no page-size variable, it
  hard-codes `24` (use the number the base you read hard-codes; without the declaration the
  first click throws a ReferenceError). Then seven guarded edits, none of them a rewrite: (1) the scroll listeners are
  registered only `if (!paginated && !load_more_button)`; (2) the same guard on the viewport
  check in `load_more()`; (3) the auto-fill `if (options.hasMore) load_more()` at the end of
  `insert_results` becomes `options.hasMore && !load_more_button`; (3b) the placeholder
  guard at the top of `insert_results` becomes
  `if (!options.hasMore || paginated || load_more_button) hide(options.placeholder)` — the
  animated loader image is infinite scroll's "more is coming" cue; left in place it sits
  under the button as a stray row of dots (operator-reported); (4) on the first batch,
  `load_more_container = page_container.querySelector(".hr-load-more-container")` — remove it
  when `paginated || !load_more_button` (the way the base removes the pagination container
  in infinite mode), otherwise bind its button:
  `options.count = page_size; load_more(true);`; (5) call `update_load_more(productsTotal)`
  right after `post_insert(is_first_batch)`; (6) add that function: it writes
  `Math.min(options.start, total)` into `.hr-load-more-shown`, the total into
  `.hr-load-more-total`, and shows the container while `options.hasMore`, hides it otherwise.
  The `options.count = page_size` on click is not optional: the base's reload-restore path
  sets `options.count` to the restored remainder and never resets it, so without it every
  click after a reload loads that remainder (48, 72 …) instead of one page.
- **CSS** — scope everything to `.hr-pages-container` / `.hr-load-more-container`: the
  container is a centred column with the shop's spacing under the grid; the counter takes
  the shop's body text; the button is a value-copy of the shop's own listing button (its
  primary/secondary button rules: padding, font, colour, background, border, radius, hover),
  never HR defaults. Measure the shop's load-more button when it has one, its primary button
  otherwise.

Verify on-site by doing, at desktop and phone width: the first page renders with the counter
and the button, scrolling to the bottom loads **nothing**, each click appends exactly one page
and updates the counter and the `hr-page` URL state, a reload restores what was loaded and the
next click still adds one page, no duplicate products across clicks, and on the last page the
whole block disappears. Pagination must not render in this mode, and the base's loading
image (`img[alt="loading"]`) must be hidden at every step — idle, during a click and after.
