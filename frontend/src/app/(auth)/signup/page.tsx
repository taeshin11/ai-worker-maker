import { BotIcon } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = { title: "Create account — AI Worker Maker" };

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 justify-center">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BotIcon className="size-4" />
          </div>
          <span className="font-bold">AI Worker Maker</span>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
