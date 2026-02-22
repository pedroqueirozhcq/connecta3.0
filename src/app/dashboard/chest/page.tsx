
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, Trophy, Medal, Star, ShieldCheck, Zap, Award, Crown } from "lucide-react";

export default function ChestPage() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline text-white uppercase tracking-tighter">Meu <span className="text-primary">Baú Digital</span></h1>
          <p className="text-muted-foreground uppercase text-xs font-bold tracking-[0.3em]">Cofre de conquistas e medalhas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card/40 backdrop-blur-xl border-primary/20 p-8 flex flex-col items-center text-center shadow-2xl group hover:border-primary/50 transition-all">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-primary/20 group-hover:scale-110 transition-transform">
              <Zap className="w-12 h-12 text-primary fill-primary" />
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Moedas Acumuladas</h3>
            <div className="text-4xl font-black text-white">₵ 1.250</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border-accent/20 p-8 flex flex-col items-center text-center shadow-2xl group hover:border-accent/50 transition-all">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6 ring-4 ring-accent/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-12 h-12 text-accent fill-accent" />
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Troféus Ativos</h3>
            <div className="text-4xl font-black text-white">08</div>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border-border p-8 flex flex-col items-center text-center shadow-2xl group hover:border-white/20 transition-all">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 ring-4 ring-white/5 group-hover:scale-110 transition-transform">
              <Medal className="w-12 h-12 text-white fill-white" />
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Medalhas</h3>
            <div className="text-4xl font-black text-white">12</div>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-headline text-white mt-12 mb-6 flex items-center gap-2">
            <Award className="text-primary w-6 h-6" /> Selo de Alta Performance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Invicto", icon: ShieldCheck, color: "text-blue-400", desc: "10 missões sem falhas" },
              { name: "Veloz", icon: Zap, color: "text-accent", desc: "Conclusão em < 24h" },
              { name: "Executor", icon: Star, color: "text-primary", desc: "Top 3 do Ranking" },
              { name: "Elite", icon: Crown, color: "text-purple-400", desc: "Nível 10 alcançado" },
            ].map((i) => (
              <div key={i.name} className="p-6 bg-secondary/30 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors">
                <i.icon className={`w-10 h-10 ${i.color}`} />
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">{i.name}</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{i.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12">
          <h2 className="text-xl font-headline text-white mb-6">Galeria de Conquistas</h2>
          <Card className="bg-card/20 border-white/5 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-xl border border-white/5">
               <Trophy className="w-8 h-8 text-accent" />
               <div>
                 <p className="text-sm font-bold text-white">Campeão de Ciclo</p>
                 <p className="text-[10px] text-muted-foreground">Vencido em Outubro/2024</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-xl border border-white/5">
               <Medal className="w-8 h-8 text-primary" />
               <div>
                 <p className="text-sm font-bold text-white">Pioneiro Connecta</p>
                 <p className="text-[10px] text-muted-foreground">Primeiros 100 usuários</p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
