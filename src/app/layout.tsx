import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChildVision - AI Holistic Growth & Developmental Monitoring for Toddlers",
  description: "ChildVision is an AI-powered multi-modal system providing physical growth monitoring, nutritional health screening, cognitive milestones tracking, and environmental safety alerts for toddlers.",
  keywords: ["child growth", "development milestones", "pediatric tracking", "malnutrition screening", "pose estimation", "infant monitoring"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <div className="glow-bg">
            <div className="glow-circle glow-circle-1"></div>
            <div className="glow-circle glow-circle-2"></div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
