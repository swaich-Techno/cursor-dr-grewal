"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { AnimalId } from "@/lib/catalog";
import { useDemo } from "@/lib/demo-store";
import { fill, useI18n, type MessageKey } from "@/lib/i18n";
import { btnPrimary, btnSecondary, QuantityControl } from "@/components/ui";

const filters: { id: AnimalId; key: MessageKey }[] = [
  { id: "cattle-buffalo", key: "animalCattle" },
  { id: "dogs", key: "animalDogs" },
  { id: "horses", key: "animalHorses" },
];

export function Catalogue() {
  const { t } = useI18n();
  const { catalogue } = useDemo();
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q")?.trim() ?? "";
  const animal = params.get("animal");
  const selected = filters.some((filter) => filter.id === animal) ? (animal as AnimalId) : null;

  const results = useMemo(() => {
    const needle = query.toLowerCase();
    return catalogue.filter((product) => {
      const nameOk = !needle || product.name.toLowerCase().includes(needle);
      const animalOk = !selected || product.animals.includes(selected);
      return nameOk && animalOk;
    });
  }, [catalogue, query, selected]);

  function hrefFor(nextAnimal: AnimalId | null, nextQuery = query) {
    const search = new URLSearchParams();
    if (nextQuery) search.set("q", nextQuery);
    if (nextAnimal) search.set("animal", nextAnimal);
    const value = search.toString();
    return value ? `/products?${value}` : "/products";
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6">
      <div className="accent-bar mb-3" />
      <h1 className="text-3xl font-extrabold tracking-tight text-[#0e4d28]">{t("catalogueTitle")}</h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#3e4c45]">{t("catalogueLede")}</p>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          router.push(hrefFor(selected, String(data.get("q") ?? "").trim()));
        }}
      >
        <label htmlFor="catalogue-search" className="sr-only">
          {t("navSearch")}
        </label>
        <input
          id="catalogue-search"
          name="q"
          defaultValue={query}
          key={query}
          placeholder={t("navSearch")}
          className="min-h-11 w-full rounded-lg border border-[#d5e0d8] px-3 text-base sm:max-w-sm"
        />
        <button type="submit" className={btnPrimary}>
          {t("navSearchButton")}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const pressed = selected === filter.id;
          return (
            <Link
              key={filter.id}
              href={hrefFor(pressed ? null : filter.id)}
              aria-pressed={pressed}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-semibold ${pressed ? "border-[#0f5c32] bg-[#0f5c32] text-white" : "border-[#d5e0d8] bg-white text-[#0e4d28]"}`}
            >
              {t(filter.key)}
            </Link>
          );
        })}
        {query || selected ? (
          <Link href="/products" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[#0e4d28] underline-offset-4 hover:underline">
            {t("catalogueClear")}
          </Link>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-[#3e4c45]">
        {fill(results.length === 1 ? t("catalogueCountOne") : t("catalogueCount"), { count: results.length })}
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-xl border border-[#e6eee8] bg-[#f7faf7] p-5">
          <p className="max-w-xl leading-relaxed">{selected === "horses" ? t("catalogueHorses") : t("catalogueEmpty")}</p>
          <Link href="/support" className={`${btnPrimary} mt-4`}>
            {t("catalogueAsk")}
          </Link>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <li key={product.slug}>
              <Link href={`/products/${product.slug}`} className="flex h-full flex-col rounded-xl border border-[#e6eee8] bg-white p-3 hover:border-[#b7d0be]">
                <span className="relative block h-48 bg-[#fafafa]">
                  <Image src={product.image} alt={product.imageAlt} fill className="object-contain p-3" sizes="280px" />
                </span>
                <span className="mt-3 block text-lg font-bold">{product.name}</span>
                <span className="mt-1 block flex-1 text-sm leading-relaxed text-[#3e4c45]">{product.summary}</span>
                {product.uncertain ? <span className="mt-2 text-xs font-semibold text-[#6a5a32]">{t("toConfirm")}</span> : null}
                <span className="mt-2 block text-sm font-semibold text-[#0e4d28]">{t("price")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProductDetail({ slug }: { slug: string }) {
  const { t } = useI18n();
  const { catalogue, addToBasket } = useDemo();
  const product = catalogue.find((item) => item.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;
  const safeQuantity = Number.isFinite(quantity) ? Math.min(20, Math.max(1, quantity)) : 1;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6">
      <Link href="/products" className="text-sm font-semibold text-[#0e4d28]">
        ← {t("detailBack")}
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="relative h-80 rounded-xl border border-[#e6eee8] bg-[#fafafa] sm:h-[420px]">
          <Image src={product.image} alt={product.imageAlt} fill className="object-contain p-6" sizes="(min-width: 1024px) 480px, 100vw" priority />
        </div>
        <div>
          <div className="accent-bar mb-3" />
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0e4d28]">{product.name}</h1>
          <p className="mt-2 text-sm font-semibold text-[#0e4d28]">{t("price")}</p>
          <p className="mt-4 text-sm text-[#6a5a32]">{t("detailEnglish")}</p>
          <p className="mt-2 text-base leading-relaxed text-[#1c2420]">{product.detail}</p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-[#0e4d28]">{t("detailAnimals")}</dt>
              <dd>{product.animalLabel}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#0e4d28]">{t("detailPack")}</dt>
              <dd>{product.packNote}</dd>
            </div>
            <div className="rounded-lg bg-[#fbf6ea] p-3">
              <dt className="font-semibold text-[#3f3420]">{t("detailConfirm")}</dt>
              <dd className="mt-1 leading-relaxed text-[#3f3420]">{product.notice}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">{t("detailQty")}</p>
            <QuantityControl
              value={safeQuantity}
              label={t("detailQty")}
              decreaseLabel={t("detailDecrease")}
              increaseLabel={t("detailIncrease")}
              onChange={(value) => {
                if (!Number.isFinite(value)) return;
                setQuantity(Math.min(20, Math.max(1, value)));
                setAdded(false);
              }}
            />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                addToBasket(product.slug, safeQuantity);
                setAdded(true);
              }}
            >
              {t("detailAdd")}
            </button>
            <Link href={`/enquiry?ask=${product.slug}`} className={btnSecondary}>
              {t("detailAsk")}
            </Link>
          </div>
          <p className="mt-3 min-h-6 text-sm font-semibold text-[#0e4d28]" aria-live="polite">
            {added ? (
              <>
                {t("detailAdded")}{" "}
                <Link href="/basket" className="underline">
                  {t("detailBasket")}
                </Link>
              </>
            ) : null}
          </p>
          <section className="mt-8 rounded-xl border border-dashed border-[#d5e0d8] p-4">
            <h2 className="font-bold text-[#0e4d28]">{t("detailReviews")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#3e4c45]">{t("detailReviewsEmpty")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
