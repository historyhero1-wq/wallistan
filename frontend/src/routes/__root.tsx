import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { CartDrawerProvider } from "@/components/site/cart-drawer";
import { SearchDialogProvider } from "@/components/site/search-dialog";
import { QuickViewProvider } from "@/components/product/quick-view-dialog";
import { BRAND } from "@/lib/catalog";
import { BASE_URL } from "@/lib/seo";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 font-display text-xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This piece isn't on the wall. Try heading back to the storefront.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND.name,
  url: BASE_URL,
  description: BRAND.tagline,
  telephone: BRAND.phone,
  email: BRAND.email,
  address: { "@type": "PostalAddress", addressLocality: "Multan", addressCountry: "PK" },
  areaServed: "PK",
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/shop?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#FAFAF8" },
      { title: `${BRAND.name} — ${BRAND.tagline}` },
      { name: "description", content: `Custom 3D sign boards, LED neon signs, acrylic logos, shop & office signage and handcrafted home wall decor — designed and built in Multan, Pakistan.` },
      { name: "author", content: BRAND.name },
      { property: "og:site_name", content: BRAND.name },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: BRAND.logo },
      { rel: "apple-touch-icon", href: BRAND.logo },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(orgJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(websiteJsonLd) },
      ...(import.meta.env.VITE_GA_MEASUREMENT_ID
        ? [
            {
              src: `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`,
              async: true,
            },
            {
              children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${import.meta.env.VITE_GA_MEASUREMENT_ID}');`,
            },
          ]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <CartDrawerProvider>
            <SearchDialogProvider>
              <QuickViewProvider>
                <Outlet />
                <Toaster position="top-center" richColors />
              </QuickViewProvider>
            </SearchDialogProvider>
          </CartDrawerProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

