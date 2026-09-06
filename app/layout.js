// Font
import { Inter, Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
// Providers
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SubmissionsProvider } from "@/components/SubmissionsProvider";
// Styling
import "./globals.css";

export const metadata = {
  title: "GDG | Recruitment Portal",
  description: "Recruitment portal for GDG",
};

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bricolageGrotesque.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SubmissionsProvider>
            {children}
            <Toaster />
          </SubmissionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
