export default async function handler(req, res) {

  try {

    // ---------------------------------------------------
    // GET TOKEN
    // ---------------------------------------------------
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
          scope: "Mcs.Invoicing.Api",
        }),
      }
    );

    const tokenText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({
        error: "Token request failed",
        raw: tokenText,
      });
    }

    let tokenData;

    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      return res.status(500).json({
        error: "Token response not JSON",
        raw: tokenText,
      });
    }

    const token = tokenData.access_token;

    if (!token) {
      return res.status(401).json({
        error: "No access token",
        data: tokenData,
      });
    }

    // ---------------------------------------------------
    // GET RECENT INVOICES
    // ---------------------------------------------------
    const response = await fetch(
      "https://api.invoicing.eta.gov.eg/api/v1.0/documents/recent?pageSize=20&pageNo=1",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Accept-Language": "en",
        },
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "ETA request failed",
        raw: responseText,
      });
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({
        error: "ETA returned invalid JSON",
        raw: responseText,
      });
    }

    // ---------------------------------------------------
    // GET DETAILS FOR EACH INVOICE
    // ---------------------------------------------------
    const invoices = data.result || [];

    const detailedInvoices = [];

    for (const invoice of invoices) {

      try {

        const detailsResponse = await fetch(
          `https://api.invoicing.eta.gov.eg/api/v1.0/documents/${invoice.uuid}/raw`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
              Accept: "application/json",
            },
          }
        );

        const detailsText = await detailsResponse.text();

        let detailsData = {};

        try {
          detailsData = JSON.parse(detailsText);
        } catch {
          detailsData = {};
        }

        detailedInvoices.push({
          ...invoice,
          details: detailsData,
        });

      } catch (e) {

        detailedInvoices.push({
          ...invoice,
          detailsError: e.message,
        });
      }
    }

    // ---------------------------------------------------
    // RETURN RESULT
    // ---------------------------------------------------
    return res.status(200).json({
      total: detailedInvoices.length,
      result: detailedInvoices,
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });

  }
}
