// INÍCIO DO CÓDIGO ATUALIZADO v2.0

"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Define o "molde" para como uma mensagem deve se parecer
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export default function DashboardPage() {
  // --- SEÇÃO DE ESTADOS ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tone, setTone] = useState('vendedor simpático e prestativo');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // --- SEÇÃO DE EFEITOS (LÓGICA QUE RODA AUTOMATICAMENTE) ---

  // Efeito 1: Roda uma vez para checar se o usuário está logado
  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        window.location.href = '/login';
      }
    }
    checkUserSession();
  }, []);

  // Efeito 2: Roda sempre que o 'user' for identificado, para carregar o histórico
  useEffect(() => {
    if (user) {
      setLoading(true);
      async function fetchMessages() {
        // A CORREÇÃO DO ERRO ESTÁ AQUI: Garantimos que 'user' não é nulo
        if (!user) return;

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (data) {
          setMessages(data);
        }
        setLoading(false);
      }
      fetchMessages();
    }
  }, [user]);

  // --- SEÇÃO DE FUNÇÕES (AÇÕES DO USUÁRIO) ---

  // Função para fazer logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Função para enviar uma nova mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const userMessage: Message = { id: Date.now().toString(), content: newMessage, role: 'user' };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setNewMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          tone: tone,
          userId: user.id,
          history: messages,
        }),
      });

      const data = await response.json();
      
      if (data.reply) {
        const assistantMessage: Message = { id: Date.now().toString() + 'a', content: data.reply, role: 'assistant' };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Erro ao chamar API de chat:", error);
      const errorMessage: Message = { id: Date.now().toString() + 'e', content: "Desculpe, não consegui me conectar. Tente novamente.", role: 'assistant' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // --- SEÇÃO DE RENDERIZAÇÃO (O QUE APARECE NA TELA) ---

  // Tela de Loading
  if (loading) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Carregando histórico...</div>;
  }

  // Tela Principal do Painel
  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif">Painel SmartZap</h1>
          <div>
            <span className="text-gray-400 mr-4 hidden sm:inline">{user?.email}</span>
            <button onClick={handleLogout} className="text-red-500 hover:underline font-semibold">Sair</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda: Configurações */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Status da Conexão</h2>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400 font-medium">Conectado</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Seu número está pronto para receber mensagens.</p>
              <p className="text-xs text-gray-500 mt-4">(Simulação de conexão para o MVP)</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Seu Plano</h2>
              <p className="text-lg font-medium text-brand-green">Plano de Teste Gratuito</p>
              <p className="text-sm text-gray-400 mt-2">Você tem 7 dias para testar todos os recursos.</p>
            </div>
          </div>

          {/* Coluna da Direita: IA */}
          <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Inteligência Artificial</h2>
            <div className="mb-6">
              <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-2">Tom de Voz da IA:</label>
              <input
                id="tone"
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="h-96 flex flex-col bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200">Digitando...</div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="mt-4 flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.g.value)}
                  placeholder="Simule uma mensagem do cliente..."
                  className="flex-grow px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:bg-gray-600"
                  disabled={isSending}
                />
                <button type="submit" className="px-6 py-2 bg-brand-green text-black font-semibold rounded-r-lg disabled:bg-green-800" disabled={isSending}>
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FINAL DO CÓDIGO ATUALIZADO v2.0