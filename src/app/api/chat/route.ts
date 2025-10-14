// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Pega a nossa nova chave do Gemini que vamos colocar na Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { message, tone } = await request.json();

    if (!message || !tone) {
      return new Response(JSON.stringify({ error: 'Mensagem e tom de voz são obrigatórios' }), { status: 400 });
    }

    // Pega o modelo "gemini-pro", que é super rápido e eficiente
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `Você é um assistente de atendimento via WhatsApp. Seu tom de voz deve ser: "${tone}". Responda de forma concisa e direta, como em um chat.`;

    const fullPrompt = `${systemPrompt}\n\nMensagem do cliente: "${message}"`;

    // Envia a pergunta para o Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const reply = response.text();

    // Devolve a resposta do Gemini para o nosso painel
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (error) {
    console.error('[CHAT_API_ERROR_GEMINI]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua mensagem com o Gemini.' }), { status: 500 });
  }
}