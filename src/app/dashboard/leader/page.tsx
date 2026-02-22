
"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Camera, 
  Zap, 
  Trophy, 
  ClipboardList, 
  Loader2, 
  Clock, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Send,
  ShieldCheck,
  Crown,
  FileUp,
  UploadCloud,
  CheckCircle2,
  Activity,
  Target
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, limit } from "firebase/firestore";
import { format, addHours, differenceInMinutes, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const TEAMS = ["Equipe da Comunicação", "Equipe do Externo"];

function CountdownTimer({ createdAt, urgency, status }: { createdAt: string; urgency: string; status: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (status === "Concluída" || status === "Finalizada") return;

    const updateTimer = () => {
      const hoursToAdd = parseInt(urgency.split("h")[0]) || 3;
      const deadline = addHours(new Date(createdAt), hoursToAdd);
      const now = new Date();
      
      if (isAfter(now, deadline)) {
        setTimeLeft("EXPIRADA");
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
  }, [createdAt, urgency, status]);

  if (status === "Concluída" || status === "Finalizada") {
    return (
      <span className="text-green-500 font-black flex items-center gap-1 text-[10px] md:text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 h-4" /> ENTREGUE
      </span>
    );
  }

  return (
    <span className={`font-black flex items-center gap-1 text-[10px] md:text-xs ${timeLeft === "EXPIRADA" ? "text-red-500" : "text-primary"}`}>
      <Clock className="w-3.5 h-3.5 md:w-4 h-4" /> {timeLeft || "---"}
    </span>
  );
}

function LeaderDashboardContent() {
  const [isMounted, setIsMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "missions";
  
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [proofDescription, setProofDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [rankingTeam, setRankingTeam] = useState<string>("Todos");
  
  // Chat
  const [chatTarget, setChatTarget] = useState<"Coordenador" | "Equipe">("Coordenador");
  const [chatMsg, setChatMsg] = useState("");
  const [sessionMessages, setSessionMessages] = useState<Record<string, any[]>>({
    "Coordenador": [{ id: 'init-1', text: "Olá! Como está o progresso tático hoje?", sender: "Coordenador", time: "14:20", isMe: false }],
    "Equipe": [{ id: 'init-2', text: "Líderes, foco nas missões prioritárias.", sender: "Equipe", time: "09:15", isMe: false }]
  });
  
  // Status
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "userProfiles", user.uid);
  }, [db, user]);

  const { data: profile, isLoading: profileLoading } = useDoc(userDocRef);

  const missionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "missions"), orderBy("createdAt", "desc"), limit(4));
  }, [db, user]);

  const { data: missions, isLoading: missionsLoading } = useCollection(missionsQuery);
  const [coins, setCoins] = useState(1250);

  const handleOpenSubmit = (mission: any) => {
    setSelectedMission(mission);
    setProofDescription("");
    setAttachedFiles([]);
    setIsSubmitDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files));
      toast({ title: "Arquivo Vinculado", description: `${e.target.files.length} arquivo(s) prontos.` });
    }
  };

  const handleConfirmSubmission = () => {
    if (!selectedMission || !proofDescription.trim() || attachedFiles.length === 0) {
      toast({ variant: "destructive", title: "Dados Incompletos", description: "Descrição e arquivo são obrigatórios." });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      updateDocumentNonBlocking(doc(db, "missions", selectedMission.id), {
        status: "Concluída",
        deliveredAt: new Date().toISOString(),
        proofDescription: proofDescription,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Sincronizado! ☁️", description: "Evidências enviadas com sucesso." });
      setCoins(prev => prev + (selectedMission.reward || 0));
      setIsSubmitDialogOpen(false);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const newMessage = { id: Date.now().toString(), text: chatMsg, sender: "Você", time: format(new Date(), "HH:mm"), isMe: true };
    setSessionMessages(prev => ({ ...prev, [chatTarget]: [...prev[chatTarget], newMessage] }));
    toast({ title: "Mensagem Enviada", description: `Transmitido para ${chatTarget.toLowerCase()}.`, duration: 3000 });
    setChatMsg("");
  };

  const handleGenerateDiagnostic = () => {
    setIsGenerating(true);
    setShowDiagnostic(false);
    setTimeout(() => {
      setDiagnosticData({ ciclo: "Em andamento", pontoForte: "Entregas no prazo", pontoMelhoria: "Constância", emRisco: "0", acao: "Mantenha o ritmo atual." });
      setIsGenerating(false);
      setShowDiagnostic(true);
      toast({ title: "Relatório Gerado", description: "Dados táticos atualizados.", duration: 3000 });
    }, 2000);
  };

  const rankingData = useMemo(() => {
    const list = [
      { id: "1", name: user?.displayName || "Você", team: profile?.team || "Equipe da Comunicação", missionsDone: 42 },
      { id: "2", name: "Ricardo Silva", team: "Equipe da Comunicação", missionsDone: 38 },
      { id: "3", name: "Juliana Mendes", team: "Equipe do Externo", missionsDone: 35 },
      { id: "4", name: "Marcos Vinícius", team: "Equipe da Comunicação", missionsDone: 22 },
      { id: "5", name: "Ana Paula", team: "Equipe do Externo", missionsDone: 51 },
    ];
    let filtered = rankingTeam === "Todos" ? list : list.filter(item => item.team === rankingTeam);
    return filtered.sort((a, b) => b.missionsDone - a.missionsDone);
  }, [user, profile, rankingTeam]);

  const tabTitle = {
    missions: "Minhas Missões",
    chat: "Chat",
    ranking: "Ranking Geral",
    operational: "Status"
  }[currentTab as keyof typeof tabTitle] || "Painel";

  if (!isMounted || profileLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline text-white tracking-tight">
            {tabTitle.split(' ')[0]} <span className="text-primary">{tabTitle.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-muted-foreground text-[9px] md:text-[10px] uppercase tracking-widest font-black opacity-60">Sincronização Cloud Multi-Aparelho</p>
        </div>
        {profile?.team && (
          <Badge variant="secondary" className="bg-primary text-primary-foreground border-primary/20 h-9 md:h-10 px-4 md:px-6 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 shadow-md">
            <Briefcase className="w-3.5 h-3.5 md:w-4 h-4 text-white" /> {profile.team}
          </Badge>
        )}
      </div>

      <Tabs value={currentTab} className="w-full">
        <TabsContent value="missions" className="space-y-6 md:space-y-8 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-3xl mx-auto">
            <h2 className="text-lg md:text-xl font-headline flex items-center gap-2 text-white">
              <ClipboardList className="w-5 h-5 text-primary" /> Painel de Missões
            </h2>
            <div className="flex items-center gap-3 bg-secondary/50 px-5 md:px-6 py-2 rounded-full border border-primary/20 shadow-inner">
              <Zap className="w-4 h-4 text-primary fill-primary" />
              <span className="text-white font-black text-sm md:text-base">₵ {coins}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {missionsLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : missions?.map((mission) => (
              <Card key={mission.id} className="bg-card border-none hover:border-primary/20 transition-all overflow-hidden border-l-4 border-primary shadow-lg">
                <CardHeader className="py-4 px-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-secondary text-[8px] px-1.5 h-4 border border-white/5 uppercase">ID: {mission.id.slice(0,6)}</Badge>
                        <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" /> {format(new Date(mission.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <CardTitle className="text-sm md:text-base font-headline text-white">{mission.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-black text-xs md:text-sm">
                      ₵ {mission.reward}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-5 px-5">
                  <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed line-clamp-2 opacity-80">{mission.description}</p>
                  
                  <div className="flex items-center justify-between gap-3 p-3 bg-secondary/30 rounded-xl border border-white/5">
                    <div className="flex flex-wrap gap-3 items-center">
                      <CountdownTimer createdAt={mission.createdAt} urgency={mission.urgency} status={mission.status} />
                      <Badge variant="outline" className={`font-black text-[8px] px-2 h-4 ${mission.urgency?.includes("1h") ? "border-red-500 text-red-500" : "border-primary text-primary"}`}>
                        {mission.urgency}
                      </Badge>
                    </div>
                    {mission.status !== "Concluída" ? (
                      <Button onClick={() => handleOpenSubmit(mission)} className="bg-primary text-primary-foreground font-black px-4 h-8 text-[9px] md:text-[10px] uppercase rounded-lg">ENTREGAR</Button>
                    ) : <Badge className="bg-green-500/10 text-green-500 text-[8px] font-black uppercase">ENVIADA</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6 m-0 outline-none">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-headline flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-primary" /> Chat
              </h2>
              <div className="flex gap-2 bg-secondary/30 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
                <Button variant={chatTarget === "Coordenador" ? "default" : "ghost"} onClick={() => setChatTarget("Coordenador")} className={`flex-1 sm:flex-none h-8 text-[9px] font-black uppercase rounded-lg ${chatTarget === "Coordenador" ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Coordenador</Button>
                <Button variant={chatTarget === "Equipe" ? "default" : "ghost"} onClick={() => setChatTarget("Equipe")} className={`flex-1 sm:flex-none h-8 text-[9px] font-black uppercase rounded-lg ${chatTarget === "Equipe" ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Equipe</Button>
              </div>
            </div>

            <Card className="bg-card border-none shadow-2xl overflow-hidden border-t-4 border-primary">
              <div className="p-4 md:p-6 h-[350px] md:h-[400px] flex flex-col gap-4 overflow-y-auto bg-secondary/20 scroll-smooth">
                {sessionMessages[chatTarget].map((m) => (
                  <div key={m.id} className={`flex items-start gap-2 md:gap-3 ${m.isMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                      <AvatarFallback className={`${m.isMe ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'} font-black text-[9px]`}>{m.sender[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`${m.isMe ? 'bg-accent/10 border-accent/20 rounded-tr-none' : 'bg-primary/10 border-primary/20 rounded-tl-none'} p-3 rounded-2xl max-w-[85%] border shadow-sm`}>
                      <p className="text-xs md:text-sm text-white">{m.text}</p>
                      <span className="text-[8px] text-muted-foreground mt-1 block text-right">{m.sender} • {m.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5 bg-secondary/10">
                <div className="flex gap-3">
                  <Textarea placeholder="Mensagem..." className="bg-background border-white/5 min-h-[60px] text-xs focus:ring-primary rounded-xl" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} />
                  <Button onClick={handleSendChat} className="bg-primary text-primary-foreground h-auto aspect-square p-0 w-14 rounded-xl shadow-lg border-none"><Send className="w-5 h-5" /></Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6 md:space-y-8 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-5xl mx-auto">
            <h2 className="text-lg md:text-xl font-headline flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-primary" /> Ranking
            </h2>
            <div className="flex flex-wrap justify-center gap-2 bg-secondary/30 p-1 rounded-xl border border-white/5 w-full md:w-auto">
              {["Todos", ...TEAMS].map((t) => (
                <Button key={t} variant={rankingTeam === t ? "default" : "ghost"} onClick={() => setRankingTeam(t)} className={`h-8 text-[8px] md:text-[9px] font-black uppercase rounded-lg px-3 ${rankingTeam === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{t}</Button>
              ))}
            </div>
          </div>

          <Card className="bg-card border-none overflow-hidden border-t-4 border-primary max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="border-white/5">
                    <TableHead className="w-16 md:w-20 px-4 md:px-6 py-4 text-[9px] font-black uppercase">Rank</TableHead>
                    <TableHead className="text-[9px] font-black uppercase">Operador</TableHead>
                    <TableHead className="hidden md:table-cell text-[9px] font-black uppercase">Equipe</TableHead>
                    <TableHead className="text-right px-4 md:px-6 py-4 text-[9px] font-black uppercase">Missões</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankingData.map((item, idx) => (
                    <TableRow key={item.id} className={`border-white/5 ${item.name.includes("Você") ? "bg-primary/5" : "hover:bg-white/5 transition-colors"}`}>
                      <TableCell className="font-black text-base md:text-lg px-4 md:px-6">
                        <div className="flex items-center gap-2">
                          <span className={idx === 0 ? "text-primary" : "text-muted-foreground"}>#{idx + 1}</span>
                          {idx === 0 && <Crown className="w-3.5 h-3.5 text-primary" />}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-xs md:text-sm">{item.name}</span>
                          <span className="md:hidden text-[8px] text-primary font-black uppercase">{item.team}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[9px] font-black uppercase text-primary">{item.team}</TableCell>
                      <TableCell className="text-right px-4 md:px-6 text-primary font-black text-xs md:text-sm">{item.missionsDone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6 md:space-y-8 m-0 outline-none">
          <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
            <h2 className="text-lg md:text-xl font-headline flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-primary" /> Status do Operador
            </h2>
            <Card className="bg-card border-none border-l-4 border-primary shadow-2xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-4 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl md:text-2xl font-headline text-white">Status</h3>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 uppercase text-[9px] font-black">Ativo</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Desempenho</p>
                        <p className="text-xl md:text-2xl font-black text-white">0%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Nível</p>
                        <p className="text-xl md:text-2xl font-black text-primary">LVL 12</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center w-full sm:min-w-[160px] sm:w-auto">
                    <Zap className="w-7 h-7 md:w-8 md:h-8 text-primary fill-primary mb-2" />
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Saldo Atual</p>
                    <p className="text-xl md:text-2xl font-black text-white">₵ {coins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button onClick={handleGenerateDiagnostic} disabled={isGenerating} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 px-12 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 gap-3">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                {isGenerating ? "PROCESSANDO..." : "GERAR DIAGNÓSTICO"}
              </Button>
            </div>

            {showDiagnostic && diagnosticData && (
              <Card className="bg-secondary/20 border-white/5 shadow-2xl animate-in slide-in-from-top-2 duration-500">
                <CardHeader className="p-5 md:p-6 pb-2">
                  <CardTitle className="text-base md:text-lg font-headline flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Relatório Tático</CardTitle>
                </CardHeader>
                <CardContent className="p-5 md:p-6 pt-2 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1"><p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Ciclo</p><p className="text-xs md:text-sm font-bold text-white">{diagnosticData.ciclo}</p></div>
                    <div className="space-y-1"><p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Em Risco</p><p className="text-xs md:text-sm font-bold text-red-500">{diagnosticData.emRisco}</p></div>
                    <div className="space-y-1"><p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Ponto Forte</p><p className="text-xs md:text-sm font-bold text-green-400">{diagnosticData.pontoForte}</p></div>
                    <div className="space-y-1"><p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Melhoria</p><p className="text-xs md:text-sm font-bold text-orange-400">{diagnosticData.pontoMelhoria}</p></div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-2">Sugestão de Ação</p>
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl"><p className="text-xs md:text-sm text-white italic">"{diagnosticData.acao}"</p></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="bg-card border-white/10 text-white sm:max-w-[500px] p-0 overflow-hidden rounded-3xl w-[95%]">
          <div className="p-5 md:p-6 bg-secondary/30 border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-headline flex items-center gap-3"><UploadCloud className="w-6 h-6 text-primary" /> Sincronizar Prova</DialogTitle>
              <DialogDescription className="text-muted-foreground text-[10px] md:text-xs uppercase font-black tracking-widest mt-2">Missão: <span className="text-white">{selectedMission?.title}</span></DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-5 md:p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Anexar Evidências</Label>
              <div className="flex gap-3">
                <label className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer">
                  <Camera className="w-5 h-5 text-primary" /><span className="text-[9px] font-black">CÂMERA</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                </label>
                <label className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-white/10 bg-secondary/40 hover:bg-white/5 transition-all cursor-pointer">
                  <FileUp className="w-5 h-5 text-muted-foreground" /><span className="text-[9px] font-black">ARQUIVO</span>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {attachedFiles.length > 0 && <p className="text-[9px] text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {attachedFiles.length} arquivo(s) vinculados.</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Relatório de Execução</Label>
              <Textarea placeholder="Descreva os resultados..." className="bg-secondary/50 border-white/5 min-h-[100px] text-xs md:text-sm rounded-xl" value={proofDescription} onChange={(e) => setProofDescription(e.target.value)} />
            </div>
          </div>
          <div className="p-5 md:p-6 bg-secondary/20 border-t border-white/5">
            <DialogFooter className="flex flex-row gap-3">
              <Button variant="ghost" onClick={() => setIsSubmitDialogOpen(false)} className="flex-1 rounded-xl">Cancelar</Button>
              <Button onClick={handleConfirmSubmission} disabled={isSubmitting} className="flex-[2] bg-primary text-primary-foreground font-black rounded-xl gap-2 shadow-lg">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> TRANSMITIR</>}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LeaderDashboard() {
  return (
    <Suspense fallback={<div className="p-6 text-white flex items-center gap-2 font-black uppercase tracking-widest"><Loader2 className="w-5 h-5 animate-spin text-primary" /> Sincronizando...</div>}>
      <LeaderDashboardContent />
    </Suspense>
  );
}
