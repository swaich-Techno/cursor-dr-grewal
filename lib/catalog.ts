export type AnimalId = "cattle-buffalo" | "dogs" | "horses";

export type Product = {
  slug: string;
  name: string;
  summary: string;
  detail: string;
  animals: AnimalId[];
  animalLabel: string;
  packNote: string;
  /** Short notice shown to customers when species, indication or pack is unconfirmed. */
  notice: string;
  /** Staff approval note. May include source conflicts that are not shown to customers. */
  confirmation: string;
  /** True when species or indication is still unresolved. */
  uncertain: boolean;
  image: string;
  imageAlt: string;
  featured: boolean;
};

/**
 * Sample catalogue only. Replace this file when the full list is approved.
 * Wording is paraphrased from the public listing. It does not repeat cure,
 * side-effect, or superiority claims.
 */
export const products: Product[] = [
  {
    slug: "g-appet",
    name: "G Appet",
    summary: "Listed for loss of appetite and bloat.",
    detail:
      "G Appet is a veterinary homeopathic formulation in the public Grewal catalogue. The listing describes it in connection with loss of appetite and bloat. The pack photograph also carries the words indigestion, anorexia, bloat and acidosis.",
    animals: ["cattle-buffalo"],
    animalLabel: "Cattle & Buffalo",
    packNote: "Public listing: 15 mL bottle. Confirm the pack size.",
    notice: "Pack size still needs confirmation. Artwork silhouettes are not extra species.",
    confirmation:
      "The pack photograph shows a cow and several livestock silhouettes, including a horse. Those silhouettes are not treated as a confirmed horse product. Please confirm species and pack size.",
    uncertain: true,
    image: "/images/products/g-appet.jpg",
    imageAlt: "Pack photograph of G Appet from the public Grewal Homeo Remedies listing",
    featured: true,
  },
  {
    slug: "g-liv",
    name: "G Liv",
    summary: "Listed veterinary formulation. Indication to confirm.",
    detail:
      "G Liv appears in the public catalogue as a veterinary homeopathic formulation. One entry describes liver support for dogs. The pack photograph used here is marked Anorexia, shows a dog, and reads 15 ml.",
    animals: ["dogs"],
    animalLabel: "Dogs",
    packNote: "Pack photograph reads 15 ml. Confirm the pack size.",
    notice: "The public listing and the pack do not agree on the indication. Species and pack size still need confirmation.",
    confirmation:
      "The public pages do not agree: liver support, a general veterinary listing, and a pack marked Anorexia. Another image file on the listing is named as G Liv but shows G Milet, so it is not used. Please confirm indication, species and pack.",
    uncertain: true,
    image: "/images/products/g-liv.jpg",
    imageAlt: "Pack photograph of G Liv from the public Grewal Homeo Remedies listing",
    featured: true,
  },
  {
    slug: "g-uddar",
    name: "G Uddar",
    summary: "Listed for udder tissue in dairy animals.",
    detail:
      "G Uddar is listed as an udder tissue formulation for dairy animals. The pack photograph refers to an atrophied or small udder and shows cattle.",
    animals: ["cattle-buffalo"],
    animalLabel: "Cattle & Buffalo",
    packNote: "Public listing: 15 mL bottle. Confirm the pack size.",
    notice: "Confirm which dairy species are supplied, and the pack size.",
    confirmation:
      "Please confirm which dairy species are supplied and the pack size before this is offered for sale.",
    uncertain: false,
    image: "/images/products/g-uddar.jpg",
    imageAlt: "Pack photograph of G Uddar from the public Grewal Homeo Remedies listing",
    featured: true,
  },
  {
    slug: "g-eliksir",
    name: "G Eliksir",
    summary: "Listed as a metabolic stabiliser.",
    detail:
      "G Eliksir is listed as a metabolic stabiliser. The pack photograph shows a cow and is marked metabolic stabiliser.",
    animals: ["cattle-buffalo"],
    animalLabel: "Cattle & Buffalo",
    packNote: "Public listing: 15 mL bottle. Confirm the pack size.",
    notice: "Species beyond the cattle photograph, and the pack size, still need confirmation.",
    confirmation:
      "The pack artwork includes other livestock silhouettes. Species beyond the cattle photograph are not confirmed. Please confirm species and pack size.",
    uncertain: true,
    image: "/images/products/g-eliksir.jpg",
    imageAlt: "Pack photograph of G Eliksir from the public Grewal Homeo Remedies listing",
    featured: false,
  },
  {
    slug: "g-petworm",
    name: "G Petworm",
    summary: "Listed for deworming in dogs.",
    detail:
      "G Petworm is listed as a homeopathic dog formulation for deworming. The pack photograph is marked Deworming and 15 ml. The catalogue text names roundworms and hookworms.",
    animals: ["dogs"],
    animalLabel: "Dogs",
    packNote: "Pack photograph reads 15 ml. Confirm the pack size.",
    notice: "Confirm the exact indication and pack size.",
    confirmation: "Please confirm the exact indication and pack size with the team.",
    uncertain: false,
    image: "/images/products/g-petworm.jpg",
    imageAlt: "Pack photograph of G Petworm from the public Grewal Homeo Remedies listing",
    featured: false,
  },
  {
    slug: "g-dermi",
    name: "G Dermi",
    summary: "Listed for skin concerns. Species to confirm.",
    detail:
      "G Dermi is listed for skin concerns. The pack photograph says skin problems and shows livestock. A separate public entry describes a dog formulation for skin and ticks.",
    animals: ["cattle-buffalo", "dogs"],
    animalLabel: "Cattle & Buffalo, Dogs",
    packNote: "Public listing: 15 mL bottle. Confirm the pack size.",
    notice: "Sources do not agree on the species. Indication and pack size still need confirmation.",
    confirmation:
      "The livestock pack photograph and the dog listing do not describe the same species. Please confirm who it is for, and the indication, before it is grouped in the catalogue.",
    uncertain: true,
    image: "/images/products/g-dermi.jpg",
    imageAlt: "Pack photograph of G Dermi from the public Grewal Homeo Remedies listing",
    featured: false,
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export const animalFilters: { id: AnimalId; image: string; imageAlt: string }[] = [
  {
    id: "cattle-buffalo",
    image: "/images/animals/cow.jpg",
    imageAlt: "Holstein cow standing in a green field",
  },
  {
    id: "dogs",
    image: "/images/animals/dog.jpg",
    imageAlt: "Golden retriever lying in grass",
  },
  {
    id: "horses",
    image: "/images/animals/horse.jpg",
    imageAlt: "Chestnut horse standing in a grassy field",
  },
];
