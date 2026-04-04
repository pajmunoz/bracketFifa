"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useBracket } from "@/context/BracketContext";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "@/i18n/routing";
import { STORAGE_KEY } from "@/types/bracket";

export function RegistrationSidebar() {
  const router = useRouter();
  const t = useTranslations("Registration");
  const {
    canSubmit,
    form,
    prepareSubmission,
    progressPercent,
    setForm,
  } = useBracket();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit || pending) {
        return;
      }
      setError(null);
      const payload = prepareSubmission();
      setPending(true);
      try {
        const res = await fetch("/api/submissions", {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? t("errorStatus", { status: res.status }));
          return;
        }
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }
        router.replace(ROUTES.confirmacion);
      } catch {
        setError(t("errorGeneric"));
      } finally {
        setPending(false);
      }
    },
    [canSubmit, pending, prepareSubmission, router, t],
  );

  return (
    <div
      className="sticky top-40 space-y-8 rounded-2xl bg-[#141b2b] p-8 text-on-secondary shadow-xl"
      id="register"
    >
      <div className="mb-6 flex items-center gap-3">
        <span
          className="material-symbols-outlined text-4xl text-primary-container"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          stars
        </span>
        <h2 className="font-headline text-xl font-bold">{t("title")}</h2>
      </div>
      <form className="space-y-6" onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <label
            className="font-label mb-2 block text-xs font-bold uppercase tracking-widest text-tertiary-container"
            htmlFor="reg-name"
          >
            {t("nameLabel")}
          </label>
          <input
            autoComplete="name"
            className="w-full rounded-lg border-none bg-slate-800/50 p-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary-container"
            id="reg-name"
            name="name"
            placeholder={t("namePlaceholder")}
            type="text"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
          />
        </div>
        <div>
          <label
            className="font-label mb-2 block text-xs font-bold uppercase tracking-widest text-tertiary-container"
            htmlFor="reg-email"
          >
            {t("emailLabel")}
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-lg border-none bg-slate-800/50 p-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary-container"
            id="reg-email"
            name="email"
            placeholder={t("emailPlaceholder")}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ email: e.target.value })}
          />
        </div>
        <div>
          <label
            className="font-label mb-2 block text-xs font-bold uppercase tracking-widest text-tertiary-container"
            htmlFor="reg-wa"
          >
            {t("whatsappLabel")}
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-slate-500">
              {t("whatsappPrefix")}
            </span>
            <input
              autoComplete="tel"
              className="w-full rounded-lg border-none bg-slate-800/50 p-4 pl-12 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary-container"
              id="reg-wa"
              name="whatsapp"
              placeholder={t("whatsappPlaceholder")}
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ whatsapp: e.target.value })}
            />
          </div>
        </div>
        <div className="border-t border-slate-700/50 pt-4">
          <p className="mb-2 text-center text-xs text-tertiary-container">
            {t("progress", { percent: progressPercent })}
          </p>
          {error ? (
            <p className="mb-2 text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className={
              canSubmit && !pending
                ? "font-headline w-full cursor-pointer rounded-full bg-primary-container/90 px-6 py-4 font-black uppercase tracking-tighter text-on-primary-container transition-all hover:bg-primary-container"
                : "font-headline w-full cursor-not-allowed rounded-full bg-primary-container/20 px-6 py-4 font-black uppercase tracking-tighter text-emerald-900 opacity-50 transition-all"
            }
            disabled={!canSubmit || pending}
            type="submit"
          >
            {pending ? t("submitting") : t("submit")}
          </button>
          <p className="mt-4 text-center text-xs italic text-tertiary-container">
            {t("footerHint")}
          </p>
        </div>
      </form>
      <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary-container">
            info
          </span>
          <div>
            <p className="text-sm font-bold text-on-secondary">
              {t("scoringTitle")}
            </p>
            <p className="mt-1 text-xs text-tertiary-container">
              {t("scoringBody")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
