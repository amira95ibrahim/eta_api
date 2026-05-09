export default async function handler(req, res) {

  try {

    // ------------------------------------------------
    // GET TOKEN
    // ------------------------------------------------
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
        error: "No access token",
        data: tokenData,
      });
    }

    // ------------------------------------------------
    // FETCH INVOICES
    // ------------------------------------------------
    const response = await fetch(
      "https://api.invoicing.eta.gov.eg/v1.0/documents/recent",
      {
        headers: {
          Authorization: "Bearer " + tokenData.access_token,
        },
      }
    );

    const data = await response.json();

    // ------------------------------------------------
    // RETURN JSON
    // ------------------------------------------------
    return res.status(200).text(data);

  } catch (err) {

    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });

  }
}
