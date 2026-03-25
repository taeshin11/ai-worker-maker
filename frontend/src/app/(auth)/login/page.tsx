import { BotIcon, CheckIcon } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — AI Worker Maker" };

const features = [
  "Create departments like Marketing, HR, or Development",
  "Hire AI agents with custom roles and personalities",
  "Chat with your agents to get real work done instantly",
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Branding panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-2.5 mb-14">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 shadow-sm">
              <BotIcon className="size-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Worker Maker</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your virtual<br />AI workforce,<br />ready to work.
          </h1>
          <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
            Build a company of AI employees with specialized roles. Delegate tasks and get results — no coding required.
          </p>
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 mt-0.5">
                  <CheckIcon className="size-3" />
                </span>
                <span className="text-indigo-100 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-indigo-400 text-xs">© 2026 AI Worker Maker. All rights reserved.</p>
      </div>

      {/* Login form panel */}
      <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2 justify-center">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BotIcon className="size-4" />
            </div>
            <span className="font-bold">AI Worker Maker</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
