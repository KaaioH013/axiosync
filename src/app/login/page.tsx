// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation'; // Importa o "roteador" para navegar entre páginas

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Controla se é tela de Login ou Cadastro
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter(); // Inicializa o roteador

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      // Lógica de CADASTRO
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage(`Erro no cadastro: ${error.message}`);
      } else {
        setMessage('Cadastro realizado com sucesso! Agora você pode fazer o login.');
        setIsSignUp(false); // Volta para a tela de login
      }
    } else {
      // Lógica de LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Erro no login: ${error.message}`);
      } else {
        router.push('/dashboard'); // Redireciona para o painel após login
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-white font-serif">
          {isSignUp ? 'Crie sua Conta' : 'Acesse o SmartZap'}
        </h1>

        <form onSubmit={handleAuthAction} className="space-y-4">
          <div>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Seu e-mail"
            />
          </div>
          <div>
            <input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Sua senha"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white bg-brand-blue rounded-md hover:bg-opacity-90 disabled:bg-gray-600 transition-colors"
          >
            {loading ? 'Aguarde...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>

        {message && <p className="text-center text-sm text-yellow-400 mt-4">{message}</p>}

        <p className="text-sm text-gray-400">
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-brand-green hover:underline ml-2"
          >
            {isSignUp ? 'Faça o login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  );
}