// src/app/page.tsx
import { Header } from "@/components/Header"; // 1. Importamos o Header
import { Hero } from "@/components/Hero";

export default function HomePage() {
  return (
    <main>
      <Header /> {/* 2. Adicionamos o Header aqui, antes do Hero */}
      <Hero />
    </main>
  );
}