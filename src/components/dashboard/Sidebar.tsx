"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { 
  Users, 
  Target, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  UserCircle,
  ShoppingBag,
  Box,
  Trophy,
  Gift,
  Inbox,
  Megaphone,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const currentTab = searchParams.get("tab");
  const [role, setRole] = useState<string | null>(null);

  const logoUrl = "/logo-connecta.png";

  useEffect(() => {
    const savedRole = localStorage.getItem("user_role");
    setRole(savedRole);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user_role");
      toast({ title: "Sessão Encerrada", description: "Você saiu do sistema com segurança.", duration: 3000 });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao sair", description: "Não foi possível encerrar a sessão.", duration: 3000 });
    }
  };

  const isAdmin = role === "admin";
  const isCoord = role === "coordinator";
  const isLeader = role === "leader";

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: "Painel Estratégico", href: "/dashboard/admin?tab=bi", icon: BarChart3, tab: "bi" },
        { name: "Gestão de Usuários", href: "/dashboard/admin?tab=users", icon: Users, tab: "users" },
        { name: "Gestão de Missões", href: "/dashboard/admin?tab=missions", icon: ClipboardList, tab: "missions" },
        { name: "Comunicado Global", href: "/dashboard/admin?tab=broadcast", icon: Megaphone, tab: "broadcast" },
        { name: "Loja", href: "/dashboard/admin?tab=rewards", icon: Gift, tab: "rewards" },
        { name: "Ranking Global", href: "/dashboard/admin?tab=ranking", icon: Trophy, tab: "ranking" },
      ];
    }
    if (isCoord) {
      return [
        { name: "Painel Tático", href: "/dashboard/coordinator?tab=bi", icon: BarChart3, tab: "bi" },
        { name: "Minha Equipe", href: "/dashboard/coordinator?tab=team", icon: Users, tab: "team" },
        { name: "Missões e Entregas", href: "/dashboard/coordinator?tab=missions", icon: Inbox, tab: "missions" },
        { name: "Ranking", href: "/dashboard/coordinator?tab=ranking", icon: Trophy, tab: "ranking" },
      ];
    }
    if (isLeader) {
      return [
        { name: "Minhas Missões", href: "/dashboard/leader?tab=missions", icon: ClipboardList, tab: "missions" },
        { name: "Ranking Geral", href: "/dashboard/leader?tab=ranking", icon: Trophy, tab: "ranking" },
        { name: "Status", href: "/dashboard/leader?tab=operational", icon: Target, tab: "operational" },
        { name: "Chat", href: "/dashboard/leader?tab=chat", icon: MessageSquare, tab: "chat" },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <Sidebar variant="sidebar" className="border-r border-border">
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1">
            <Image 
              src={logoUrl} 
              alt="Connecta Logo" 
              fill
              className="object-contain rounded-xl shadow-lg"
              priority
              data-ai-hint="company logo"
            />
          </div>
          <span className="font-headline text-2xl tracking-tighter text-white">
            CONNECT<span className="text-primary">A</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 opacity-50">Operações</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = (pathname.includes(item.href.split('?')[0]) && currentTab === item.tab);
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href} className="gap-3 py-6 hover:text-primary transition-colors">
                          <item.icon className={isActive ? "text-primary" : "text-muted-foreground"} />
                          <span className="font-bold text-xs uppercase tracking-widest">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isAdmin && role && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 opacity-50">Ativos & Prêmios</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/store"}>
                    <Link href="/dashboard/store" className="gap-3 py-6">
                      <ShoppingBag className={pathname === "/dashboard/store" ? "text-primary" : "text-muted-foreground"} />
                      <span className="font-bold text-xs uppercase tracking-widest">Loja de Prêmios</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/chest"}>
                    <Link href="/dashboard/chest" className="gap-3 py-6">
                      <Box className={pathname === "/dashboard/chest" ? "text-primary" : "text-muted-foreground"} />
                      <span className="font-bold text-xs uppercase tracking-widest">Baú Digital</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 opacity-50">Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"}>
                  <Link href="/dashboard/profile" className="gap-3 py-6">
                    <UserCircle className={pathname === "/dashboard/profile" ? "text-primary" : "text-muted-foreground"} />
                    <span className="font-bold text-xs uppercase tracking-widest">Meu Perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border bg-black/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="bg-destructive hover:bg-destructive/90 text-white transition-colors cursor-pointer rounded-xl h-11 px-4 flex items-center justify-center gap-3 border-none shadow-lg" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 text-white" />
              <span className="font-bold uppercase tracking-widest text-[10px]">Encerrar Sessão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
