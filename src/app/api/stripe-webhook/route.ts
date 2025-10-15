// INÍCIO DO CÓDIGO ATUALIZADO v1.1 (Webhook Corrigido)

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Lida com o evento de pagamento bem-sucedido
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    if (userId) {
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        plan_id: subscription.items.data[0].price.id,
      }, { onConflict: 'user_id' });
    }
  }

  return NextResponse.json({ received: true });
}

// FINAL DO CÓDIGO ATUALIZADO v1.1 (Webhook Corrigido)