"use client";

import { useEffect, useRef } from "react";
import { useUser, useFirestore } from "@/firebase";
import { collection, query, onSnapshot, limit, orderBy } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

/**
 * Componente que gerencia as notificações nativas do sistema.
 * Solicita permissão proativamente e monitora eventos em tempo real.
 */
export default function NotificationHandler() {
  const { user } = useUser();
  const db = useFirestore();
  const mountTime = useRef(new Date());

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Solicitar permissão imediatamente ao montar se ainda for 'default'
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          toast({
            title: "Notificações Ativadas",
            description: "Você receberá alertas de missões e mensagens em tempo real.",
          });
        }
      });
    }
  }, []);

  // Ouvinte para Novas Missões (Apenas Admin cria, todos recebem o alerta visual)
  useEffect(() => {
    if (!user || !db || Notification.permission !== "granted") return;

    const missionsRef = collection(db, "missions");
    const q = query(missionsRef, orderBy("createdAt", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const createdAt = new Date(data.createdAt);
          
          if (createdAt > mountTime.current) {
            // Notificação Nativa (Aparece no sistema operacional/celular)
            new Notification("🚀 Nova Missão CONNECTA", {
              body: `${data.title} - Recompensa: ₵${data.reward}`,
              icon: "/logo-connecta.png",
            });
            
            // Toast Interno
            toast({
              title: "Nova Missão Detectada",
              description: data.title,
              duration: 3000,
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, db]);

  return null;
}
