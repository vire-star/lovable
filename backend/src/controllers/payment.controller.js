import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { packId } = req.body;
  const userId = req.id;

  const packs = {
    starter: { price: 199, credits: 20 },
    pro: { price: 499, credits: 100 },
    power: { price: 999, credits: 300 }
  };

  const pack = packs[packId];
  if (!pack) return res.status(400).json({ error: "Invalid pack" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "inr",
        product_data: { name: `${pack.credits} AI Credits` },
        unit_amount: pack.price * 100
      },
      quantity: 1
    }],
    metadata: {
      userId,
      credits: pack.credits
    },
    success_url: `${process.env.CLIENT_URL}/payment-success`,
    cancel_url: `${process.env.CLIENT_URL}/payment-failed`
  });

  res.json({ url: session.url });
};



export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const credits = Number(session.metadata.credits);

    // ✅ Update DB
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          "credits.available": credits,
          "credits.total": credits
        }
      },
      { new: true }
    );

    // ✅ Update Redis cache
    const client = await getRedisClient();
    await client.incrBy(`credits:${userId}`, credits);

    // ✅ Log transaction
    await CreditTransaction.create({
      userId,
      type: "purchase",
      amount: credits,
      balanceAfter: user.credits.available,
      details: {
        paymentMethod: "stripe",
        action: "credit_purchase"
      }
    });

    console.log(`✅ ${credits} credits added to user ${userId}`);
  }

  res.json({ received: true });
};
