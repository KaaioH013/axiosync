// INÍCIO DO CÓDIGO ATUALIZADO v4.7 (Painel 100% Completo e Simplificado)

"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { DashboardPlans } from '@/components/DashboardPlans';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}
interface Subscription {
  status: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tone, setTone] = useState('Vendedor técnico consultivo, especialista em bombas helicoidais da Helibombas. Seja profissional, direto e foque em entender a necessidade do cliente para oferecer a melhor solução.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [knowledge, setKnowledge] = useState('');
  const [savingKnowledge, setSavingKnowledge] = useState(false);
  const [knowledgeSaveMessage, setKnowledgeSaveMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      else window.location.href = '/login';
    }
    checkUserSession();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      async function fetchData() {
        if (!user) return;
        const subscriptionPromise = supabase.from('subscriptions').select('status').eq('user_id', user.id).single();
        const messagesPromise = supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
        const knowledgePromise = supabase.from('knowledge_base').select('content').eq('user_id', user.id).single();
        const [subscriptionResult, messagesResult, knowledgeResult] = await Promise.all([subscriptionPromise, messagesPromise, knowledgePromise]);
        if (subscriptionResult.data) setSubscription(subscriptionResult.data);
        if (messagesResult.data) setMessages(messagesResult.data);
        if (knowledgeResult.data) setKnowledge(knowledgeResult.data.content);
        setLoading(false);
      }
      fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSaveKnowledge = async () => {
    if (!user) return;
    setSavingKnowledge(true);
    setKnowledgeSaveMessage('');
    const { error } = await supabase.from('knowledge_base').upsert({ user_id: user.id, content: knowledge }, { onConflict: 'user_id' });
    if (error) {
      setKnowledgeSaveMessage('Erro ao salvar.');
      console.error('Erro:', error);
    } else {
      setKnowledgeSaveMessage('Salvo com sucesso!');
    }
    setSavingKnowledge(false);
    setTimeout(() => setKnowledgeSaveMessage(''), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const userMessage: Message = { id: Date.now().toString(), content: newMessage, role: 'user' };
    const historyToSend = [...messages];
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, tone, userId: user.id, history: historyToSend }),
      });
      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = { id: Date.now().toString() + 'a', content: data.reply, role: 'assistant' };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = { id: Date.now().toString() + 'e', content: "Desculpe, a IA não conseguiu responder.", role: 'assistant' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Erro:", error);
      const errorMessage: Message = { id: Date.now().toString() + 'e', content: "Desculpe, não consegui me conectar. Tente novamente.", role: 'assistant' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Verificando sua conta...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-bold font-serif">Painel AxioSync</h1>
          </Link>
          <div>
            <span className="text-gray-400 mr-4 hidden sm:inline">{user?.email}</span>
            <button onClick={handleLogout} className="text-red-500 hover:underline font-semibold">Sair</button>
          </div>
        </header>
        <main>
          {subscription && subscription.status === 'active' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <h2 className="text-xl font-semibold mb-4">Base de Conhecimento</h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Ensine sua IA. Insira aqui todas as informações sobre seu negócio, produtos, serviços e perguntas frequentes.
                  </p>
                  <textarea
                    value={knowledge}
                    onChange={(e) => setKnowledge(e.target.value)}
                    placeholder="Ex: Somos a SolPotente, instalamos painéis solares..."
                    className="w-full h-48 p-3 text-base bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-green-500 h-4">{knowledgeSaveMessage}</span>
                    <button
                      onClick={handleSaveKnowledge}
                      disabled={savingKnowledge}
                      className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg disabled:bg-gray-600 transition-colors"
                    >
                      {savingKnowledge ? 'Salvando...' : 'Salvar Conhecimento'}
                    </button>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                  <h2 className="text-xl font-semibold mb-4">Seu Plano</h2>
                  <p className="text-lg font-medium text-brand-green">Plano Ativo</p>
                </div>
              </div>
              <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-semibold mb-4">Inteligência Artificial</h2>
                <div className="mb-6">
                  <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-2">Tom de Voz da IA:</label>
                  <input id="tone" type="text" value={tone} onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue" />
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
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="mt-4 flex">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Simule uma mensagem do cliente..."
                      className="flex-grow px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:bg-gray-600"
                      disabled={isSending} />
                    <button type="submit" className="px-6 py-2 bg-brand-green text-black font-semibold rounded-r-lg disabled:bg-green-800" disabled={isSending}>
                      Enviar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            user && <DashboardPlans user={user} />
          )}
        </main>
      </div>
    </div>
  );
}

// FINAL DO CÓDIGO ATUALIZADO v4.7 (Painel 100% Completo e Simplificado)