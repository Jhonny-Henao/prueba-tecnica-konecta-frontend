import { Inter } from 'next/font/google';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sistema de Ventas Financieras',
  description: 'Sistema de gestión de ventas de productos financieros',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}