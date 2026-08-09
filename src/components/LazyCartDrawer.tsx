import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CartDrawerSkeleton } from "./skeletons";

// Only fetch the cart drawer chunk after the user first opens the cart.
const CartDrawerImpl = lazy(() => import("./CartDrawer").then((m) => ({ default: m.CartDrawer })));

export function LazyCartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [everOpened, setEverOpened] = useState(false);
  const hasOpened = useRef(false);
  useEffect(() => {
    if (open && !hasOpened.current) {
      hasOpened.current = true;
      setEverOpened(true);
    }
  }, [open]);

  if (!everOpened) return null;
  return (
    <Suspense fallback={open ? <CartDrawerSkeleton /> : null}>
      <CartDrawerImpl open={open} onClose={onClose} />
    </Suspense>
  );
}
