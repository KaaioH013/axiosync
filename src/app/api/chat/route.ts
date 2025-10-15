// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Agora recebemos também o "history" (histórico da conversa)
    const { message, tone, userId, history } = await request.json();

    if (!message || !tone || !userId || !history) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
    }

    // Salva a nova mensagem do usuário no banco de dados
    await supabaseAdmin.from('messages').insert({
      user_id: userId,
      content: message,
      role: 'user',
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const systemPrompt = `Você é um assistente de atendimento via WhatsApp. Seu tom de voz deve ser: "${tone}". Responda de forma concisa e direta, como em um chat.`;

    // NOVIDADE: Formata o histórico para o formato que o Gemini entende
    const formattedHistory = history.map((msg: { role: string, content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user', // O Gemini usa "model" em vez de "assistant"
      parts: [{ text: msg.content }],
    }));

    // Inicia um novo chat com o Gemini, agora com o histórico completo
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    });

    // Envia a nova mensagem para o chat que já tem o contexto
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    // Salva a resposta da IA no banco de dados
    await supabaseAdmin.from('messages').insert({
      user_id: userId,
      content: reply,
      role: 'assistant',
    });

    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (error) {
    console.error('[CHAT_API_ERROR_GEMINI_WITH_HISTORY]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua mensagem com o Gemini.' }), { status: 500 });
  }
}