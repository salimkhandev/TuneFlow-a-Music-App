"use client";
import { SessionProvider } from "next-auth/react";

export default function AppSessionProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}


