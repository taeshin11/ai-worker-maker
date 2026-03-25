import { Metadata } from "next";
import WorkspaceChat from "@/components/dashboard/WorkspaceChat";

export const metadata: Metadata = { title: "Workspace — AI Worker Maker" };

export default function WorkspacePage() {
  return <WorkspaceChat />;
}
