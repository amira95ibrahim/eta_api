export default async function handler(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
  
      if (!token) {
        return res.status(401).json({ error: "No token" });
      }
  
      let allInvoices = [];
      let page = 1;
  
      while (true) {
        const response = await fetch(
         // `https://api.invoicing.eta.gov.eg/api/v1/documents?pageSize=50&pageNo=${page}`,
             `https://api.invoicing.eta.gov.eg/api/v1.0/documents/recent`,
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
  
      return res.status(200).json(allInvoices);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
