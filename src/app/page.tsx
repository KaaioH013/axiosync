// src/app/page.tsx
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks"; // 1. Importe o novo componente

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <HowItWorks /> {/* 2. Adicione-o aqui */}
    </main>
  );
}