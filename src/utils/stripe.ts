import { Stripe } from "stripe";
import { env } from "~/env.mjs";

export const stripe = new Stripe(env.STRIPE_SECRET, {
  apiVersion: "2022-11-15",
});

export const isUserSubscribed = async (email: string) => {
  if (!email) return false;

  const customer = await stripe.customers.list({
    email,
  });
  console.dir(customer);
  if (customer.data.length === 0) {
    return false;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customer.data[0]?.id,
    status: "active",
  });
  const trials = await stripe.subscriptions.list({
    customer: customer.data[0]?.id,
    status: "trialing",
  });

  return subscriptions.data.length > 0 || trials.data.length > 0;
};
