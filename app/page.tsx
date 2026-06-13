import { ClientApp } from "@/components/ClientApp";

export const dynamic = "force-dynamic";

export default function Home() {
  return <ClientApp hasGeminiKey={Boolean(process.env.GEMINI_API_KEY)} />;
}
