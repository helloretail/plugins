---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/exporting-historical-orders-from-dandomain/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Exporting historical orders from DanDomain"
description: "Export historical orders from DanDomain Classic to Hello Retail. Step-by-step guide to build an XML order export and submit it for a one-time import job."
tags: "Setup of Installation: DanDomain Classic, DanDomain"
---

# Exporting historical orders from DanDomain

To send historical orders from a DanDomain webshop to Hello Retail, set up an XML order export as follows:

1. Navigate to the **Import/Export**\-section, and choose **Export**. Then select **XML** as the format and specify **Orders** as the data to export.

2. Next, select the following fields to include in the export _(Danish labels)_:

    -   **Ordre > 'Ordrenummer', 'Oprettet dato', 'Totalpris'**
    -   **Kunde > 'Email'**
    -   **Ordrelinjer > 'Produktnummer', 'Produktnavn'**

3. Select the **interval** the export should cover. In this example, the interval is based on order date:

4. Review your export details and click **Start** to generate the export file:

5. Finally, **download** the file and **send it to [support@helloretail.com](mailto:support@helloretail.com)** - Hello Retail will set it up as a manual, one-time import job:
