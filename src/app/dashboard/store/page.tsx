
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Gift, Coffee, Pizza, Laptop, PackageCheck, History, Plane } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const rewards = [
  { id: 1, name: "Voucher Coffee Break", price: 150, icon: Coffee, desc: "Vale café e acompanhamento na rede parceira." },
  { id: 2, name: "Almoço VIP", price: 450, icon: Pizza, desc: "Almoço completo com acompanhante." },
  { id: 3, name: "Dia de Home Office Extra", price: 750, icon: Laptop, desc: "Liberação de um dia extra de trabalho remoto." },
  { id: 4, name: "Viagem de Fim de Semana", price: 1000, icon: Plane, desc: "Pacote completo para destino nacional parceiro." },
];

export default function StorePage() {
  const [balance, setBalance] = useState(1250);
  const [acquisitions, setAcquisitions] = useState<any[]>([]);

  const handleRedeem = (item: typeof rewards[0]) => {
    if (balance >= item.price) {
      setBalance(prev => prev - item.price);
      setAcquisitions(prev => [{
        ...item,
        date: new Date().toLocaleDateString(),
        orderId: Math.floor(Math.random() * 900000) + 100000
      }, ...prev]);
      
      toast({
        title: "Resgate Efetuado! 🎁",
        description: `Você adquiriu ${item.name}. Verifique seu e-mail corporativo para as instruções.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Saldo Insuficiente",
        description: `Faltam ₵ ${item.price - balance} para este resgate.`,
      });
    }
  };

  return (
    <div className="p-6 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-headline text-white">Loja de <span className="text-primary">Recompensas</span></h1>
          <p className="text-muted-foreground uppercase text-[10px] font-black tracking-widest mt-1 opacity-60">Troque sua performance por benefícios reais</p>
        </div>
        <div className="bg-secondary px-8 py-4 rounded-3xl border border-primary/20 flex items-center gap-4 shadow-xl shadow-primary/5">
          <Zap className="w-6 h-6 text-accent fill-accent animate-pulse" />
          <div>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Saldo Disponível</div>
            <div className="text-3xl font-black text-accent tracking-tighter">₵ {balance}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((r) => (
          <Card key={r.id} className="bg-card border-none hover:translate-y-[-4px] transition-all group flex flex-col h-full">
            <CardHeader className="flex-1">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <r.icon className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-lg font-headline text-white">{r.name}</CardTitle>
              <CardDescription className="text-xs">{r.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-accent font-black text-2xl">
                <Zap className="w-5 h-5" /> ₵ {r.price}
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-4 border-t border-white/5">
              <Button 
                onClick={() => handleRedeem(r)}
                className="w-full bg-secondary hover:bg-primary text-white font-black h-12 rounded-xl transition-all uppercase text-[10px] tracking-widest"
              >
                RESGATAR
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Seção de Aquisições */}
      <div className="space-y-6 pt-8 border-t border-white/5">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-headline text-white">Minhas Aquisições</h2>
        </div>

        {acquisitions.length === 0 ? (
          <div className="bg-secondary/20 rounded-3xl p-12 text-center border border-dashed border-white/5">
            <PackageCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium italic">Nenhum resgate efetuado neste ciclo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acquisitions.map((a, idx) => (
              <div key={idx} className="bg-secondary/30 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{a.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">ID: #{a.orderId} • {a.date}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/5">Aprovado</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
