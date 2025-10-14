// src/components/Header.tsx
import Link from 'next/link';

// Este é o nosso componente de Cabeçalho
export function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-10 py-6 px-4 md:px-8">
      <div className="container mx-auto flex justify-between items-center">
        {/* Nome do Site */}
        <h1 className="text-2xl font-bold text-white font-serif">SmartZap</h1>

        {/* Menu de Navegação (aparece em telas maiores) */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">Como Funciona</a>
          <a href="#plans" className="text-gray-300 hover:text-white transition-colors">Planos</a>
          <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Depoimentos</a>
        </nav>

        {/* Botão de Login */}
        <Link href="/login">
          <button className="bg-brand-blue hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
            Acessar Painel
          </button>
        </Link>
      </div>
    </header>
  );
};