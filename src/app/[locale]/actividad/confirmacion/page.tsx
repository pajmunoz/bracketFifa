import { SuccessView } from "@/components/SuccessView";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConfirmacionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SuccessView />;
}
