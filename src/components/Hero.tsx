// src/components/Hero.tsx
import Link from 'next/link';

// Este é o nosso componente da seção Hero
export function Hero() {
  return (
    <section className="relative text-white min-h-screen flex items-center justify-center text-center px-4 pt-24 pb-12 overflow-hidden">
      {/* Efeito de grade sutil no fundo */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-tighter">
          Automatize seu WhatsApp com a Inteligência Artificial que Trabalha por Você
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Respostas instantâneas, personalizadas e 24/7. Transforme seu atendimento, aumente suas vendas e fidelize clientes sem esforço.
        </p>
        <Link href="/login">
          <button className="bg-brand-green text-black font-bold text-lg py-4 px-10 rounded-lg transition-transform transform hover:scale-105 shadow-lg shadow-green-500/20">
            Testar Grátis por 7 Dias
          </button>
        </Link>
        <p className="mt-4 text-sm text-gray-400">Não precisa de cartão de crédito.</p>
      </div>
    </section>
  );
};