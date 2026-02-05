import "./globals.css";
import "./fonts.css";
import ConvexClientProvider from "@/components/ConvexProvider";

export const metadata = {
  title: "ClawsCrew",
  description: "Mission Control Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F7F7F5] text-[#1A3C2B] font-sans">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
