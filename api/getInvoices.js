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
          scope: "InvoicingAPI",
        }),
      }
    );

    const tokenText = await tokenResponse.text();

    console.log("TOKEN STATUS:", tokenResponse.status);
    console.log("TOKEN TEXT:", tokenText);

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
    // GET INVOICES
    // ---------------------------------------------------
    const response = await fetch(
      "https://api.invoicing.eta.gov.eg/api/v1/documents?pageSize=10&pageNo=1",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
        },
      }
    );

    const responseText = await response.text();

    console.log("ETA STATUS:", response.status);
    console.log("ETA RESPONSE:", responseText);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "ETA request failed",
        raw: responseText,
      });
    }

    // ---------------------------------------------------
    // PARSE JSON SAFELY
    // ---------------------------------------------------
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
    // RETURN RESULT
    // ---------------------------------------------------
    return res.status(200).json(data);

  } catch (err) {

    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });

  }
}
