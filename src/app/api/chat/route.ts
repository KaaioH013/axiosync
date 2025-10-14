// src/app/api/chat/route.ts
import OpenAI from 'openai';

// Cria um "cliente" da OpenAI usando a chave secreta que guardamos na Vercel
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Esta função será chamada toda vez que nosso painel enviar uma mensagem
export async function POST(request: Request) {
  try {
    // Pega os dados enviados pelo painel (a mensagem e o tom de voz)
    const { message, tone } = await request.json();

    if (!message || !tone) {
      return new Response(JSON.stringify({ error: 'Mensagem e tom de voz são obrigatórios' }), { status: 400 });
    }

    const systemPrompt = `Você é um assistente de atendimento via WhatsApp. Seu tom de voz deve ser: "${tone}". Responda de forma concisa e direta, como em um chat.`;

    // Envia a pergunta para a OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Um modelo ótimo, rápido e mais barato
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const reply = response.choices[0].message.content;

    // Devolve a resposta da IA para o nosso painel
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (error) {
    console.error('[CHAT_API_ERROR]', error);
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua mensagem.' }), { status: 500 });
  }
}