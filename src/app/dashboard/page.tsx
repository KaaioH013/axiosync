// src/app/dashboard/page.tsx
"use client"; // Página interativa

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Nosso conector
import { User } from '@supabase/supabase-js'; // Tipo para os dados do usuário

export default function DashboardPage() {
  // "Estados" para guardar informações: quem é o usuário e se a página está carregando.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Este hook roda assim que a página carrega
  useEffect(() => {
    // Função para checar quem está logado
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
      } else {
        // Se não tiver ninguém logado, expulsa para a página de login
        window.location.href = '/login';
      }
      setLoading(false);
    }

    checkUserSession();
  }, []);

  // Função para fazer logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Envia para a página inicial após sair
  };

  // Se estiver carregando, mostra uma mensagem
  if (loading) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Carregando...</div>;
  }

  // Se chegou até aqui, significa que o usuário está logado. Mostra o painel.
  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif">Painel SmartZap</h1>
          <div>
            <span className="text-gray-400 mr-4 hidden sm:inline">{user?.email}</span>
            <button onClick={handleLogout} className="text-red-500 hover:underline font-semibold">
              Sair
            </button>
          </div>
        </header>

        {/* Container para os próximos recursos */}
        <div className="space-y-8">
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Status da Conexão</h2>
            <p className="text-gray-400">(Aqui mostraremos se o WhatsApp está conectado)</p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Seu Plano</h2>
            <p className="text-gray-400">(Aqui mostraremos os detalhes da assinatura)</p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Inteligência Artificial</h2>
            <p className="text-gray-400">(Aqui ficará o simulador de chat com a IA)</p>
          </div>
        </div>
      </div>
    </div>
  );
}