"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function WelcomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const logoUrl = "/logo-connecta.png";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Glow de fundo Roxo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-primary/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <div className="z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-700 w-full">
        <div className="relative h-24 w-24 transition-all duration-500 hover:scale-110 hover:-translate-y-1 cursor-pointer group">
          <Image 
            src={logoUrl} 
            alt="Connecta Logo" 
            fill
            className="object-contain rounded-xl shadow-2xl group-hover:shadow-primary/40 transition-shadow"
            priority
            data-ai-hint="company logo"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-headline tracking-tighter text-white">
            CONNECT<span className="text-primary">A</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed px-4 opacity-80">
            Gestão estratégica de missões e equipes de alto impacto.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
          <Button 
            asChild
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 text-xl group rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all border-none"
          >
            <Link href="/login">
              ENTRAR
              <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>

      <footer className="absolute bottom-10 left-0 right-0 text-center text-muted-foreground/30 text-[9px] font-bold uppercase tracking-[0.2em] space-y-2 px-6">
        <p>© 2024 CONNECTA SYSTEM • SECURE ACCESS ONLY</p>
        <p className="text-primary/40 tracking-widest font-black uppercase">Desenvolvido por Pedro Queiroz</p>
      </footer>
    </div>
  );
}
