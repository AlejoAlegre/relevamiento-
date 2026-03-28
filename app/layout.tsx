import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Relevamiento – Procesos de gestión en bodegas',
  description: 'Relevamiento sectorial sobre procesos de gestión, automatización y seguimiento en bodegas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
