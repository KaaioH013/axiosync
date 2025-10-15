// INÍCIO DO CÓDIGO ATUALIZADO v6.0 (API de Checkout do Stripe)

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Inicializa o "conector" do Stripe com a nossa chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Inicializa o "conector" do Supabase para pegar o e-mail do usuário
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { priceId, userId } = await request.json();

    if (!priceId || !userId) {
      return new Response(JSON.stringify({ error: 'ID do Preço e ID do Usuário são obrigatórios' }), { status: 400 });
    }

    // Busca o e-mail do usuário no Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), { status: 404 });
    }

    // Cria uma sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      customer_email: user.email, // Passa o e-mail do cliente para o Stripe
      client_reference_id: userId, // Guarda o ID do nosso usuário no Supabase dentro da transação do Stripe
      success_url: `${request.headers.get('origin')}/dashboard?payment_success=true`,
      cancel_url: `${request.headers.get('origin')}/`,
    });

    // Devolve a URL da página de pagamento para o nosso site
    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('[STRIPE_API_ERROR]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao criar a sessão de checkout.' }), { status: 500 });
  }
}

// FINAL DO CÓDIGO ATUALIZADO v6.0 (API de Checkout do Stripe)