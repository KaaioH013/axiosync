// src/components/HowItWorks.tsx

// Este componente é um ícone que usaremos na seção.
// Não se preocupe em entender, apenas copie.
function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-blue p-4 rounded-full mb-6">
      {children}
    </div>
  );
}

// Este é o componente da seção "Como Funciona"
export function HowItWorks() {
  const steps = [
    {
      title: "1. Conecte seu WhatsApp",
      description: "Integre seu número em segundos com nossa plataforma segura e comece a automatizar."
    },
    {
      title: "2. Personalize a IA",
      description: "Defina o tom de voz e as informações que sua IA deve usar para responder como um humano."
    },
    {
      title: "3. Deixe a Mágica Acontecer",
      description: "Nossa IA atenderá seus clientes 24/7, seguindo suas instruções e aumentando suas vendas."
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-black">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Comece a usar em 3 Passos Simples
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-12">
          Transformar seu atendimento é mais fácil do que você imagina.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center p-8 bg-gray-900/50 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};