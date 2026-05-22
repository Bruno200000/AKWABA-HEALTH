import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKWABA HEALTH | Gestion Hospitalière Intelligente & SaaS",
  description: "La plateforme SaaS moderne pour la gestion complète des hôpitaux et cliniques. Dossier patient, pharmacie, laboratoire et dashboard analytique.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="light h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
