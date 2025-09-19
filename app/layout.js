import { CustomThemeProvider } from "@/components/custom-theme-provider";
import Header from "@/components/header/Header";
import { NavigationLoader } from "@/components/navigation/NavigationLoader";
import Player from "@/components/player/Player";
import { RoutePrefetcher } from "@/components/RoutePrefetcher";
import ServiceWorker from "@/components/ServiceWorker";
import AppSessionProvider from "@/components/session-provider/SessionProvider";
import { Sidebar } from "@/components/sidebar/Sidebar";
import StoreProvider from "@/components/store-provider/StoreProvider";
import { ThemeProvider } from "@/components/theme-provider";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tune Flow",
  description: "A responsive music application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const resolvedTheme = theme === 'system' ? systemTheme : theme;
                
                if (resolvedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                }
                
                // Apply custom theme if available
                const appTheme = localStorage.getItem('app-theme') || 'default';
                document.documentElement.setAttribute('data-theme', appTheme);
              } catch (e) {
                // Fallback to light theme if localStorage is not available
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <AppSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CustomThemeProvider defaultTheme="default">
              <NavigationLoader />
              <RoutePrefetcher />
              <div className="flex flex-col h-dvh">
                <Header />
                <ResizablePanelGroup
                  direction="horizontal"
                  className="flex-1 border-y"
                >
                  <ResizablePanel
                    defaultSize={20}
                    minSize={0}
                    maxSize={20}
                    className="hidden sm:block"
                  >
                    <Sidebar />
                  </ResizablePanel>
                  <ResizableHandle withHandle className="hidden sm:flex" />
                  <ResizablePanel defaultSize={80} minSize={0}>
                    <div className="h-full overflow-y-auto">
                      <div className="block sm:hidden">
                        <div className="w-full py-2 px-4 bg-card border-b">
                          <Sidebar />
                        </div>
                      </div>
                      {children}
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
                <Player />
              </div>
            </CustomThemeProvider>
          </ThemeProvider>
          </AppSessionProvider>
        </StoreProvider>
        <ServiceWorker/>
      </body>
    </html>
  );
}
