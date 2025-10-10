import "./globals.css";
import Providers from "./providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Scribe",
  description: "Notes Management Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
        <div className="mx-auto max-w-5xl p-6">
          <header className="mb-6 rounded-md border bg-emerald-600 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-black" />
                <h1 className="text-xl font-semibold tracking-tight">AI Scribe</h1>
              </div>
              <nav className="text-sm">
                <a className="hover:underline mr-4" href="/">Patients</a>
                <a className="hover:underline" href="/notes/create">Create Note</a>
              </nav>
            </div>
          </header>
          <Providers>{children}</Providers>
          <footer className="mt-10 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} AI Scribe
          </footer>
        </div>
      </body>
    </html>
  );
}
