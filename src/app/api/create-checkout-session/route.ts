// INÍCIO DO CÓDIGO ATUALIZADO v6.1 (API de Checkout Corrigida)

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    // A CORREÇÃO ESTÁ AQUI: Pegamos o e-mail diretamente do corpo da requisição
    const { priceId, userId, userEmail } = await request.json();

    if (!priceId || !userId || !userEmail) {
      return new Response(JSON.stringify({ error: 'Dados incompletos (priceId, userId, userEmail)' }), { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer_email: userEmail, // <<<--- USAMOS O E-MAIL RECEBIDO
      client_reference_id: userId,
      success_url: `${request.headers.get('origin')}/dashboard?payment_success=true`,
      cancel_url: `${request.headers.get('origin')}/`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('[STRIPE_API_ERROR]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao criar a sessão de checkout.' }), { status: 500 });
  }
}

// FINAL DO CÓDIGO ATUALIZADO v6.1 (API de Checkout Corrigida)