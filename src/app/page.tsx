// src/app/page.tsx
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Plans } from "@/components/Plans"; // 1. Importe aqui

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <HowItWorks />
      <Plans /> {/* 2. Adicione aqui */}
    </main>
  );
}