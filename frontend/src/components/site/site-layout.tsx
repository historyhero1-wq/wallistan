import type { ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { Header } from "./header";
import { MobileHeader } from "./mobile-header";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
import { WhatsappFab } from "./whatsapp-fab";
import { NewsletterPopup } from "./newsletter-popup";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <div className="hidden lg:block">
        <Header />
      </div>
      <MobileHeader />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <WhatsappFab />
      <BottomNav />
      <NewsletterPopup />
    </div>
  );
}
