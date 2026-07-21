import { lazy, Suspense } from "react";

// Only load the (heavier) cart drawer bundle when the user opens the cart.
const CartDrawerImpl = lazy(() =>
  import("./CartDrawer").then((m) => ({ default: m.CartDrawer })),
);

export function LazyCartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Skip mounting entirely (and skip the network chunk) until the drawer is opened once.
  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <CartDrawerImpl open={open} onClose={onClose} />
    </Suspense>
  );
}
