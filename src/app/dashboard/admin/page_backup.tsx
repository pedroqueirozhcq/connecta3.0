
"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead, TableCell as TableCellUI } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Activity,
  Trash2,
  Loader2,
  TrendingUp,
  Database,
  CheckCircle2,
  Edit3,
  ShieldAlert,
  AlertTriangle,
  Send,
  Timer,
  Clock,
  Calendar,
  Trophy,
  Medal,
  Briefcase,
  Zap,
  ShoppingBag,
  Plane,
  XCircle,
  CheckCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, useUser, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc, addDoc } from "firebase/firestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const dataBI = [
  { name: 'Jan', missoes: 400, moedas: 2400 },
  { name: 'Fev', missoes: 300, moedas: 1398 },
  { name: 'Mar', missoes: 600, moedas: 9800 },
  { name: 'Abr', missoes: 278, moedas: 3908 },
  { name: 'Mai', missoes: 489, moedas: 4800 },
  { name: 'Jun', missoes: 590, moedas: 6800 },
];

const roleLabels: Record<string, string> = {
  Admin: "Administrador",
  Coordinator: "Coordenador",
  Leader: "Líder"
};

const teams = ["Equipe da Comunicação", "Equipe do Externo"];

const MOCK_USER_IDS = ["demo-user-1", "demo-user-2", "demo-user-3", "demo-user-4"];
const MOCK_MISSION_IDS = ["demo-mission-1", "demo-mission-2", "demo-mission-3", "demo-mission-4", "demo-mission-5"];

function AdminDashboardContent() {
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "bi";
  
  const usersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "userProfiles"), orderBy("fullName", "asc"));
  }, [db, user]);

  const missionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "missions"), orderBy("createdAt", "desc"));
  }, [db, user]);
  
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: missions, isLoading: missionsLoading } = useCollection(missionsQuery);

  const [isDemoDataActive, setIsDemoDataActive] = useState(false);

  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [isEditRewardOpen, setIsEditRewardOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isMissionDeleteConfirmOpen, setIsMissionDeleteConfirmOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState({ fullName: "", email: "", team: "" });
  const [editRewardData, setEditRewardData] = useState({ title: "", cost: 0, target: "Todos", description: "" });
  const [newRole, setNewRole] = useState("");

  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [msgTarget, setMsgTarget] = useState("Todos");
  
  const [missionFilter, setMissionFilter] = useState("Todas");
  const [userFilter, setUserFilter] = useState("Todos");
  const [rankingFilter, setRankingFilter] = useState("Todos");
  const [rankingTeam, setRankingTeam] = useState("Todos");

  const [newMission, setNewMission] = useState({ title: "", urgency: "3h - Importante", reward: 100, description: "" });
  const [newReward, setNewReward] = useState({ title: "", cost: 500, target: "Todos", description: "" });
  const [newUser, setNewUser] = useState({ fullName: "", email: "", profileType: "Leader", team: "Equipe da Comunicação" });

  const [rewardsList, setRewardsList] = useState([
    { id: '1', title: 'Voucher Coffee Break', cost: 150, target: 'Todos', description: 'Vale café e acompanhamento na rede parceira.' },
    { id: '2', title: 'Almoço VIP', cost: 450, target: 'Líder', description: 'Almoço completo com acompanhante.' },
    { id: '3', title: 'Dia de Home Office Extra', cost: 750, target: 'Equipe', description: 'Liberação de um dia de trabalho remoto fora da escala.' },
    { id: '4', title: 'Viagem de Fim de Semana', cost: 1000, target: 'Coordenador', description: 'Pacote completo para destino nacional parceiro.' },
  ]);

  const calculateExecutionTime = (createdAt: string, deliveredAt?: string | null) => {
    if (!deliveredAt) return "Pendente";
    const start = new Date(createdAt);
    const end = new Date(deliveredAt);
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const hours = Math.floor(diffInMinutes / 60);
    const mins = Math.floor(diffInMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const handleSeedData = () => {
    if (!isDemoDataActive) {
      // PROVISIONAR DADOS
      const mockUsers = [
        { id: "demo-user-1", fullName: "MOCK ADMIN", email: "admin.mock@connecta.com", profileType: "Admin", team: "Equipe da Comunicação" },
        { id: "demo-user-2", fullName: "MOCK COORD", email: "coord.mock@connecta.com", profileType: "Coordinator", team: "Equipe da Comunicação" },
        { id: "demo-user-3", fullName: "MOCK LEADER 1", email: "leader1.mock@connecta.com", profileType: "Leader", team: "Equipe do Externo" },
        { id: "demo-user-4", fullName: "MOCK LEADER 2", email: "leader2.mock@connecta.com", profileType: "Leader", team: "Equipe da Comunicação" },
      ];

      mockUsers.forEach(u => {
        setDocumentNonBlocking(doc(db, "userProfiles", u.id), {
          ...u,
          jobTitle: `${roleLabels[u.profileType]} Demo`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setDocumentNonBlocking(doc(db, `roles_${u.profileType.toLowerCase()}`, u.id), { active: true }, { merge: true });
      });

      const demoMissionsTemplates = [
        { title: "Demo: Auditoria de Segurança", status: "Em Andamento", urgency: "1h - Urgente", reward: 1200, description: "Revisão de logs de acesso e políticas de nuvem." },
        { title: "Demo: Workshop de Performance", status: "Concluída", urgency: "3h - Importante", reward: 800, description: "Capacitação técnica para novos líderes operacionais." },
        { title: "Demo: Sincronização de Banco", status: "Finalizada", urgency: "5h - Pouco Urgente", reward: 500, description: "Migração de dados legados para o novo ecossistema." },
      ];

      MOCK_MISSION_IDS.forEach((id, i) => {
        const template = demoMissionsTemplates[i % demoMissionsTemplates.length];
        const createdAt = new Date(Date.now() - i * 3600000).toISOString();
        const deliveredAtValue = template.status === "Concluída" ? new Date(new Date(createdAt).getTime() + (Math.random() * 4 * 3600000)).toISOString() : null;

        setDocumentNonBlocking(doc(db, "missions", id), {
          ...template,
          id,
          assignedLeaderId: "demo-user-3",
          createdAt,
          deliveredAt: deliveredAtValue,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });

      setIsDemoDataActive(true);
      toast({ title: "Dados Demo Ativados", description: "O ecossistema foi populado com usuários e missões de teste." });
    } else {
      // REMOVER DADOS
      MOCK_USER_IDS.forEach(id => {
        deleteDocumentNonBlocking(doc(db, "userProfiles", id));
        deleteDocumentNonBlocking(doc(db, "roles_admin", id));
        deleteDocumentNonBlocking(doc(db, "roles_coordinator", id));
        deleteDocumentNonBlocking(doc(db, "roles_leader", id));
      });

      MOCK_MISSION_IDS.forEach(id => {
        deleteDocumentNonBlocking(doc(db, "missions", id));
      });

      setIsDemoDataActive(false);
      toast({ title: "Dados Demo Removidos", description: "Todos os registros de teste foram excluídos com segurança." });
    }
  };

  const handleCreateMission = () => {
    if (!newMission.title || !newMission.description) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha os campos obrigatórios." });
      return;
    }

    const createdAt = new Date().toISOString();
    addDoc(collection(db, "missions"), {
      ...newMission,
      status: "Em Andamento",
      assignedLeaderId: "global",
      createdAt,
      deliveredAt: null,
      updatedAt: createdAt
    });

    toast({ title: "Missão Lançada", description: "A nova missão estratégica foi publicada na nuvem." });
    setIsMissionOpen(false);
    setNewMission({ title: "", urgency: "3h - Importante", reward: 100, description: "" });
  };

  const handleCreateReward = () => {
    if (!newReward.title || !newReward.cost) {
      toast({ variant: "destructive", title: "Erro", description: "Título e Custo são obrigatórios." });
      return;
    }
    const id = Date.now().toString();
    setRewardsList(prev => [...prev, { ...newReward, id }]);
    toast({ title: "Recompensa Cadastrada", description: `Item "${newReward.title}" adicionado à loja.` });
    setIsRewardOpen(false);
    setNewReward({ title: "", cost: 500, target: "Todos", description: "" });
  };

  const handleUpdateReward = () => {
    if (!selectedReward) return;
    setRewardsList(prev => prev.map(r => r.id === selectedReward.id ? { ...editRewardData, id: r.id } : r));
    toast({ title: "Prêmio Atualizado", description: `O item "${editRewardData.title}" foi modificado.` });
    setIsEditRewardOpen(false);
    setSelectedReward(null);
  };

  const handleRemoveReward = (id: string) => {
    setRewardsList(prev => prev.filter(r => r.id !== id));
    toast({ title: "Item Removido", description: "O prêmio foi retirado da vitrine." });
  };

  const handleCreateUser = () => {
    if (!newUser.fullName || !newUser.email) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha os campos obrigatórios." });
      return;
    }
    const tempId = `user-${Date.now()}`;
    setDocumentNonBlocking(doc(db, "userProfiles", tempId), {
      ...newUser,
      id: tempId,
      jobTitle: `${roleLabels[newUser.profileType]} do Sistema`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    setDocumentNonBlocking(doc(db, `roles_${newUser.profileType.toLowerCase()}`, tempId), { active: true }, { merge: true });

    toast({ title: "Usuário Provisionado", description: "O novo membro foi cadastrado e alocado na equipe." });
    setIsUserOpen(false);
    setNewUser({ fullName: "", email: "", profileType: "Leader", team: "Equipe da Comunicação" });
  };

  const confirmDeleteMission = () => {
    if (!selectedMissionId) return;
    deleteDocumentNonBlocking(doc(db, "missions", selectedMissionId));
    toast({ title: "Missão Removida", description: "O registro foi excluído do sistema." });
    setIsMissionDeleteConfirmOpen(false);
    setSelectedMissionId(null);
  };

  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    deleteDocumentNonBlocking(doc(db, "userProfiles", selectedUser.id));
    const roleKey = selectedUser.profileType.toLowerCase();
    deleteDocumentNonBlocking(doc(db, `roles_${roleKey}`, selectedUser.id));
    toast({ title: "Usuário Removido", description: `${selectedUser.fullName} foi excluído do sistema.` });
    setIsDeleteConfirmOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateDocumentNonBlocking(doc(db, "userProfiles", selectedUser.id), {
      fullName: editUserData.fullName,
      email: editUserData.email,
      team: editUserData.team,
      updatedAt: new Date().toISOString()
    });
    toast({ title: "Perfil Atualizado", description: "As informações do usuário foram salvas na nuvem." });
    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  const handleChangeUserRole = () => {
    if (!selectedUser || !newRole) return;
    const oldRoleKey = selectedUser.profileType.toLowerCase();
    const newRoleKey = newRole.toLowerCase();
    
    updateDocumentNonBlocking(doc(db, "userProfiles", selectedUser.id), {
      profileType: newRole,
      jobTitle: `${roleLabels[newRole]} do Sistema`,
      updatedAt: new Date().toISOString()
    });
    
    deleteDocumentNonBlocking(doc(db, `roles_${oldRoleKey}`, selectedUser.id));
    setDocumentNonBlocking(doc(db, `roles_${newRoleKey}`, selectedUser.id), { active: true }, { merge: true });
    
    toast({ title: "Cargo Alterado", description: `O usuário agora possui acesso de ${roleLabels[newRole]}.` });
    setIsChangeRoleOpen(false);
    setSelectedUser(null);
  };

  const handleSendBroadcast = () => {
    if (!msgTitle || !msgContent) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos do comunicado." });
      return;
    }
    toast({ title: "Comunicado Disparado", description: `Mensagem enviada para: ${msgTarget}.` });
    setMsgTitle("");
    setMsgContent("");
  };

  const openEditDialog = (u: any) => {
    setSelectedUser(u);
    setEditUserData({ fullName: u.fullName, email: u.email, team: u.team || "Equipe da Comunicação" });
    setIsEditUserOpen(true);
  };

  const openEditRewardDialog = (r: any) => {
    setSelectedReward(r);
    setEditRewardData({ title: r.title, cost: r.cost, target: r.target, description: r.description });
    setIsEditRewardOpen(true);
  };

  const openRoleDialog = (u: any) => {
    setSelectedUser(u);
    setNewRole(u.profileType);
    setIsChangeRoleOpen(true);
  };

  const openDeleteDialog = (u: any) => {
    setSelectedUser(u);
    setIsDeleteConfirmOpen(true);
  };

  const filteredMissionsTable = useMemo(() => {
    if (!missions) return [];
    if (missionFilter === "Todas") return missions;
    return missions.filter(m => m.status === missionFilter);
  }, [missions, missionFilter]);

  const filteredUsersTable = useMemo(() => {
    if (!users) return [];
    if (userFilter === "Todos") return users;
    const roleKey = userFilter === "Administradores" ? "Admin" : userFilter === "Coordenadores" ? "Coordinator" : "Leader";
    return users.filter(u => u.profileType === roleKey);
  }, [users, userFilter]);

  const filteredRanking = useMemo(() => {
    if (!users) return [];
    let list = [...users];
    
    if (rankingFilter === "Equipe") {
      list = users.filter(u => u.profileType === "Leader" || u.profileType === "Coordinator");
    } else if (rankingFilter === "Coordenador") {
      list = users.filter(u => u.profileType === "Coordinator");
    } else if (rankingFilter === "Líder") {
      list = users.filter(u => u.profileType === "Leader");
    }

    if (rankingTeam !== "Todos") {
      list = list.filter(u => u.team === rankingTeam);
    }
    
    return list.map((u, idx) => ({
      ...u,
      missionsDone: 42 - (idx * 2),
      level: 15 - (idx % 5)
    })).sort((a, b) => b.missionsDone - a.missionsDone);
  }, [users, rankingFilter, rankingTeam]);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-headline text-white tracking-tight">{currentTab === "bi" ? "Painel Estratégico" : currentTab === "users" ? "Gestão de Usuários" : currentTab === "missions" ? "Gestão de Missões" : currentTab === "broadcast" ? "Transmissão Global" : currentTab === "rewards" ? "Loja" : "Ranking Geral"}</h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold opacity-60">
            Sincronização de {currentTab === "rewards" ? "Prêmios" : "Ativos"} em Tempo Real
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSeedData} 
            variant={isDemoDataActive ? "destructive" : "outline"} 
            className={`${isDemoDataActive ? 'bg-red-600/10 border-red-600 text-red-600 hover:bg-red-600/20' : 'border-accent/20 text-accent hover:bg-accent/10'} gap-2 h-11 px-6 font-bold transition-all`}
          >
            {isDemoDataActive ? (
              <><XCircle className="w-4 h-4" /> Limpar Dados Demo</>
            ) : (
              <><Database className="w-4 h-4" /> Gerar Dados Demo</>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} className="w-full">
        <TabsContent value="bi" className="space-y-8 m-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard title="Missões Ativas" value={missions?.length || "0"} change="+12.5%" color="text-blue-400" icon={Activity} description="Volume operacional atual" />
            <MetricCard title="Membros" value={users?.length || "0"} change="+5.2%" color="text-emerald-400" icon={Users} description="Efetivo no ecossistema" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
             <Card className="bg-card border-none shadow-xl border-t-4 border-primary">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" /> Fluxo de Moedas (₵)
                </CardTitle>
                <CardDescription>Moedas emitidas por performance</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataBI}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="moedas" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-xl border-t-4 border-accent">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" /> Histórico de Missões
                </CardTitle>
                <CardDescription>Crescimento operacional mensal</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataBI}>
                    <defs>
                      <linearGradient id="colorMissoes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="missoes" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMissoes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-headline text-white">Gestão de Usuários</h2>
            <div className="flex flex-wrap gap-2">
              {["Todos", "Administradores", "Coordenadores", "Líderes"].map((f) => (
                <Button key={f} variant={userFilter === f ? "default" : "secondary"} onClick={() => setUserFilter(f)} size="sm" className={`h-8 text-[10px] font-black uppercase tracking-widest ${userFilter === f ? 'bg-accent text-accent-foreground' : ''}`}>
                  {f}
                </Button>
              ))}
              <Dialog open={isUserOpen} onOpenChange={setIsUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-8 text-[10px] font-black uppercase tracking-widest px-4 shadow-lg border-b-2 border-accent">
                    <Plus className="w-3 h-3" /> Novo Membro
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Novo Cadastro</DialogTitle>
                    <DialogDescription>Provisione um novo acesso corporativo.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label>Nome Completo</Label><Input value={newUser.fullName} onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" placeholder="Ex: Pedro Queiroz" /></div>
                    <div className="space-y-2"><Label>E-mail</Label><Input value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" placeholder="exemplo@connecta.com" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Select value={newUser.profileType} onValueChange={(v) => setNewUser({...newUser, profileType: v})}>
                          <SelectTrigger className="bg-secondary/50 border-white/5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent><SelectItem value="Admin">Administrador</SelectItem><SelectItem value="Coordinator">Coordenador</SelectItem><SelectItem value="Leader">Líder</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Equipe</Label>
                        <Select value={newUser.team} onValueChange={(v) => setNewUser({...newUser, team: v})}>
                          <SelectTrigger className="bg-secondary/50 border-white/5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter><Button variant="ghost" onClick={() => setIsUserOpen(false)}>Cancelar</Button><Button onClick={handleCreateUser} className="bg-accent text-accent-foreground font-bold">Salvar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Card className="bg-card border-none overflow-hidden">
            {usersLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="border-white/5">
                    <TableHead>Operador</TableHead>
                    <TableHead>Equipe</TableHead>
                    <TableHead>Nível de Acesso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right px-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsersTable?.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCellUI>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{u.fullName}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{u.email}</span>
                        </div>
                      </TableCellUI>
                      <TableCellUI>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] font-black">
                          {u.team || "---"}
                        </Badge>
                      </TableCellUI>
                      <TableCellUI><Badge variant="outline" className="text-accent border-accent/20 uppercase text-[10px]">{roleLabels[u.profileType]}</Badge></TableCellUI>
                      <TableCellUI><Badge className="bg-green-500/10 text-green-500 gap-1 border-green-500/20"><CheckCircle2 className="w-3 h-3" /> Ativo</Badge></TableCellUI>
                      <TableCellUI className="text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(u)} className="h-8 text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/10 gap-2">
                            <Edit3 className="w-3.5 h-3.5" /> Editar
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openRoleDialog(u)} className="h-8 w-8 text-accent hover:bg-accent/10"><ShieldAlert className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(u)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCellUI>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="space-y-4 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-headline text-white">Gestão de Missões</h2>
            <div className="flex flex-wrap gap-2">
              {["Todas", "Concluída", "Em Andamento", "Finalizada"].map((f) => (
                <Button key={f} variant={missionFilter === f ? "default" : "secondary"} onClick={() => setMissionFilter(f)} size="sm" className={`h-8 text-[10px] font-black uppercase tracking-widest ${missionFilter === f ? 'bg-primary text-primary-foreground' : ''}`}>{f}</Button>
              ))}
              <Dialog open={isMissionOpen} onOpenChange={setIsMissionOpen}>
                <DialogTrigger asChild><Button className="bg-accent text-accent-foreground font-black gap-2 h-8 text-[10px] uppercase tracking-widest shadow-lg"><Plus className="w-4 h-4" /> Nova Operação</Button></DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white">
                  <DialogHeader><DialogTitle>Publicar Missão</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label>Título</Label><Input value={newMission.title} onChange={(e) => setNewMission({...newMission, title: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-primary" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Urgência</Label>
                        <Select value={newMission.urgency} onValueChange={(v) => setNewMission({...newMission, urgency: v})}>
                          <SelectTrigger className="bg-secondary/50 border-white/5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h - Urgente">🔴 1h - Urgente</SelectItem>
                            <SelectItem value="3h - Importante">🟡 3h - Importante</SelectItem>
                            <SelectItem value="5h - Pouco Urgente">🟢 5h - Pouco Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Recompensa (₵)</Label><Input type="number" value={newMission.reward} onChange={(e) => setNewMission({...newMission, reward: parseInt(e.target.value)})} className="bg-secondary/50 border-white/5 focus:ring-primary" /></div>
                    </div>
                    <div className="space-y-2"><Label>Diretrizes</Label><Textarea value={newMission.description} onChange={(e) => setNewMission({...newMission, description: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-primary" /></div>
                  </div>
                  <DialogFooter><Button variant="ghost" onClick={() => setIsMissionOpen(false)}>Cancelar</Button><Button onClick={handleCreateMission} className="bg-primary text-primary-foreground font-bold">Publicar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Card className="bg-card border-none overflow-hidden">
            {missionsLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="border-white/5">
                    <TableHead>Missão</TableHead>
                    <TableHead>Urgência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tempo Exec.</TableHead>
                    <TableHead className="text-right px-6">Remover</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMissionsTable.map((m) => (
                    <TableRow key={m.id} className="border-white/5">
                      <TableCellUI>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{m.title}</span>
                          <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-blue-400" /> {format(new Date(m.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCellUI>
                      <TableCellUI>
                        <Badge className={m.urgency?.includes("1h") ? "bg-red-500/10 text-red-500 border-red-500/20" : m.urgency?.includes("3h") ? "bg-accent/10 text-accent border-accent/20" : "bg-green-500/10 text-green-500 border-green-500/20"}>
                          {m.urgency}
                        </Badge>
                      </TableCellUI>
                      <TableCellUI><Badge variant="outline" className="border-primary/20 text-primary text-[10px] uppercase font-bold">{m.status}</Badge></TableCellUI>
                      <TableCellUI>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {m.deliveredAt ? (
                            <span className="text-accent flex items-center gap-1">
                              <Timer className="w-3 h-3" /> {calculateExecutionTime(m.createdAt, m.deliveredAt)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> ---
                            </span>
                          )}
                        </div>
                      </TableCellUI>
                      <TableCellUI className="text-right px-6"><Button variant="ghost" size="icon" onClick={() => { setSelectedMissionId(m.id); setIsMissionDeleteConfirmOpen(true); }} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button></TableCellUI>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6 m-0 outline-none">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-headline text-white mb-6">Disparo de Comunicado</h2>
            <Card className="bg-card border-none shadow-2xl p-8 space-y-6 border-l-4 border-accent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alvo da Transmissão</Label>
                  <Select value={msgTarget} onValueChange={setMsgTarget}>
                    <SelectTrigger className="bg-secondary/50 border-white/5 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos os Membros</SelectItem>
                      <SelectItem value="Líder">Somente Líderes</SelectItem>
                      <SelectItem value="Coordenador">Somente Coordenadores</SelectItem>
                      <SelectItem value="Equipe">Equipe Inteira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Assunto</Label>
                  <Input value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} className="bg-secondary/50 border-white/5 h-12 focus:ring-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Conteúdo</Label>
                <Textarea value={msgContent} onChange={(e) => setMsgContent(e.target.value)} className="bg-secondary/50 border-white/5 min-h-[150px] focus:ring-accent" />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSendBroadcast} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 px-10 rounded-xl gap-2 shadow-lg border-b-4 border-accent">
                  <Send className="w-5 h-5" /> TRANSMITIR AGORA
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-headline text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent" /> Classificação Geral
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {["Todos", "Equipe", "Coordenador", "Líder"].map((f) => (
                  <Button key={f} variant={rankingFilter === f ? "default" : "secondary"} onClick={() => { setRankingFilter(f); setRankingTeam("Todos"); }} size="sm" className={`h-8 text-[10px] font-black uppercase tracking-widest ${rankingFilter === f ? 'bg-accent text-accent-foreground' : ''}`}>
                    {f}
                  </Button>
                ))}
              </div>
              {rankingFilter === "Equipe" && (
                <div className="flex flex-wrap gap-2 p-2 bg-secondary/30 rounded-lg border border-white/5 animate-in slide-in-from-top-2 duration-300">
                  {["Todos", ...teams].map(t => (
                    <Button 
                      key={t} 
                      variant={rankingTeam === t ? "outline" : "ghost"} 
                      onClick={() => setRankingTeam(t)}
                      size="sm"
                      className={`h-8 text-[9px] font-black uppercase tracking-widest ${rankingTeam === t ? 'border-accent text-accent' : 'text-muted-foreground'}`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Card className="bg-card border-none overflow-hidden">
             {usersLoading ? (
               <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
             ) : (
               <Table>
                 <TableHeader className="bg-secondary/30">
                   <TableRow className="border-white/5">
                     <TableHead className="w-20">Rank</TableHead>
                     <TableHead>Operador</TableHead>
                     <TableHead>Equipe</TableHead>
                     <TableHead>Nível</TableHead>
                     <TableHead className="text-right px-6">Missões Realizadas</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredRanking.map((u, idx) => (
                     <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                       <TableCellUI className="font-black text-white">{idx + 1}</TableCellUI>
                       <TableCellUI>
                         <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl bg-accent/10 border-accent/20 flex items-center justify-center border`}>
                             {idx === 0 ? <Trophy className="w-5 h-5 text-accent" /> : <Medal className="w-5 h-5 text-accent" />}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-white font-bold">{u.fullName}</span>
                             <span className="text-[9px] text-muted-foreground font-black uppercase">{roleLabels[u.profileType]}</span>
                           </div>
                         </div>
                       </TableCellUI>
                       <TableCellUI>
                         <Badge variant="secondary" className="bg-secondary text-muted-foreground border-white/5 uppercase text-[9px] font-black">
                           {u.team || "---"}
                         </Badge>
                       </TableCellUI>
                       <TableCellUI>
                         <span className="text-xs font-black text-white">LVL {u.level}</span>
                       </TableCellUI>
                       <TableCellUI className="text-right px-6 text-accent font-black">
                         <div className="flex items-center justify-end gap-2">
                           <CheckCircle className="w-4 h-4" /> {u.missionsDone}
                         </div>
                       </TableCellUI>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             )}
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6 m-0 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-headline text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" /> Loja
            </h2>
            <Dialog open={isRewardOpen} onOpenChange={setIsRewardOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground gap-2 h-8 text-[10px] font-black uppercase tracking-widest px-4 shadow-lg">
                  <Plus className="w-3 h-3" /> Adicionar Prêmio
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10 text-white">
                <DialogHeader><DialogTitle>Cadastrar Recompensa</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Título</Label><Input value={newReward.title} onChange={(e) => setNewReward({...newReward, title: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Custo (₵)</Label><Input type="number" value={newReward.cost} onChange={(e) => setNewReward({...newReward, cost: parseInt(e.target.value)})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
                    <div className="space-y-2">
                      <Label>Alvo</Label>
                      <Select value={newReward.target} onValueChange={(v) => setNewReward({...newReward, target: v})}>
                        <SelectTrigger className="bg-secondary/50 border-white/5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Todos">Todos</SelectItem>
                          <SelectItem value="Equipe">Equipe</SelectItem>
                          <SelectItem value="Coordenador">Coordenador</SelectItem>
                          <SelectItem value="Líder">Líder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Descrição</Label><Textarea value={newReward.description} onChange={(e) => setNewReward({...newReward, description: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
                </div>
                <DialogFooter><Button variant="ghost" onClick={() => setIsRewardOpen(false)}>Cancelar</Button><Button onClick={handleCreateReward} className="bg-primary text-primary-foreground font-bold">Adicionar</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewardsList.map((reward) => (
              <Card key={reward.id} className="bg-card border-none shadow-xl hover:translate-y-[-4px] transition-all group overflow-hidden border-b-4 border-accent flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[8px] font-black tracking-widest">{reward.target}</Badge>
                    <div className="text-accent font-black flex items-center gap-1 text-sm">
                      {reward.title.includes("Viagem") ? <Plane className="w-3 h-3 text-accent" /> : <Zap className="w-3 h-3 fill-accent" />} 
                      ₵ {reward.cost}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-headline text-white">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 pb-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">{reward.description}</p>
                  <div className="mt-auto flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditRewardDialog(reward)} className="h-10 w-10 text-accent hover:bg-accent/10 rounded-xl transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => handleRemoveReward(reward.id)} className="flex-1 text-destructive hover:bg-destructive/10 h-10 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl border border-destructive/5 group-hover:border-destructive/20 transition-all">
                      <Trash2 className="w-3.5 h-3.5" /> Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogos controlados fora da tabela para evitar bugs de foco */}
      <Dialog open={isEditUserOpen} onOpenChange={(open) => { setIsEditUserOpen(open); if(!open) setSelectedUser(null); }}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
            <DialogDescription>Atualize as informações cadastrais e de equipe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nome Completo</Label><Input value={editUserData.fullName} onChange={(e) => setEditUserData({...editUserData, fullName: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
            <div className="space-y-2"><Label>E-mail Corporativo</Label><Input value={editUserData.email} onChange={(e) => setEditUserData({...editUserData, email: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
            <div className="space-y-2">
              <Label>Equipe Vinculada</Label>
              <Select value={editUserData.team} onValueChange={(v) => setEditUserData({...editUserData, team: v})}>
                <SelectTrigger className="bg-secondary/50 border-white/5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsEditUserOpen(false)} className="text-muted-foreground hover:text-white">Cancelar</Button>
            <Button onClick={handleUpdateUser} className="bg-accent text-accent-foreground px-8 font-bold">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditRewardOpen} onOpenChange={(open) => { setIsEditRewardOpen(open); if(!open) setSelectedReward(null); }}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Editar Recompensa</DialogTitle>
            <DialogDescription>Modifique os detalhes deste item da vitrine.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Título</Label><Input value={editRewardData.title} onChange={(e) => setEditRewardData({...editRewardData, title: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Custo (₵)</Label><Input type="number" value={editRewardData.cost} onChange={(e) => setEditRewardData({...editRewardData, cost: parseInt(e.target.value)})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
              <div className="space-y-2">
                <Label>Alvo</Label>
                <Select value={editRewardData.target} onValueChange={(v) => setEditRewardData({...editRewardData, target: v})}>
                  <SelectTrigger className="bg-secondary/50 border-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Equipe">Equipe</SelectItem>
                    <SelectItem value="Coordenador">Coordenador</SelectItem>
                    <SelectItem value="Líder">Líder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={editRewardData.description} onChange={(e) => setEditRewardData({...editRewardData, description: e.target.value})} className="bg-secondary/50 border-white/5 focus:ring-accent" /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsEditRewardOpen(false)} className="text-muted-foreground hover:text-white">Cancelar</Button>
            <Button onClick={handleUpdateReward} className="bg-accent text-accent-foreground px-8 font-bold">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangeRoleOpen} onOpenChange={(open) => { setIsChangeRoleOpen(open); if(!open) setSelectedUser(null); }}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader><DialogTitle>Alterar Nível de Acesso</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Cargo</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-secondary/50 border-white/5"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Admin">Administrador</SelectItem><SelectItem value="Coordinator">Coordenador</SelectItem><SelectItem value="Leader">Líder</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setIsChangeRoleOpen(false)}>Cancelar</Button><Button onClick={handleChangeUserRole} className="bg-primary text-primary-foreground font-bold">Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-white/10 text-white">
          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir permanentemente o usuário {selectedUser?.fullName}? Esta ação é irreversível.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="bg-transparent border-white/10 text-white">Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive hover:bg-destructive/90 text-white font-bold">Excluir Usuário</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMissionDeleteConfirmOpen} onOpenChange={setIsMissionDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Confirmar Exclusão de Missão</AlertDialogTitle>
            <AlertDialogDescription>Deseja remover esta missão permanentemente do ecossistema?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMission} className="bg-destructive hover:bg-destructive/90 text-white font-bold">Remover Operação</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MetricCard({ title, value, change, color, icon: Icon, description }: any) {
  return (
    <Card className="bg-card border-none shadow-2xl relative overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
          <CardDescription className="text-[10px]">{description}</CardDescription>
        </div>
        <div className={`p-3 rounded-2xl bg-secondary/50 ${color}`}><Icon className="h-6 w-6" /></div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-4xl font-black text-white">{value}</div>
        <div className="flex items-center gap-2 mt-4"><Badge className="bg-green-500/20 text-green-500 text-[10px]">{change}</Badge></div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-6 text-white animate-pulse">Estabelecendo Conexão Segura...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
