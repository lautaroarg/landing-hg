import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HG Herrería Galván | Frentes de parrilla a medida",
  description: "Transformá tu quincho con un frente de parrilla a medida. Diseño, fabricación e instalación. Pedí tu presupuesto a HG Herrería Galván.",
  icons: {
    icon: "/hg-favicon.ico",
    shortcut: "/hg-favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <head>
        <script src="/meta-pixel.js" defer />
      </head>
      <body className="antialiased">
        <noscript>
          <img
            alt=""
            width="1"
            height="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2104389757046906&ev=PageView&noscript=1"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
