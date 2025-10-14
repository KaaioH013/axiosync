// src/app/login/page.tsx
"use client"; // Informa ao Next.js que esta é uma página interativa

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Importa nosso conector

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o formulário de recarregar a página
    setLoading(true);
    setMessage('');

    // Tenta fazer o login com o Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Diz ao Supabase para onde redirecionar o usuário após o clique no link
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(`Erro: ${error.message}`);
    } else {
      setMessage('Verifique seu e-mail para o link de acesso mágico!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-white font-serif">Acessar o SmartZap</h1>
        <p className="text-gray-400">Digite seu e-mail para receber um link de acesso instantâneo. Sem senhas!</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="voce@exemplo.com"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white bg-brand-blue rounded-md hover:bg-opacity-90 disabled:bg-gray-600 transition-colors"
          >
            {loading ? 'Enviando...' : 'Receber Link Mágico'}
          </button>
        </form>
        {message && <p className="text-center text-sm text-green-400 mt-4">{message}</p>}
      </div>
    </div>
  );
}