# Fraud Detection & Stripe Checkout Integration

This project is a basic **checkout page** that integrates the **Stripe API** for payment processing with **FraudLabs Pro** for fraud detection.

## 🚀 Setup Instructions

### 1️⃣ Clone the Repository
```sh
mkdir my_fraud_detection_app
cd my_fraud_detection_app
npm init -y
```

### 2️⃣ Install Dependencies
```sh
npm install express dotenv stripe fraudlabspro-nodejs cors body-parser
```

### 3️⃣ Obtain API Keys
#### **Stripe API Key**
- Sign up at [Stripe](https://stripe.com/) and get your **Secret Key**.
- Add it to your `.env` file (see below).

#### **FraudLabs Pro API Key**
- Sign up at [FraudLabs Pro](https://www.fraudlabspro.com/) and get your **API Key**.
- Add it to your `.env` file.

### 4️⃣ Create a `.env` File
Create a `.env` file in the root directory and add the following:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
FRAUDLABS_API_KEY=your_fraudlabspro_api_key_here
```

### 5️⃣ Setup `server.js`
```js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import FraudLabsPro from "fraudlabspro-nodejs";

dotenv.config();
const app = express();
const port = 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const fraudlabspro = new FraudLabsPro(process.env.FRAUDLABS_API_KEY);

app.use(cors());
app.use(bodyParser.json());

app.post("/create-checkout-session", async (req, res) => {
    try {
        const { items } = req.body;

        const line_items = items.map(item => ({
            price_data: {
                currency: "usd",
                product_data: { name: item.id },
                unit_amount: Math.round(parseFloat(item.price) * 100),
            },
            quantity: parseInt(item.quantity, 10) || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
```

### 6️⃣ Run the Project
```sh
node server.js
```

### 7️⃣ Test Checkout
- Open **Postman** or your frontend page and send a `POST` request to `http://localhost:3000/create-checkout-session`.
- Ensure the total price dynamically updates based on the **quantity**.
- If successful, Stripe should redirect you to the checkout page.

## ✅ Features
- Dynamic total price calculation ✅
- Secure Stripe checkout ✅
- Fraud detection using FraudLabs Pro ✅
- Environment variables for security ✅

## 📌 Next Steps
- Add database integration for orders.
- Implement frontend UI for a seamless user experience.

---

🎉 **Now your project is set up!** 🚀 Let me know if you need further improvements! 🛒💳

