import { useEffect, useState } from "react";
import { defaultSheetConfig, getSheetConfig } from "@/lib/wallpaper-sheets";
export function useSheetConfig(id: string) {
  const [config, setConfig] = useState(defaultSheetConfig);
  useEffect(() => {
    const update = () => setConfig(getSheetConfig(id));
    update();
    window.addEventListener("dm-sheet-config", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("dm-sheet-config", update);
      window.removeEventListener("storage", update);
    };
  }, [id]);
  return config;
}
