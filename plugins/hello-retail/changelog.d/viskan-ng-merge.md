### Changed

- `hello-retail-knowledge` and every skill that reads the Viskan platform notes now use one Viskan page that covers both storefronts, Streamline and NG (Next.js). It says how to tell the two apart, which features are API integrations on each, and how to set up Pages for API use.
- `tile-extractor` tells the two Viskan storefronts apart: `window.viskan` means Viskan, and `window._streamline` decides Streamline versus NG. NG shops were previously not recognised as Viskan at all.
- `customer-handoff` records Viskan as one platform with the flavour `Streamline` or `NG`, instead of the single value `Viskan Streamline`.
