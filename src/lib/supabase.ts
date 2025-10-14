// src/lib/supabase.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

// Esta é uma função que cria o "conector" para ser usado no lado do navegador.
export const supabase = createPagesBrowserClient()