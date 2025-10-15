// INÍCIO DO CÓDIGO ATUALIZADO v3.2 (Diagnóstico Final)

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

    if (!message || !tone || !userId || history === undefined) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
    }

    await supabaseAdmin.from('messages').insert({ user_id: userId, content: message, role: 'user' });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const formattedHistory = history.map((msg: { role: string, content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    // LUZ DE DIAGNÓSTICO FINAL: O que tem dentro da "caixa" que o Gemini enviou?
    console.log("RESPOSTA BRUTA DO GEMINI:", JSON.stringify(response, null, 2));

    const reply = response.text();

    await supabaseAdmin.from('messages').insert({ user_id: userId, content: reply, role: 'assistant' });

    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (error) {
    console.error('[ERRO DETALHADO NO CATCH]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua mensagem com o Gemini.' }), { status: 500 });
  }
}

// FINAL DO CÓDIGO ATUALIZADO v3.2 (Diagnóstico Final)