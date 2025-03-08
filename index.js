import express from "express";
import axios from "axios";
import Stripe from "stripe";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;


app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function loadCartItems() {
    try {
        const rawData = await fs.readFile("products.json", "utf8");
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading the JSON file:", error);
        return [];
    }
}

app.get("/", async (req, res) => {
    const cartItems = await loadCartItems();
    res.render("cart.ejs", { cartItems });
});

app.post("/create-checkout-session", async (req, res) => {
    try {
        if (!req.body || !req.body.items) {
            return res.status(400).json({ error: "Invalid request data" });
        }

        const items = Object.values(req.body.items).filter(Boolean); // Ensure valid array
        if (items.length === 0) {
            return res.status(400).json({ error: "No items in checkout" });
        }

        const line_items = items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: { name: item.id },
                unit_amount: Math.round(parseFloat(item.price) * 100), // ✅ Convert to cents
            },
            quantity: parseInt(item.quantity, 10) || 1, // ✅ Default to 1 if invalid
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/",
        });

        res.json({ url: session.url }); // ✅ Ensure JSON response
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
