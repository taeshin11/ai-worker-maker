import SignupForm from "@/components/auth/SignupForm";

export const metadata = { title: "Create account — AI Company Builder" };

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center min-h-screen bg-muted/40 px-4">
      <SignupForm />
    </main>
  );
}
