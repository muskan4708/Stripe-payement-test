const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
const { v4: uuid } = require("uuid");


console.log("keey**************",process.env.STRIPE_SECRET_KEY)
// Middlewares
const app = express();
app.use(express.json());
app.use(cors());

// Payment router
app.post("/payment", async (req, res) => {
  const { product, token } = req.body; 

  console.log("Product:", product);
  console.log("Token:", token);

  const idempotencyKey = uuid(); 
  
  try {
    // Create a customer
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    // Create a charge
    const charge = await stripe.charges.create(
      {
        amount: product.price * 100, // Amount in cents
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: product.name,
        shipping: {
          name: token.card.name,
          address: {
            country: token.card.address_country,
          },
        },
      },
      { idempotencyKey }
    );

    res.status(200).json({ charge }); // Return the charge object
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message }); // Return the error message
  }
});

// app.get("/", (req, res) => {
//     res.send("Server started for Stripe");
//   });
  
// Start the server
const port = 5000
app.listen(port, () => {
  console.log(`Server started successfully at http://localhost:${port}`);
});
