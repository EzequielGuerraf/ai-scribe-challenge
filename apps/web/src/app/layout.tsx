import "./globals.css";
import Providers from "./providers";

/*Root layout.*/

export const metadata = {
  title: "AI Scribe",
  description: "Notes Management Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-4xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">AI Scribe</h1>
            <nav className="text-sm space-x-4">
              <a className="hover:underline" href="/">Patients</a>
              <a className="hover:underline" href="/notes/create">Create Note</a>
            </nav>
          </header>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
