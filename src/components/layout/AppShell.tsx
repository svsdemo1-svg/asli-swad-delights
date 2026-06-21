import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickyCartBar } from "./StickyCartBar";
import { WhatsAppFab } from "./WhatsAppFab";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <main>{children}</main>
      <Footer />
      <StickyCartBar />
      <WhatsAppFab />
    </div>
  );
}
