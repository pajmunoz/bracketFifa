import { BracketDashboard } from "@/components/BracketDashboard";
import { BracketProvider } from "@/context/BracketContext";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BracketPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <BracketProvider>
      <BracketDashboard />
    </BracketProvider>
  );
}
