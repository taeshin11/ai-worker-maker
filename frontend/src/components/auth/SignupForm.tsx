"use client";

import { useState } from "react";
import Link from "next/link";
import { GlobeIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n/context";

export default function SignupForm() {
  const { t, lang, setLang } = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>{t.auth.checkEmail}</CardTitle>
          <CardDescription>{t.auth.checkEmailDesc(email)}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm underline underline-offset-4">
            {t.auth.backToSignIn}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t.auth.createAccount}</CardTitle>
        <CardDescription>{t.auth.joinUs}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.auth.creatingAccount : t.auth.createAccount}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {t.auth.alreadyHave}{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              {t.auth.signIn}
            </Link>
          </p>
        </CardFooter>
      </form>
      <div className="flex justify-center pt-3 pb-1">
        <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
          <GlobeIcon className="size-3.5 text-muted-foreground ml-1.5 shrink-0" />
          {(["en", "ko"] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                lang === code
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {code === "en" ? "EN" : "한국어"}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
