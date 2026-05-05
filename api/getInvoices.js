export default async function handler(req, res) {
  try {

    // ------------------------------------------------------------------
    // 1️⃣ GET ACCESS TOKEN FROM ETA
    // ------------------------------------------------------------------
    const tokenResponse = await fetch(
      "https://id.eta.gov.eg/connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          scope: "InvoicingAPI",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(401).json({
        error: "Failed to get token",
        details: tokenData,
      });
    }

    const token = tokenData.access_token;

    // ------------------------------------------------------------------
    // 2️⃣ FETCH INVOICES
    // ------------------------------------------------------------------
    let allInvoices = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.invoicing.eta.gov.eg/api/v1/documents?pageSize=50&pageNo=${page}`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!data.result || data.result.length === 0) break;

      allInvoices = allInvoices.concat(data.result);
      page++;
    }

    // ------------------------------------------------------------------
    // 3️⃣ RETURN RESULT
    // ------------------------------------------------------------------
    return res.status(200).json(allInvoices);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
