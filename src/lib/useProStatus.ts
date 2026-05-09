import { useEffect, useState } from "react";
import { supabase } from "./supabase";

interface ProStatus {
  isPro: boolean;
  loading: boolean;
}

export function useProStatus(): ProStatus {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setIsPro(false);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        setIsPro(data?.is_pro ?? false);
        setLoading(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isPro, loading };
}
