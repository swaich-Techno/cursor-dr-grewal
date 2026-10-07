"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { animalFilters, type AnimalId } from "@/lib/catalog";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { WhatsAppButton } from "@/components/SiteChrome";

const animalKey: Record<AnimalId, "animalCattle" | "animalDogs" | "animalHorses"> = {
  "cattle-buffalo": "animalCattle",
  dogs: "animalDogs",
  horses: "animalHorses",
};

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export function HomePage() {
  const { t, locale } = useI18n();
  const { catalogue } = useDemo();
  const featured = catalogue.filter((product) => product.featured);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-5 sm:px-6 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-[#e6eee8] bg-[#f4f8f1] lg:grid lg:h-[460px] lg:grid-cols-[minmax(17rem,0.82fr)_minmax(0,1.18fr)]">
        <div className="order-2 flex flex-col justify-center px-4 py-5 sm:px-8 lg:order-1 lg:py-8">
          <h1 className="text-[1.85rem] font-bold leading-[1.12] tracking-tight text-[#0e4d28] sm:text-[2.55rem]">
            {locale === "en" ? (
              <>
                Veterinary Care,
                <br />
                Trusted Since 1973.
              </>
            ) : (
              t("heroTitle")
            )}
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#3e4c45] sm:text-base">{t("heroSubtitle")}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0f5c32] px-4 text-[15px] font-semibold text-white hover:bg-[#0c4a28]">
              {t("ctaExplore")} <Arrow />
            </Link>
            <Link href="/support" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c5d5c9] bg-white px-4 text-[15px] font-semibold text-[#0e4d28] hover:bg-[#f4f7f4]">
              {t("ctaTalk")}
            </Link>
          </div>
        </div>
        <div className="relative order-1 aspect-video bg-[#f4f8f1] lg:aspect-auto lg:h-full">
          <Image
            src="/images/animals/hero-farmyard.jpg"
            alt={t("heroImageAlt")}
            fill
            priority
            className="object-contain object-center"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </div>
      </section>

      <section className="mt-8 grid items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-xl font-extrabold text-[#0e4d28]">{t("shopTitle")}</h2>
            <Link href="/products" className="text-sm font-semibold text-[#0e4d28]">
              {t("viewAll")} <Arrow />
            </Link>
          </div>
          <div className="accent-bar mb-4" />
          <div className="grid grid-cols-3 items-stretch gap-2 sm:gap-3">
            {animalFilters.map((animal) => (
              <Link key={animal.id} href={`/products?animal=${animal.id}`} className="flex h-full flex-col overflow-hidden rounded-lg border border-[#e6eee8] bg-white hover:border-[#b7d0be]">
                <span className="relative block h-24 sm:h-32">
                  <Image src={animal.image} alt={animal.imageAlt} fill className="object-cover object-center" sizes="180px" />
                </span>
                <span className="mt-auto flex items-center justify-between gap-1 px-2 py-2 text-xs font-semibold text-[#1c2420] sm:px-3 sm:text-sm">
                  {t(animalKey[animal.id])}
                  <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-xl font-extrabold text-[#0e4d28]">{t("featuredTitle")}</h2>
            <Link href="/products" className="text-sm font-semibold text-[#0e4d28]">
              {t("viewAll")} <Arrow />
            </Link>
          </div>
          <div className="accent-bar mb-4" />
          <div className="grid grid-cols-3 items-stretch gap-2 sm:gap-3">
            {featured.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`} className="flex h-full flex-col rounded-lg border border-[#e6eee8] bg-white p-2 hover:border-[#b7d0be]">
                <span className="relative block h-32 bg-[#fafafa] sm:h-40">
                  <Image src={product.image} alt={product.imageAlt} fill className="object-contain p-2" sizes="200px" />
                </span>
                <span className="mt-2 block px-1 font-bold text-[#1c2420]">{product.name}</span>
                <span className="mt-1 block flex-1 px-1 text-xs leading-snug text-[#3e4c45]">{product.summary}</span>
                {product.uncertain ? <span className="mt-2 block px-1 text-[11px] font-semibold text-[#6a5a32]">{t("toConfirm")}</span> : null}
                <span className="mt-2 block px-1 text-xs font-semibold text-[#0e4d28]">{t("price")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-12">
        <article className="overflow-hidden rounded-xl border border-[#e6eee8] bg-[#f4f7f4] lg:col-span-5">
          <div className="grid sm:grid-cols-[1fr_0.9fr] lg:grid-cols-1">
            <div className="p-5">
              <h2 className="text-xl font-extrabold text-[#0e4d28]">{t("aboutKicker")}</h2>
              <p className="mt-2 font-semibold text-[#1c2420]">{t("aboutTitle")}</p>
              <p className="text-[#3e4c45]">{t("aboutBody")}</p>
              <Link href="/about" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#0e4d28]">
                {t("aboutLink")} <Arrow />
              </Link>
            </div>
            <div className="relative h-36 sm:h-full sm:min-h-36 lg:h-40">
              <Image src="/images/animals/landscape.jpg" alt="Open countryside in warm daylight" fill className="object-cover" sizes="400px" />
            </div>
          </div>
        </article>
        <div className="grid items-stretch gap-3 sm:grid-cols-3 lg:col-span-7">
          <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] bg-white p-4">
            <IconCircle>
              <path d="M5 15a7 7 0 0 1 14 0" />
              <path d="M4 15h3v4H5a1 1 0 0 1-1-1v-3zm13 0h3v3a1 1 0 0 1-1 1h-2v-4z" />
            </IconCircle>
            <h2 className="mt-3 font-bold text-[#0e4d28]">{t("supportCustomer")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#3e4c45]">{t("supportCustomerBody")}</p>
            <Link href="/support" className="mt-auto inline-flex min-h-11 items-center pt-3 text-sm font-semibold text-[#0e4d28]">
              {t("supportContact")} <Arrow />
            </Link>
          </article>
          <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] bg-white p-4">
            <IconCircle>
              <path d="M7 4h8l4 4v12H7z" />
              <path d="M15 4v4h4M9 13h6M9 17h6" />
            </IconCircle>
            <h2 className="mt-3 font-bold text-[#0e4d28]">{t("supportPrescription")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#3e4c45]">{t("supportPrescriptionBody")}</p>
            <Link href="/prescription" className="mt-auto inline-flex min-h-11 items-center pt-3 text-sm font-semibold text-[#0e4d28]">
              {t("supportUpload")} <Arrow />
            </Link>
          </article>
          <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] bg-white p-4">
            <IconCircle>
              <path d="M6 16.5V8.8A6.2 6.2 0 0 1 12.2 3h.2A5.6 5.6 0 0 1 18 8.6V15l1.2 2.2H5.2z" />
              <path d="M9 19a3 3 0 0 0 6 0" />
            </IconCircle>
            <h2 className="mt-3 font-bold text-[#0e4d28]">{t("supportWhatsapp")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#3e4c45]">{t("supportWhatsappBody")}</p>
            <WhatsAppButton className="mt-auto inline-flex min-h-11 items-center gap-1 pt-3 text-left text-sm font-semibold text-[#0e4d28]" />
          </article>
        </div>
      </section>
    </div>
  );
}

function IconCircle({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#b7d0be] text-[#0f5c32]">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}
