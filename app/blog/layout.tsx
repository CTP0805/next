
import Header from "@/components/header";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className="min-h-full flex flex-col"
      suppressHydrationWarning>{children}
      <Header />
      </body>
  );
}
