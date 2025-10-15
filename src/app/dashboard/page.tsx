// INÍCIO DO CÓDIGO ATUALIZADO v3.3 (Completo e Final)

"use client";

import { useEffect, useState, useRef } from 'react';
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
  
  // Estados para a Base de Conhecimento
  const [knowledge, setKnowledge] = useState('');
  const [savingKnowledge, setSavingKnowledge] = useState(false);
  const [knowledgeSaveMessage, setKnowledgeSaveMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null); // Referência para o final do chat

  // --- SEÇÃO DE EFEITOS ---

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Efeito 2: Roda sempre que o 'user' for identificado, para carregar os dados
  useEffect(() => {
    if (user) {
      setLoading(true);
      async function fetchData() {
        if (!user) return;
        
        // Busca o histórico de mensagens
        const messagesPromise = supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
        
        // Busca a base de conhecimento
        const knowledgePromise = supabase.from('knowledge_base').select('content').eq('user_id', user.id).single();

        // Executa as duas buscas ao mesmo tempo para mais performance
        const [messagesResult, knowledgeResult] = await Promise.all([messagesPromise, knowledgePromise]);

        if (messagesResult.data) {
          setMessages(messagesResult.data);
        }
        if (knowledgeResult.data) {
          setKnowledge(knowledgeResult.data.content);
        }

        setLoading(false);
      }
      fetchData();
    }
  }, [user]);

  // --- SEÇÃO DE FUNÇÕES ---

  // Função para fazer logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Função para salvar a base de conhecimento
  const handleSaveKnowledge = async () => {
    if (!user) return;
    setSavingKnowledge(true);
    setKnowledgeSaveMessage('');

    // "Upsert" tenta atualizar. Se não existir, ele cria uma nova linha.
    // onConflict diz qual coluna usar para verificar se já existe.
    const { error } = await supabase
      .from('knowledge_base')
      .upsert({ user_id: user.id, content: knowledge }, { onConflict: 'user_id' });

    if (error) {
      setKnowledgeSaveMessage('Erro ao salvar.');
      console.error('Erro ao salvar conhecimento:', error);
    } else {
      setKnowledgeSaveMessage('Salvo com sucesso!');
    }
    setSavingKnowledge(false);
    // Limpa a mensagem de sucesso após 2 segundos
    setTimeout(() => setKnowledgeSaveMessage(''), 2000);
  };

  // Função para enviar uma nova mensagem
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
        body: JSON.stringify({
          message: newMessage,
          tone: tone,
          userId: user.id,
          history: historyToSend,
        }),
      });

      if (response.ok) {
        // Após a API responder com sucesso, busca a lista atualizada do banco de dados
        const { data } = await supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
        if (data) setMessages(data);
      } else {
         const errorMessage: Message = { id: Date.now().toString() + 'e', content: "Desculpe, a IA não conseguiu responder.", role: 'assistant' };
         setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error("Erro ao chamar API de chat:", error);
      const errorMessage: Message = { id: Date.now().toString() + 'e', content: "Desculpe, não consegui me conectar. Tente novamente.", role: 'assistant' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // --- SEÇÃO DE RENDERIZAÇÃO ---

  // Tela de Loading
  if (loading && messages.length === 0) {
    return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">Carregando dados...</div>;
  }

  // Tela Principal do Painel
  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto"> {/* Aumentei um pouco o max-w para mais espaço */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif">Painel AxioSync</h1>
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
              <h2 className="text-xl font-semibold mb-4">Base de Conhecimento</h2>
              <p className="text-sm text-gray-400 mb-4">
                Ensine sua IA. Insira aqui todas as informações sobre seu negócio, produtos, serviços e perguntas frequentes.
              </p>
              <textarea
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
                placeholder="Ex: Somos a SolPotente, instalamos painéis solares na região de Campinas. Nosso diferencial é a garantia de 25 anos. Financiamos em até 60x."
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
              <p className="text-lg font-medium text-brand-green">Plano de Teste Gratuito</p>
              <p className="text-sm text-gray-400 mt-2">Você tem 7 dias para testar todos os recursos.</p>
            </div>
          </div>
          
          {/* Coluna da Direita: IA */}
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
      </div>
    </div>
  );
}

// FINAL DO CÓDIGO ATUALIZADO v3.3 (Completo e Final)