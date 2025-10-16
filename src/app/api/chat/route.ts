// INÍCIO DO CÓDIGO ATUALIZADO v5.2 (API com Limpeza de Resposta)

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// --- FUNÇÃO DE "LIMPEZA" ---
function formatApiResponse(text: string): string {
  if (!text) return '';
  // 1. Remove as citações, como ou
  const textWithoutCitations = text.replace(/\/g, '');
  // 2. Converte o negrito do Markdown (**) para o formato do WhatsApp (*)
  const textWithWhatsappBold = textWithoutCitations.replace(/\*\*(.*?)\*\*/g, '*$1*');
  
  return textWithWhatsappBold.trim();
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { message, tone, userId, history } = await request.json();

    if (!message || !tone || !userId || history === undefined) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
    }
    
    await supabaseAdmin.from('messages').insert({ user_id: userId, content: message, role: 'user' });
    
    const { data: knowledgeData } = await supabaseAdmin.from('knowledge_base').select('content').eq('user_id', userId).single();
    let knowledgeBaseContent = "Nenhuma informação adicional foi fornecida.";
    if (knowledgeData && knowledgeData.content) {
      knowledgeBaseContent = knowledgeData.content;
    }

    const systemInstruction = `
        Você é um assistente de atendimento especialista. Seu tom de voz deve ser: "${tone}".
        Use a seguinte BASE DE CONHECIMENTO para responder às perguntas do usuário. Seja fiel a esta informação.
        BASE DE CONHECIMENTO:
        ---
        ${knowledgeBaseContent}
        ---
      `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Usando o modelo que você descobriu que funciona!
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }],
      }
    });

    const formattedHistory = history.map((msg: { role: string, content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const rawReply = response.text();

    // A MÁGICA ESTÁ AQUI: Limpamos a resposta ANTES de fazer qualquer outra coisa
    const cleanedReply = formatApiResponse(rawReply);

    // Salva a resposta JÁ LIMPA no banco de dados
    await supabaseAdmin.from('messages').insert({ user_id: userId, content: cleanedReply, role: 'assistant' });

    // Envia a resposta JÁ LIMPA de volta para o painel
    return new Response(JSON.stringify({ reply: cleanedReply }), { status: 200 });

  } catch (error) {
    console.error('[CHAT_API_ERROR_GEMINI]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua mensagem com o Gemini.' }), { status: 500 });
  }
}

// FINAL DO CÓDIGO ATUALIZADO v5.2 (API com Limpeza de Resposta)