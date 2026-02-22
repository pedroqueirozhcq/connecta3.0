"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const logoUrl = "/logo-connecta.png";

  useEffect(() => {
    const savedRole = localStorage.getItem("user_role");
    if (user && !isUserLoading && savedRole) {
      router.push(`/dashboard/${savedRole}`);
    }
  }, [user, isUserLoading, router]);

  const setupUserPermissions = (userId: string, email: string) => {
    const determineRole = (email: string) => {
      if (email.includes("admin")) return "admin";
      if (email.includes("coord")) return "coordinator";
      return "leader";
    };
    const determineTeam = (email: string) => {
      if (email.includes("externo")) return "Equipe do Externo";
      return "Equipe da Comunicação";
    };

    const role = determineRole(email);
    const roleTitle = role === "admin" ? "Admin" : role === "coordinator" ? "Coordinator" : "Leader";
    const team = determineTeam(email);
    
    const userRef = doc(db, "userProfiles", userId);
    setDocumentNonBlocking(userRef, {
      id: userId,
      email: email,
      fullName: email.split('@')[0].toUpperCase(),
      profileType: roleTitle,
      jobTitle: roleTitle + " do Sistema",
      team: team,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const roleRef = doc(db, `roles_${role}`, userId);
    setDocumentNonBlocking(roleRef, { active: true }, { merge: true });

    localStorage.setItem("user_role", role);
    return role;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const authPassword = password.length < 6 ? password.padEnd(6, '0') : password;

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, authPassword);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          userCredential = await createUserWithEmailAndPassword(auth, email, authPassword);
          toast({ title: "Conta Criada", description: "Usuário provisionado automaticamente." });
        } else {
          throw err;
        }
      }

      const role = setupUserPermissions(userCredential.user.uid, email);
      toast({ title: "Bem-vindo!", description: "Autenticação realizada com sucesso." });
      router.push(`/dashboard/${role}`);
    } catch (err: any) {
      setError("Falha na autenticação. Verifique suas credenciais.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-20 w-24 mb-4 transition-all duration-500 hover:scale-110 cursor-pointer">
            <Image 
              src={logoUrl} 
              alt="Connecta Logo" 
              fill
              className="object-contain rounded-xl shadow-lg"
              priority
              data-ai-hint="company logo"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-headline tracking-tighter text-white uppercase text-center">
            Autenticação CONNECT<span className="text-primary">A</span>
          </h1>
        </div>

        <Card className="border-none bg-card/40 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-headline text-white">Login</CardTitle>
            <CardDescription className="text-muted-foreground/60 text-xs uppercase tracking-widest font-black">Área Restrita</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-6 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-[11px] font-semibold">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="adm@connecta.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/40 border-white/5 focus:border-primary/50 h-12 text-sm rounded-xl text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Senha (Mín. 6 dígitos)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/40 border-white/5 focus:border-primary/50 h-12 text-sm rounded-xl text-white"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 text-base transition-all active:scale-[0.98] rounded-xl shadow-lg border-none mt-4 uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ACESSAR SISTEMA"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-3 text-center">
              <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                O SISTEMA CRIARÁ SUA CONTA NO PRIMEIRO ACESSO
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
