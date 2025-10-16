// INÍCIO DO CÓDIGO ATUALIZADO v2.2 (Modo de Diagnóstico)

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function Plans() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }
    checkUser();
  }, []);

  const plans = [
    { name: "Starter", price: "49", numbers: "1 número", bestFor: "Para quem está começando", priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID! },
    { name: "Pro", price: "79", numbers: "3 números", bestFor: "Para pequenas equipes", popular: true, priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID! },
    { name: "Premium", price: "99", numbers: "Números ilimitados", bestFor: "Para alta demanda", priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID! },
  ];

  const handleCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId);
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: priceId, userId: user.id, userEmail: user.email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Ocorreu um erro ao iniciar o pagamento. Tente novamente.");
        setLoadingPriceId(null);
      }
    } catch (error) {
      alert("Ocorreu um erro ao iniciar o pagamento. Tente novamente.");
      setLoadingPriceId(null);
    }
  };

  return (
    <section id="plans" className="py-20 px-4">
      <div className="container mx-auto text-center">
        
        {/* ======================= INÍCIO DO BLOCO DE DIAGNÓSTICO ======================= */}
        <div className="mb-10 p-4 border border-red-500 rounded-lg text-left bg-gray-900">
          <h3 className="text-lg font-bold text-red-400 mb-2">DEBUG: Variáveis de Ambiente Atuais</h3>
          <p className="text-xs font-mono break-all">
            <strong>STARTER:</strong> {process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID}
          </p>
          <p className="text-xs font-mono break-all">
            <strong>PRO:</strong> {process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID}
          </p>
          <p className="text-xs font-mono break-all">
            <strong>PREMIUM:</strong> {process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID}
          </p>
        </div>
        {/* ======================= FIM DO BLOCO DE DIAGNÓSTICO ======================= */}

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          Planos que se adaptam ao seu negócio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative p-8 rounded-xl border ${plan.popular ? 'border-brand-green' : 'border-gray-800'} bg-gray-900/50 flex flex-col`}>
              {plan.popular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-green text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Mais Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="text-gray-400 mt-2 mb-6 h-10">{plan.bestFor}</p>
              <p className="text-5xl font-bold text-white mb-2">
                R${plan.price}
                <span className="text-lg font-normal text-gray-400">/mês</span>
              </p>
              <p className="font-semibold mb-8 text-gray-300">{plan.numbers}</p>
              <div className="flex-grow"></div>
              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loadingPriceId === plan.priceId}
                className={`w-full font-bold py-3 rounded-lg transition-transform hover:scale-105 ${plan.popular ? 'bg-brand-green text-black' : 'bg-brand-blue text-white'} disabled:opacity-50`}
              >
                {loadingPriceId === plan.priceId ? 'Aguarde...' : 'Assinar Agora'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// FINAL DO CÓDIGO ATUALIZADO v2.2 (Modo de Diagnóstico)