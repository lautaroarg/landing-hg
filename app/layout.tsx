import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HG Herrería Galván | Frentes de parrilla a medida",
  description: "Transformá tu quincho con un frente de parrilla a medida. Diseño, fabricación e instalación. Pedí tu presupuesto a HG Herrería Galván.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
