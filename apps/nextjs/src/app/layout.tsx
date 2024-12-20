import { type ReactNode } from "react";

import "../styles/globals.css";
import "../styles/prosemirror.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";

import { cn } from "~/utils/cn";
import { cal, inter } from "../styles/fonts";
import Toaster from "../ui/Toaster";
import { ThemeProvider } from "./ThemeProvider";

// const CabinFont = Cabin({
//   subsets: ["latin"],
//   weight: ["400"],
// });

export const metadata = {
  title: "Studlancer",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn("font-default", inter.variable)}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
          <Analytics />
          <Toaster richColors position="bottom-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
