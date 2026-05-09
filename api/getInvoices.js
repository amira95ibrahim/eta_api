export default async function handler(req, res) {

  try {

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

    const text = await tokenResponse.text();

  

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({
        error: "Token request failed",
        raw: text,
      });
    }

    let tokenData;

    try {
      tokenData = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Token response مش JSON",
        raw: text,
      });
    }

    const token = tokenData.access_token;

    if (!token) {
      return res.status(401).json({
        error: "No access token returned",
        data: tokenData,
      });
    }

    const response = await fetch(
      "https://api.invoicing.eta.gov.eg/v1.0/documents/recent",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const dataText = await response.text();


    return res.status(200).send(response,token);

  } catch (err) {

    return res.status(500).json({

      error: err.message,
      stack: err.stack,
    });

  }
}


