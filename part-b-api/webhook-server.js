/*
=================================================
Production Readiness Notes

1. Verify Shopify webhook HMAC signature
   before processing requests.

2. Implement idempotency checks to avoid
   duplicate order processing.

3. Use a retry mechanism or queue system
   for failed webhook events.

4. Store logs in a database instead of
   local files.

5. Add centralized monitoring and alerting.

=================================================
*/

const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Webhook Server Running");
});

app.get("/webhooks/orders-create", (req, res) => {
  res.send("Webhook endpoint is reachable");
});

app.post("/webhooks/orders-create", (req, res) => {
  try {

    const order = req.body;

    if (!order) {
      throw new Error("Webhook payload is missing");
    }

    if (!order.id) {
      throw new Error("Order ID is missing");
    }

    console.log("\n========== NEW ORDER ==========");
    console.log("Order ID:", order.id);
    console.log("Customer Email:", order.email || "N/A");

    console.log("\nLine Items:");

    if (order.line_items && order.line_items.length > 0) {
      order.line_items.forEach((item) => {
        console.log(`${item.title} x ${item.quantity}`);
      });
    } else {
      console.log("No line items found");
    }

    const logData = `
Order ID: ${order.id}
Customer Email: ${order.email || "N/A"}

Items:
${
  order.line_items && order.line_items.length > 0
    ? order.line_items
        .map((item) => `${item.title} x ${item.quantity}`)
        .join("\n")
    : "No line items found"
}

------------------------------------
`;

    fs.appendFileSync("orders.log", logData);

    console.log("\nSaved to orders.log");

    res.status(200).send("OK");

  } catch (error) {

    console.error("\nWebhook Processing Failed");
    console.error(error.message);

    res.status(500).send("Webhook Error");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});