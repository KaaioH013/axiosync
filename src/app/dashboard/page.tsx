// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tone, setTone] = useState('vendedor simpático e prestativo');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Efeito para checar a sessão do usuário (já tínhamos)
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

  // NOVIDADE: Efeito para carregar o histórico de mensagens
  useEffect(() => {
    // Só roda se já sabemos quem é o usuário
    if (user) { 
      setLoading(true);
      async function fetchMessages() {
        const { data, error } = await supabase
          .from('messages')
          .select('*') // Pega todas as colunas
          .eq('user_id', user.id) // Apenas as mensagens DESTE usuário
          .order('created_at', { ascending: true }); // Em ordem cronológica

        if (data) {
          setMessages(data);
        }
        setLoading(false);
      }
      fetchMessages();
    }
  }, [user]); // Roda de novo se o 'user' mudar

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const userMessage: Message = { id: Date.now().toString(), content: newMessage, role: 'user' };

    // ATUALIZAÇÃO: Adiciona a mensagem à lista ATUAL de mensagens
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setNewMessage('');
    setIsSending(true);

    try {
      // ATUALIZAÇÃO: Envia o histórico completo na chamada da API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          tone: tone,
          userId: user.id, // Envia o ID do usuário
          history: messages, // Envia o histórico ANTES da nova mensagem
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = { id: Date.now().toString() + 'a', content: data.reply, role: 'assistant' };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Erro ao chamar API de chat:", error);
      // Adiciona uma mensagem de erro na tela se a API falhar
      const errorMessage: Message = { id: Date.now().toString() + 'e', content: "Desculpe, não consegui me conectar. Tente novamente.", role: 'assistant' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Se a página estiver carregando o usuário ou as mensagens, mostra uma tela de loading
  if (loading) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Carregando histórico...</div>;
  }

  // O resto do código visual é o mesmo que já tínhamos
  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ... o restante do seu código JSX do painel ... */}
        {/* (Header, colunas, chatbox - não precisa colar de novo, já está no código acima) */}
      </div>
    </div>
  );
}