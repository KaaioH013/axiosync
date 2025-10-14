// src/components/Plans.tsx
import Link from 'next/link';

export function Plans() {
  const plans = [
    { name: "Starter", price: "49", numbers: "1 número", bestFor: "Para quem está começando" },
    { name: "Pro", price: "79", numbers: "3 números", bestFor: "Para pequenas equipes", popular: true },
    { name: "Premium", price: "99", numbers: "Números ilimitados", bestFor: "Para alta demanda" },
  ];

  return (
    <section id="plans" className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          Planos que se adaptam ao seu negócio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative p-8 rounded-xl border ${plan.popular ? 'border-brand-green' : 'border-gray-800'} bg-gray-900/50 flex flex-col`}>
              {/* Tag de "Mais Popular" */}
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

              <Link href="/login">
                <button className={`w-full font-bold py-3 rounded-lg transition-transform hover:scale-105 ${plan.popular ? 'bg-brand-green text-black' : 'bg-brand-blue text-white'}`}>
                  Testar Grátis por 7 Dias
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};