
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Settings, ShieldCheck, Zap, Star, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function PerformanceSeals() {
  const seals = [
    { name: "Invicto", icon: ShieldCheck, color: "text-blue-400", desc: "10 missões sem falhas" },
    { name: "Veloz", icon: Zap, color: "text-accent", desc: "Conclusão em < 24h" },
    { name: "Executor", icon: Star, color: "text-primary", desc: "Top 3 do Ranking" },
    { name: "Elite", icon: Crown, color: "text-purple-400", desc: "Nível 10 alcançado" },
  ];

  return (
    <div className="flex items-center gap-2 mr-4">
      <TooltipProvider>
        <div className="flex gap-1.5">
          {seals.map((seal) => (
            <Tooltip key={seal.name}>
              <TooltipTrigger asChild>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 cursor-help hover:bg-white/10 transition-colors">
                  <seal.icon className={`w-3.5 h-3.5 ${seal.color}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-card border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white">{seal.name}</p>
                <p className="text-[9px] text-muted-foreground">{seal.desc}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

export default function Header() {
  const userImage = PlaceHolderImages.find(img => img.id === "user-avatar")?.imageUrl;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar missões, usuários..." 
            className="pl-10 w-64 bg-secondary border-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PerformanceSeals />
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
        <div className="w-px h-6 bg-border mx-2" />
        <Link href="/dashboard/profile">
          <Avatar className="h-9 w-9 ring-2 ring-accent/20 ring-offset-2 ring-offset-background cursor-pointer hover:scale-105 transition-transform">
            <AvatarImage src={userImage} alt="User" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
