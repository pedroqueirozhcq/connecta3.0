
"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Target, 
  Activity, 
  Clock, 
  Trophy, 
  Star, 
  Inbox, 
  Send, 
  Briefcase, 
  Search, 
  CheckCircle2, 
  MessageSquare,
  Filter,
  Check,
  ClipboardList,
  AlertCircle,
  Medal,
  Award,
  ShieldCheck,
  Zap,
  Crown,
  Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addHours, differenceInMinutes, isAfter } from "date-fns";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function MissionTimer({ createdAt, urgency }: { createdAt: string; urgency: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const hoursToAdd = parseInt(urgency.split("h")[0]) || 3;
      const deadline = addHours(new Date(createdAt), hoursToAdd);
      const now = new Date();
      
      if (isAfter(now, deadline)) {
        setTimeLeft("ATRASADA");
        return;
      }

      const diff = differenceInMinutes(deadline, now);
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      setTimeLeft(`${h}h ${m}m restantes`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [createdAt, urgency]);

  return (
    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
      <Clock className="w-3.5 h-3.5 text-orange-400" /> 
      Prazo: <span className={timeLeft === "ATRASADA" ? "text-red-500" : "text-accent ml-1"}>{timeLeft}</span>
    </div>
  );
}

function StarRating({ rating, onRate }: { rating: number, onRate: (n: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onRate(n)}
          className="transition-all hover:scale-125 focus:outline-none"
        >
          <Star 
            className={`w-4.5 h-4.5 ${n <= rating ? "text-accent fill-accent" : "text-muted-foreground opacity-30"}`} 
          />
        </button>
      ))}
    </div>
  );
}

function CoordinatorDashboardContent() {
  const [isMounted, setIsMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "bi";
  const [message, setMessage] = useState("");
  const [sessionMessages, setSessionMessages] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deliverySearch, setDeliverySearch] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");

  const [rankingCategory, setRankingCategory] = useState<"Coordinator" | "Leader">("Leader");
  const [rankingTeam, setRankingTeam] = useState<string>("Todos");
  
  const [teamDeliveries, setTeamDeliveries] = useState<any[]>([]);
  const [operationalMissions, setOperationalMissions] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setTeamDeliveries([
      { id: "DEL-01", leaderName: "Ricardo Silva", missionTitle: "Auditoria Setor A", createdAt: new Date(Date.now() - 3600000).toISOString(), rating: 0, status: "Pendente" },
      { id: "DEL-02", leaderName: "Juliana Mendes", missionTitle: "Otimização Cloud", createdAt: new Date(Date.now() - 7200000).toISOString(), rating: 0, status: "Pendente" },
      { id: "DEL-03", leaderName: "Marcos Vinícius", missionTitle: "Sincronização de Dados", createdAt: new Date(Date.now() - 10800000).toISOString(), rating: 0, status: "Pendente" },
      { id: "DEL-04", leaderName: "Ana Paula", missionTitle: "Segurança de Redes", createdAt: new Date(Date.now() - 14400000).toISOString(), rating: 0, status: "Pendente" },
    ]);
    setOperationalMissions([
      { id: "OP-01", title: "Designar Tarefas do Ciclo de Equipe", description: "Organizar e distribuir as missões operacionais para os líderes da unidade.", urgency: "3h - Importante", reward: 800, createdAt: new Date().toISOString() },
      { id: "OP-02", title: "Criar Projeto de Aplicativo Interno", description: "Desenvolver o escopo técnico do novo sistema de gerenciamento de ativos.", urgency: "1h - Urgente", reward: 1500, createdAt: new Date().toISOString() }
    ]);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "userProfiles", user.uid);
  }, [db, user]);

  const { data: profile, isLoading: profileLoading } = useDoc(userDocRef);

  const teamLeadersQuery = useMemoFirebase(() => {
    if (!db || !profile?.team) return null;
    return query(
      collection(db, "userProfiles"), 
      where("team", "==", profile.team),
      where("profileType", "==", "Leader")
    );
  }, [db, profile?.team]);

  const { data: leaders, isLoading: leadersLoading } = useCollection(teamLeadersQuery);

  const metrics = [
    { name: "Líderes", value: leaders?.length?.toString() || "0", icon: Users, iconColor: "text-blue-400" },
    { name: "Missões em Curso", value: "2", icon: Activity, iconColor: "text-orange-400" },
    { name: "Meta Semanal", value: "64%", icon: Target, iconColor: "text-emerald-400", description: "Missões realizadas" },
    { name: "Média Resposta", value: "23m", icon: Clock, iconColor: "text-accent" },
  ];

  const simulatedLeaders = [
    { id: "s1", name: "Ricardo Silva", progress: 42 },
    { id: "s2", name: "Juliana Mendes", progress: 58 },
    { id: "s3", name: "Marcos Vinícius", progress: 35 },
    { id: "s4", name: "Ana Paula", progress: 67 },
  ];

  const filteredLeaders = useMemo(() => {
    if (!leaders) return [];
    return leaders.filter(l => 
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, leaders]);

  const filteredDeliveries = useMemo(() => {
    return teamDeliveries.filter(d => 
      d.missionTitle.toLowerCase().includes(deliverySearch.toLowerCase()) &&
      d.leaderName.toLowerCase().includes(participantSearch.toLowerCase())
    );
  }, [deliverySearch, participantSearch, teamDeliveries]);

  const handleRate = (id: string, rate: number) => {
    setTeamDeliveries(prev => prev.map(d => d.id === id ? { ...d, rating: rate } : d));
  };

  const handleSendEvaluation = (id: string) => {
    const delivery = teamDeliveries.find(d => d.id === id);
    if (!delivery || delivery.rating === 0) {
      toast({ variant: "destructive", title: "Erro na Avaliação", description: "Selecione uma nota em estrelas antes de enviar." });
      return;
    }
    setTeamDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: "Avaliada" } : d));
    toast({ title: "Missão Avaliada", description: `A nota de ${delivery.leaderName} foi registrada no sistema.` });
  };

  const handleSendMessage = (leaderId: string, leaderName: string) => {
    if (!message.trim()) return;
    setSessionMessages(prev => ({
      ...prev,
      [leaderId]: [...(prev[leaderId] || []), message]
    }));
    toast({ title: "Mensagem enviada", description: `As orientações foram transmitidas para ${leaderName}.` });
    setMessage("");
  };

  const rankingData = useMemo(() => {
    const baseData = [
      { id: "r1", name: "Ricardo Silva", role: "Leader", team: "Equipe da Comunicação", missions: 45 },
      { id: "r2", name: "Juliana Mendes", role: "Leader", team: "Equipe do Externo", missions: 38 },
      { id: "r3", name: "Marcos Vinícius", role: "Leader", team: "Equipe da Comunicação", missions: 22 },
      { id: "r4", name: "Ana Paula", role: "Leader", team: "Equipe do Externo", missions: 51 },
      { id: "c1", name: "Pedro Queiroz", role: "Coordinator", team: "Equipe da Comunicação", missions: 85 },
      { id: "c2", name: "Carla Souza", role: "Coordinator", team: "Equipe do Externo", missions: 79 },
    ];
    return baseData
      .filter(item => item.role === rankingCategory)
      .filter(item => rankingTeam === "Todos" || item.team === rankingTeam)
      .sort((a, b) => b.missions - a.missions);
  }, [rankingCategory, rankingTeam]);

  if (!isMounted || profileLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const currentTabLabel = currentTab === "bi" ? "Painel Tático" : currentTab === "team" ? "Minha Equipe" : currentTab === "missions" ? "Missões e Entregas" : "Ranking";

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-headline text-white tracking-tight">{currentTabLabel.split(' ')[0]} <span className="text-primary">{currentTabLabel.split(' ').slice(1).join(' ')}</span></h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold opacity-60">Gestão de Equipe e Performance</p>
        </div>
        {profile?.team && (
          <Badge variant="secondary" className="bg-primary text-primary-foreground border-primary/20 h-9 px-5 rounded-lg font-black uppercase tracking-widest text-[11px] gap-2 shadow-md">
            <Briefcase className="w-4 h-4" /> {profile.team}
          </Badge>
        )}
      </div>

      <Tabs value={currentTab} className="w-full">
        <TabsContent value="bi" className="space-y-4 m-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name} className="bg-card border-none shadow-lg border-b-2 border-accent min-h-[100px] flex flex-col justify-center p-6">
                <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-0 mb-3">
                  <div className="flex flex-col">
                    <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{metric.name}</CardTitle>
                    {metric.description && <span className="text-[10px] text-accent font-bold uppercase mt-1">{metric.description}</span>}
                  </div>
                  <div className={`p-2.5 rounded-lg bg-secondary/50 ${metric.iconColor}`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-black text-white">{leadersLoading ? "..." : metric.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-none border-l-4 border-primary shadow-xl">
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-base font-headline">Desempenho da Equipe</CardTitle>
              <CardDescription className="text-xs">Monitoramento em tempo real dos líderes ativos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-2 px-6 pb-8">
              {simulatedLeaders.map((leader) => (
                <div key={leader.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-accent/10 text-accent font-bold text-[10px]">{leader.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-white font-medium">{leader.name}</span>
                    </div>
                    <span className="text-xs text-accent font-black">{leader.progress}% Concluído</span>
                  </div>
                  <Progress value={leader.progress} className="h-1.5" indicatorClassName="bg-accent" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h2 className="text-xl font-headline text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" /> Líderes
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Filtrar por nome ou e-mail..." 
                className="bg-card border-white/5 pl-10 h-10 text-sm focus:ring-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {leadersLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeaders.map((leader) => (
                <Card key={leader.id} className="bg-card border-none p-5 hover:border-accent/20 transition-all border border-transparent shadow-md">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-11 w-11 rounded-lg ring-1 ring-accent/20">
                        <AvatarFallback className="bg-accent/10 text-accent font-bold text-xs">{leader.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-sm">{leader.fullName}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">{leader.email}</p>
                        <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] px-2 h-4 font-black uppercase tracking-widest mt-1">
                          ATIVO
                        </Badge>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-accent/20 text-accent hover:bg-accent/10 gap-2 font-black h-10 px-6 rounded-lg uppercase tracking-widest text-[11px]">
                          <MessageSquare className="w-4 h-4" /> Chat
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-white/10 text-white sm:max-w-[450px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">{leader.fullName[0]}</div>
                            <div className="text-left">
                              <div className="text-lg font-headline">Chat: {leader.fullName}</div>
                              <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Canal de Orientação</div>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-secondary/20 p-5 rounded-xl border border-white/5 min-h-[150px] max-h-[300px] overflow-y-auto flex flex-col gap-4">
                            {sessionMessages[leader.id]?.map((msg, idx) => (
                              <div key={idx} className="bg-accent/20 p-3.5 rounded-2xl rounded-tr-none self-end max-w-[85%] border border-accent/30 animate-in fade-in slide-in-from-right-1">
                                <p className="text-sm text-white">{msg}</p>
                                <span className="text-[10px] text-muted-foreground mt-2 block text-right">Mensagem enviada</span>
                              </div>
                            ))}
                          </div>
                          <Textarea 
                            placeholder="Instruções ou orientações..." 
                            className="bg-secondary border-white/5 min-h-[80px] text-sm focus:ring-accent"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => handleSendMessage(leader.id, leader.fullName)}
                            className="w-full bg-accent text-accent-foreground font-black h-12 rounded-lg gap-2 text-xs uppercase tracking-widest"
                          >
                            <Send className="w-4 h-4" /> ENVIAR
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="missions" className="space-y-8 m-0 outline-none">
          <div className="space-y-6">
            <h2 className="text-xl font-headline text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-400" /> Missões Designadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {operationalMissions.map(m => (
                <Card key={m.id} className="bg-card border-none border-b-2 border-accent overflow-hidden group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{m.title}</h3>
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[10px] font-black uppercase tracking-widest px-2 h-5">
                        {m.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{m.description}</p>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <MissionTimer createdAt={m.createdAt} urgency={m.urgency} />
                      <div className="text-accent font-black text-xs">₵ {m.reward}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-headline text-white flex items-center gap-2">
                <Inbox className="w-6 h-6 text-accent" /> Avaliação de Entregas
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredDeliveries.map(delivery => (
                <Card key={delivery.id} className={`bg-secondary/5 border-white/5 border-l-4 transition-all ${delivery.status === 'Avaliada' ? 'border-green-500 opacity-60' : 'border-accent'}`}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{delivery.leaderName[0]}</div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{delivery.missionTitle}</h3>
                          <p className="text-[10px] text-white font-black uppercase tracking-widest">{delivery.leaderName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Performance</span>
                        <StarRating 
                          rating={delivery.rating} 
                          onRate={(n) => delivery.status !== 'Avaliada' && handleRate(delivery.id, n)} 
                        />
                      </div>

                      {delivery.status === 'Avaliada' ? (
                        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest border border-green-500/20">
                          <Check className="w-4 h-4" /> AVALIADA
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleSendEvaluation(delivery.id)}
                          className="bg-accent text-accent-foreground font-black text-xs uppercase tracking-widest h-11 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform gap-2"
                        >
                          <Send className="w-4 h-4" /> ENVIAR NOTA
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-headline text-white flex items-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-500" /> Classificação
            </h2>
            <div className="flex flex-wrap gap-2.5">
              <Button 
                variant={rankingCategory === "Coordinator" ? "default" : "secondary"} 
                onClick={() => { setRankingCategory("Coordinator"); setRankingTeam("Todos"); }}
                size="sm"
                className={`h-9 text-[11px] font-black uppercase tracking-widest ${rankingCategory === "Coordinator" ? "bg-accent text-accent-foreground" : ""}`}
              >
                Coordenadores
              </Button>
              <Button 
                variant={rankingCategory === "Leader" ? "default" : "secondary"} 
                onClick={() => setRankingCategory("Leader")}
                size="sm"
                className={`h-9 text-[11px] font-black uppercase tracking-widest ${rankingCategory === "Leader" ? "bg-accent text-accent-foreground" : ""}`}
              >
                Líderes
              </Button>
            </div>
          </div>

          <Card className="bg-card border-none overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="border-white/5">
                  <TableHead className="w-20 text-center">Pos</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead className="text-right px-10">Missões</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((item, index) => (
                  <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-center font-black text-lg text-muted-foreground">
                      #{index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent/10 text-accent font-black text-xs">{item.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-white font-bold">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase">
                        {item.team}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10 text-accent font-black">
                      {item.missions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CoordinatorDashboard() {
  return (
    <Suspense fallback={<div className="p-6 text-white flex items-center gap-2 font-black uppercase tracking-widest"><Loader2 className="w-5 h-5 animate-spin text-primary" /> Sincronizando...</div>}>
      <CoordinatorDashboardContent />
    </Suspense>
  );
}
