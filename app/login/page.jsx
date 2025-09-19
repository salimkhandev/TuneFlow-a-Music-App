"use client";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-lg p-6 space-y-4 bg-card">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your Google account to like songs and sync your
            favorites.
          </p>
        </div>
        <Button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full">
          Continue with Google
        </Button>
      </div>
    </div>
  );
}


