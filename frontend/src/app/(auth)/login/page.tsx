import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — AI Company Builder" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center min-h-screen bg-muted/40 px-4">
      <LoginForm />
    </main>
  );
}
