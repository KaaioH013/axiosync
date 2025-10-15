// INÍCIO DO CÓDIGO ATUALIZADO v3.0 (Diagnóstico)

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { message, tone, userId, history } = await request.json();

    // LUZ DE DIAGNÓSTICO 1: O que a API está recebendo?
    console.log("--- INÍCIO DA REQUISIÇÃO ---");
    console.log("API Recebeu:", { message, tone, userId, history_length: history.length });

    if (!message || !tone || !userId || history === undefined) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
    }

    await supabaseAdmin.from('messages').insert({ user_id: userId, content: message, role: 'user' });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Corrigido para o modelo que você descobriu
    
    const systemPrompt = `Você é um assistente de atendimento via WhatsApp. Seu tom de voz deve ser: "${tone}". Responda de forma concisa e direta, como em um chat.`;

    const formattedHistory = history.map((msg: { role: string, content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // LUZ DE DIAGNÓSTICO 2: Como o histórico foi formatado para o Gemini?
    console.log("Histórico Formatado para Gemini:", JSON.stringify(formattedHistory, null, 2));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    await supabaseAdmin.from('messages').insert({ user_id: userId, content: reply, role: 'assistant' });

    console.log("Resposta da IA enviada com sucesso.");
    console.log("--- FIM DA REQUISIÇÃO ---");

    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (error) {
    // LUZ DE DIAGNÓSTICO 3: Se der erro, qual foi o erro exato?
    console.error('[ERRO DETALHADO NO CATCH]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua mensagem com o Gemini.' }), { status: 500 });
  }
}

// FINAL DO CÓDIGO ATUALIZADO v3.0 (Diagnóstico)