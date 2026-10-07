"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { Dialog, useDialog } from "@/components/ui";

function LeafMark() {
  return (
    <svg viewBox="0 0 32 32" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M16.5 27.5c7.2-5.2 11-11.2 9.2-18.6-7.4.8-13 5.6-14.8 13.2 3.6.8 5.4 2.6 5.6 5.4z" fill="#146c3a" />
      <path d="M16 27c-1.2-5.2.4-9.2 5.6-12.6" fill="none" stroke="#e0b15a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" strokeLinecap="round" />
    </svg>
  );
}

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
    >
      {t("skip")}
    </a>
  );
}

export function DemoBanner() {
  const { t } = useI18n();
  return (
    <div className="border-b border-[#ead7a4] bg-[#fbf6ea] text-[#3f3420]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs leading-5 sm:px-6 sm:text-[13px]">
        <p>{t("banner")}</p>
        <Link href="/admin" className="font-semibold text-[#0e4d28] underline-offset-2 hover:underline">
          {t("adminDemo")}
        </Link>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const { itemCount } = useDemo();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const menuRef = useDialog(menuOpen, () => setMenuOpen(false));
  const menuTitle = useId();
  const searchId = useId();

  useEffect(() => {
    if (!productsOpen) return;
    const close = () => setProductsOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProductsOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [productsOpen]);

  function goSearch(value: string) {
    const query = value.trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    setSearchOpen(false);
    setMenuOpen(false);
  }

  const productLinks = [
    { href: "/products", label: t("navAll") },
    { href: "/products?animal=cattle-buffalo", label: t("animalCattle") },
    { href: "/products?animal=dogs", label: t("animalDogs") },
    { href: "/products?animal=horses", label: t("animalHorses") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6eee8] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 md:flex-nowrap">
        <Link href="/" className="mr-auto flex min-w-0 items-start gap-1.5">
          <span className="min-w-0">
            <span className="font-display flex items-center gap-1 text-[1.2rem] tracking-tight text-[#0e4d28] sm:text-[1.4rem]">
              Dr. Grewal
              <LeafMark />
            </span>
            <span className="block max-w-[11rem] text-[10px] leading-tight text-[#4d5c54] sm:max-w-none sm:text-[11px]">
              {locale === "pa" ? "ਗਰੇਵਾਲ ਹੋਮਿਓ ਰੈਮਡੀਜ਼, ਮੋਹਾਲੀ" : "Grewal Homeo Remedies, Mohali"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-3 text-[15px] font-semibold text-[#1c2420] md:flex lg:gap-5" aria-label="Primary">
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1"
              aria-expanded={productsOpen}
              aria-controls="products-menu"
              onClick={() => setProductsOpen((open) => !open)}
            >
              {t("navProducts")}
              <span aria-hidden="true" className="text-xs">▾</span>
            </button>
            {productsOpen ? (
              <div id="products-menu" role="menu" className="absolute left-0 top-full z-20 mt-1 w-52 rounded-lg border border-[#e6eee8] bg-white py-1 shadow-lg">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className="block px-3 py-2.5 hover:bg-[#f4f7f4]"
                    onClick={() => setProductsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href="/about" className="inline-flex min-h-11 items-center">
            {t("navAbout")}
          </Link>
          <Link href="/support" className="inline-flex min-h-11 items-center">
            {t("navSupport")}
          </Link>
        </nav>

        <form
          className="hidden lg:block"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            goSearch(String(data.get("q") ?? ""));
          }}
        >
          <label htmlFor={searchId} className="sr-only">
            {t("navSearch")}
          </label>
          <div className="flex items-center rounded-lg border border-[#d5e0d8] bg-white">
            <input
              id={searchId}
              name="q"
              placeholder={t("navSearch")}
              className="h-11 w-28 bg-transparent px-3 text-base lg:w-52"
            />
            <button type="submit" className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#0e4d28]" aria-label={t("navSearchButton")}>
              <SearchIcon />
            </button>
          </div>
        </form>

        <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#0e4d28] lg:hidden" aria-label={t("navSearch")} onClick={() => setSearchOpen(true)}>
          <SearchIcon />
        </button>

        <Link href="/basket" className="relative inline-flex min-h-11 min-w-11 items-center justify-center text-[#0e4d28]" aria-label={`${t("navBasket")}: ${itemCount}`}>
          <BasketIcon />
          {itemCount > 0 ? (
            <span className="absolute right-0 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0f5c32] px-1 text-[11px] font-bold text-white">
              {itemCount}
            </span>
          ) : null}
        </Link>

        <div className="flex items-center rounded-lg border border-[#e6eee8] p-0.5" role="group" aria-label={t("langNote")}>
          <button type="button" aria-pressed={locale === "en"} className={`min-h-10 rounded-md px-2 text-sm font-semibold ${locale === "en" ? "bg-[#0f5c32] text-white" : "text-[#0e4d28]"}`} onClick={() => setLocale("en")}>
            EN
          </button>
          <button type="button" aria-pressed={locale === "pa"} className={`min-h-10 rounded-md px-2 text-sm font-semibold ${locale === "pa" ? "bg-[#0f5c32] text-white" : "text-[#0e4d28]"}`} onClick={() => setLocale("pa")}>
            ਪੰ
          </button>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#0e4d28] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <span className="sr-only">{t("navMenu")}</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {locale === "pa" ? (
        <p className="mx-auto w-full max-w-[1120px] px-4 pb-2 text-[11px] leading-4 text-[#6a5a32] sm:px-6 sm:text-right">{t("langNote")}</p>
      ) : null}

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-[#102018]/50" aria-label={t("navClose")} onClick={() => setMenuOpen(false)} />
          <div ref={menuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-labelledby={menuTitle} className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id={menuTitle} className="text-lg font-bold text-[#0e4d28]">
                {t("navMenu")}
              </h2>
              <button type="button" className="min-h-11 min-w-11 font-semibold" onClick={() => setMenuOpen(false)}>
                {t("navClose")}
              </button>
            </div>
            <nav className="mt-4 grid gap-1 text-base font-semibold" aria-label="Primary">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg px-2 py-3 hover:bg-[#f4f7f4]" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/about" className="rounded-lg px-2 py-3 hover:bg-[#f4f7f4]" onClick={() => setMenuOpen(false)}>
                {t("navAbout")}
              </Link>
              <Link href="/support" className="rounded-lg px-2 py-3 hover:bg-[#f4f7f4]" onClick={() => setMenuOpen(false)}>
                {t("navSupport")}
              </Link>
              <Link href="/admin" className="rounded-lg px-2 py-3 hover:bg-[#f4f7f4]" onClick={() => setMenuOpen(false)}>
                {t("adminDemo")}
              </Link>
            </nav>
            <div className="mt-4 flex gap-2" role="group" aria-label={t("langNote")}>
              <button type="button" aria-pressed={locale === "en"} className="min-h-11 flex-1 rounded-lg border border-[#d5e0d8] font-semibold" onClick={() => setLocale("en")}>
                {t("langEn")}
              </button>
              <button type="button" aria-pressed={locale === "pa"} className="min-h-11 flex-1 rounded-lg border border-[#d5e0d8] font-semibold" onClick={() => setLocale("pa")}>
                {t("langPa")}
              </button>
            </div>
            <p className="mt-3 text-sm text-[#6a5a32]">{t("langNote")}</p>
          </div>
        </div>
      ) : null}

      <Dialog open={searchOpen} title={t("navSearch")} closeLabel={t("navClose")} onClose={() => setSearchOpen(false)}>
        <form
          className="mt-2"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            goSearch(String(data.get("q") ?? ""));
          }}
        >
          <label htmlFor="mobile-search" className="sr-only">
            {t("navSearch")}
          </label>
          <input id="mobile-search" name="q" className="min-h-11 w-full rounded-lg border border-[#d5e0d8] px-3 text-base" placeholder={t("navSearch")} />
          <button type="submit" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0f5c32] px-4 font-semibold text-white">
            {t("navSearchButton")}
          </button>
        </form>
      </Dialog>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto bg-[#0c3d22] text-[#f4f7f2]">
      <div className="mx-auto grid w-full max-w-[1120px] gap-4 px-4 py-8 text-sm sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-lg text-white">Dr. Grewal</p>
          <p className="mt-1 text-[#e7f0ea]">{t("footerAddress")}</p>
          <p className="mt-1 text-xs text-[#d5e4da]">{t("footerAddressNote")}</p>
          <p className="mt-3 text-xs text-[#d5e4da]">{t("footerRefresh")}</p>
          <p className="mt-1 text-xs text-[#f3e6c4]">{t("langNote")}</p>
        </div>
        <nav className="grid content-start gap-2 font-semibold text-[#f7f3e8]" aria-label="Footer">
          <Link href="/distributor" className="underline-offset-4 hover:underline">
            {t("footerDistributor")}
          </Link>
          <Link href="/payment" className="underline-offset-4 hover:underline">
            {t("footerPayment")}
          </Link>
          <Link href="/prescription" className="underline-offset-4 hover:underline">
            {t("supportPrescription")}
          </Link>
          <Link href="/admin" className="underline-offset-4 hover:underline">
            {t("adminDemo")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function WhatsAppButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {t("supportChat")}
        <span aria-hidden="true">→</span>
      </button>
      <Dialog open={open} title={t("whatsappTitle")} closeLabel={t("whatsappClose")} onClose={() => setOpen(false)}>
        <p>{t("whatsappBody")}</p>
        <p className="mt-3 font-semibold text-[#1c2420]">{t("whatsappSample")}</p>
        <p className="mt-1 rounded-lg bg-[#f4f7f4] p-3 text-[#1c2420]">{t("whatsappSampleText")}</p>
        <button type="button" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#0f5c32] px-4 font-semibold text-white" onClick={() => setOpen(false)}>
          {t("whatsappClose")}
        </button>
      </Dialog>
    </>
  );
}
