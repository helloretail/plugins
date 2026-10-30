---
source: support-docs
upstream: https://support.helloretail.com/general-setup/using-cloudflare-rocket-loader-and-hello-retail/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Using CloudFlare / Rocket Loader and Hello Retail"
description: "Configure Cloudflare Rocket Loader in manual mode to avoid blocking the Hello Retail partner script. Learn which scripts to include."
tags: "Documentation & API"
---

# Using CloudFlare / Rocket Loader and Hello Retail

If you are using Cloudflare Rocket Loader (rocketscript) in Automatic Mode, it can block the Hello Retail partner script by changing how the script is loaded and executed.

We recommend using Cloudflare Rocket Loader in Manual Mode so you control which resources Rocket Loader executes. When running Rocket Loader in Manual Mode, add the attribute data-cfasync="true" to the script tags you want Rocket Loader to execute. Do not add this attribute to the Hello Retail partner script tag. This ensures the Hello Retail script loads normally and initializes correctly.

Find [more info about Rocket Loader here, on the Cloudflare Support page](https://support.cloudflare.com/hc/en-us/articles/200168056-What-does-Rocket-Loader-do-).
