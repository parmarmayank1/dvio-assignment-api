require("dotenv").config();

const axios = require("axios");
const fs = require("fs");

const THRESHOLD = 5;

async function exportInventory() {
  try {

    // Basic validation
    if (!process.env.SHOP || !process.env.ACCESS_TOKEN) {
      throw new Error(
        "Missing SHOP or ACCESS_TOKEN in .env file"
      );
    }

    console.log("Fetching products...");

    const response = await axios.get(
      `https://${process.env.SHOP}/admin/api/2025-04/products.json?limit=250`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const products = response.data.products;

    const lowInventoryProducts = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {

        if (
          variant.inventory_quantity !== null &&
          variant.inventory_quantity <= THRESHOLD
        ) {
          lowInventoryProducts.push({
            product_id: product.id,
            product_title: product.title,
            variant_id: variant.id,
            variant_title: variant.title,
            inventory_quantity: variant.inventory_quantity,
            sku: variant.sku
          });
        }

      });
    });

    fs.writeFileSync(
      "inventory-feed.json",
      JSON.stringify(lowInventoryProducts, null, 2)
    );

    console.log(
      `Export completed successfully. ${lowInventoryProducts.length} low inventory variants found.`
    );

  } catch (error) {

    console.error("\nInventory Export Failed");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

exportInventory();