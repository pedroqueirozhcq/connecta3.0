
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, ShieldCheck, Camera, User, Settings, Mail, Phone, Save, X, Loader2, Briefcase } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "userProfiles", user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [formData, setFormData] = useState({
    fullName: "",
    jobTitle: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        jobTitle: profile.jobTitle || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "+55 (11) 98765-4321"
      });
    } else if (user && !isProfileLoading) {
        setFormData({
            fullName: user.displayName || user.email?.split('@')[0].toUpperCase() || "",
            jobTitle: "Membro Connecta",
            email: user.email || "",
            phone: "+55 (11) 98765-4321"
        });
    }
  }, [profile, user, isProfileLoading]);

  const handleToggleEdit = () => {
    if (isEditing && userDocRef) {
      setIsSaving(true);
      // Apenas Nome e Telefone podem ser alterados pelo próprio usuário
      setDocumentNonBlocking(userDocRef, {
        fullName: formData.fullName,
        phone: formData.phone,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setTimeout(() => {
        toast({
          title: "Perfil Atualizado!",
          description: "Suas informações foram salvas na nuvem.",
        });
        setIsSaving(false);
        setIsEditing(false);
      }, 800);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const roleLabel = profile?.profileType || "Líder";
  const roleInfo = roleLabel === "Admin" 
    ? { icon: ShieldCheck, color: "text-primary", label: "Administrador Master" }
    : roleLabel === "Coordinator" 
    ? { icon: Settings, color: "text-accent", label: "Coordenador Tático" }
    : { icon: User, color: "text-blue-400", label: "Líder Operacional" };

  const userImage = profile?.profilePictureUrl || PlaceHolderImages.find(img => img.id === "user-avatar")?.imageUrl;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-3xl shadow-xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative group">
          <Avatar className="h-32 w-32 ring-4 ring-primary ring-offset-4 ring-offset-background shadow-2xl">
            <AvatarImage src={userImage} alt="User" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-headline text-white mb-1">
            {formData.fullName || "Usuário"}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3">
            <div className={`flex items-center gap-1.5 font-black uppercase text-[10px] tracking-[0.2em] ${roleInfo.color}`}>
              <roleInfo.icon className="w-4 h-4" />
              {roleInfo.label}
            </div>
            {profile?.team && (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-60">
                <Briefcase className="w-3.5 h-3.5" />
                {profile.team}
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-lg">
            Responsável pela gestão {roleLabel === 'Admin' ? 'estratégica' : roleLabel === 'Coordinator' ? 'tática' : 'operacional'} da unidade de {profile?.team || 'operação'}.
          </p>
        </div>
      </div>

      <Card className="bg-card border-none shadow-2xl overflow-hidden">
        <CardHeader className="bg-secondary/20 border-b border-white/5 flex flex-row items-center justify-between py-6">
          <CardTitle className="text-xl font-headline">Minhas Informações</CardTitle>
          <div className="flex gap-2">
            {isEditing && (
              <Button 
                variant="ghost" 
                disabled={isSaving}
                onClick={handleCancel}
                className="text-muted-foreground hover:text-white gap-2 h-10 px-4 font-black uppercase text-[10px] tracking-widest"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            )}
            <Button 
              variant={isEditing ? "default" : "outline"}
              disabled={isSaving}
              onClick={handleToggleEdit}
              className={`border-primary/30 text-primary hover:bg-primary/10 gap-2 h-10 px-6 font-black uppercase text-[10px] tracking-widest ${isEditing ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Editar Perfil
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                <User className="w-3 h-3" /> Nome Completo
              </Label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => handleChange('fullName', e.target.value)}
                readOnly={!isEditing || isSaving} 
                className={`bg-secondary/40 border-none h-12 font-bold text-white transition-all ${isEditing ? 'ring-2 ring-primary/50 focus:ring-primary' : 'focus:ring-0 cursor-default'}`} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Cargo (Definido pelo ADM)
              </Label>
              <Input 
                value={formData.jobTitle} 
                readOnly 
                className="bg-secondary/20 border-none h-12 font-bold text-muted-foreground focus:ring-0 cursor-not-allowed" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                <Phone className="w-3 h-3" /> Telefone
              </Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => handleChange('phone', e.target.value)}
                readOnly={!isEditing || isSaving} 
                className={`bg-secondary/40 border-none h-12 font-bold text-white transition-all ${isEditing ? 'ring-2 ring-primary/50 focus:ring-primary' : 'focus:ring-0 cursor-default'}`} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                <Mail className="w-3 h-3" /> E-mail
              </Label>
              <Input 
                value={formData.email} 
                readOnly 
                className="bg-secondary/20 border-none h-12 font-bold text-muted-foreground focus:ring-0 cursor-not-allowed" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
