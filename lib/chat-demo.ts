import type { Product } from "@/lib/catalog";

export type ChatLocale = "en" | "hi" | "pa";

export type ChatMatch =
  | { kind: "clarify" }
  | { kind: "suggest"; slug: string }
  | { kind: "consult" };

const aliases: Record<string, string[]> = {
  "g-appet": [
    "appetite",
    "bloat",
    "anorexia",
    "indigestion",
    "acidosis",
    "g appet",
    "g-appet",
    "भूख",
    "अपच",
    "ਭੁੱਖ",
    "ਪੇਟ",
  ],
  "g-liv": ["liver", "g liv", "g-liv", "जिगर", "लीवर", "ਜਿਗਰ"],
  "g-uddar": ["udder", "g uddar", "g-uddar", "थन", "ਥਣ"],
  "g-eliksir": ["metabolic", "eliksir", "elixir", "g eliksir", "g-eliksir", "ਮੈਟਾਬੋਲਿਕ"],
  "g-petworm": ["deworm", "deworming", "worm", "hookworm", "roundworm", "petworm", "g petworm", "कीड़े", "ਕੀੜ"],
  "g-dermi": ["skin", "tick", "ticks", "dermi", "g dermi", "त्वचा", "ਚਮੜੀ"],
};

const horseWords = ["horse", "horses", "घोड़ा", "घोड़े", "ਘੋੜਾ", "ਘੋੜੇ"];

const summaryStop = new Set([
  "listed",
  "veterinary",
  "formulation",
  "indication",
  "confirm",
  "public",
  "animals",
  "animal",
  "still",
  "needs",
  "species",
  "pack",
  "size",
  "this",
  "that",
  "with",
  "from",
  "have",
]);

function hasTerm(text: string, term: string) {
  if (/[^\u0000-\u007f]/.test(term)) return text.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\ /g, "\\s+");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "i").test(text);
}

function mentionsHorse(text: string) {
  return horseWords.some((word) => hasTerm(text, word));
}

/** Match a visitor question to the current catalogue. Horse concerns stay a consultation. */
export function matchCatalogue(question: string, catalogue: Product[]): ChatMatch {
  const text = question.trim().toLowerCase();
  if (text.length < 3) return { kind: "clarify" };

  const ranked = catalogue
    .map((product) => {
      let score = 0;
      if (hasTerm(text, product.name.toLowerCase())) score += 5;
      for (const alias of aliases[product.slug] ?? []) {
        if (hasTerm(text, alias.toLowerCase())) score += 3;
      }
      for (const word of product.summary.toLowerCase().split(/[^a-z0-9]+/)) {
        if (word.length > 4 && !summaryStop.has(word) && hasTerm(text, word)) score += 2;
      }
      return { slug: product.slug, animals: product.animals, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score < 3) return { kind: "consult" };
  if (mentionsHorse(text) && !best.animals.includes("horses")) return { kind: "consult" };
  return { kind: "suggest", slug: best.slug };
}

type AnimalKey = "cattle" | "buffalo" | "dog" | "horse" | "other";

type ChatStrings = {
  open: string;
  title: string;
  demo: string;
  draft: string;
  greeting: string;
  placeholder: string;
  send: string;
  clarify: string;
  suggestLead: string;
  englishNote: string;
  price: string;
  viewProduct: string;
  basket: string;
  consultLead: string;
  consultAction: string;
  formTitle: string;
  name: string;
  contact: string;
  animal: string;
  concern: string;
  time: string;
  morning: string;
  afternoon: string;
  file: string;
  fileHint: string;
  submit: string;
  booked: string;
  nameError: string;
  contactError: string;
  animalError: string;
  concernError: string;
  timeError: string;
  fileType: string;
  fileEmpty: string;
  fileSize: string;
  close: string;
  languages: string;
  animals: Record<AnimalKey, string>;
};

export const chatCopy: Record<ChatLocale, ChatStrings> = {
  en: {
    open: "Open demonstration assistant",
    title: "Demonstration assistant",
    demo: "Demo",
    draft: "Hindi and Punjabi replies in this chat are drafts.",
    greeting:
      "This demonstration can point to the six sample products. It does not diagnose. No message or file is sent.",
    placeholder: "Describe the animal and the concern",
    send: "Send",
    clarify: "Add the animal and the concern. For example: loss of appetite in cattle, or skin concerns in a dog.",
    suggestLead: "{name} is listed in this sample.",
    englishNote: "The product wording below is the English catalogue text.",
    price: "Price on enquiry.",
    viewProduct: "View product",
    basket: "Enquiry basket",
    consultLead:
      "This sample does not include a listed product for that concern. You can request a demonstration appointment so Dr. Grewal can review it.",
    consultAction: "Consult Dr. Grewal",
    formTitle: "Demonstration appointment",
    name: "Name",
    contact: "Phone or email",
    animal: "Animal",
    concern: "Concern",
    time: "Sample time",
    morning: "Morning sample",
    afternoon: "Afternoon sample",
    file: "Image or short video",
    fileHint: "Optional. JPG, PNG, WEBP, MP4, WEBM or MOV, up to 8 MB. The file stays on this device.",
    submit: "Record demonstration appointment",
    booked: "Demonstration appointment {reference} is in the admin review. Nothing was sent.",
    nameError: "Enter your name.",
    contactError: "Enter a phone number or email address.",
    animalError: "Select an animal.",
    concernError: "Describe the concern.",
    timeError: "Select a sample time.",
    fileType: "Choose a JPG, PNG, WEBP, MP4, WEBM or MOV file.",
    fileEmpty: "That file is empty.",
    fileSize: "Choose a file up to 8 MB.",
    close: "Close",
    languages: "Demonstration languages",
    animals: { cattle: "Cattle", buffalo: "Buffalo", dog: "Dog", horse: "Horse", other: "Other" },
  },
  hi: {
    open: "डेमो सहायक खोलें",
    title: "डेमो सहायक",
    demo: "Demo",
    draft: "इस चैट की हिन्दी और पंजाबी पंक्तियाँ ड्राफ्ट हैं।",
    greeting: "यह डेमो छह नमूना उत्पादों तक ले जा सकता है। यह रोग नहीं पहचानता। कोई संदेश या फ़ाइल नहीं भेजी जाती।",
    placeholder: "जानवर और परेशानी लिखें",
    send: "भेजें",
    clarify: "जानवर और परेशानी लिखें। उदाहरण: पशु में भूख न लगना, या कुत्ते की त्वचा।",
    suggestLead: "{name} इस नमूने में सूचीबद्ध है।",
    englishNote: "नीचे का उत्पाद पाठ अंग्रेज़ी सूची से है।",
    price: "कीमत पूछताछ पर।",
    viewProduct: "उत्पाद देखें",
    basket: "पूछताछ टोकरी",
    consultLead: "इस नमूने में उस परेशानी का कोई सूचीबद्ध उत्पाद नहीं है। डॉ. ग्रेवाल की समीक्षा के लिए डेमो अपॉइंटमेंट माँग सकते हैं।",
    consultAction: "डॉ. ग्रेवाल से सलाह",
    formTitle: "डेमो अपॉइंटमेंट",
    name: "नाम",
    contact: "फ़ोन या ईमेल",
    animal: "जानवर",
    concern: "परेशानी",
    time: "नमूना समय",
    morning: "सुबह का नमूना",
    afternoon: "दोपहर का नमूना",
    file: "चित्र या छोटा वीडियो",
    fileHint: "वैकल्पिक। JPG, PNG, WEBP, MP4, WEBM या MOV, 8 MB तक। फ़ाइल इसी डिवाइस पर रहती है।",
    submit: "डेमो अपॉइंटमेंट दर्ज करें",
    booked: "डेमो अपॉइंटमेंट {reference} एडमिन समीक्षा में है। कुछ नहीं भेजा गया।",
    nameError: "नाम लिखें।",
    contactError: "फ़ोन नंबर या ईमेल लिखें।",
    animalError: "जानवर चुनें।",
    concernError: "परेशानी लिखें।",
    timeError: "नमूना समय चुनें।",
    fileType: "JPG, PNG, WEBP, MP4, WEBM या MOV फ़ाइल चुनें।",
    fileEmpty: "वह फ़ाइल खाली है।",
    fileSize: "8 MB तक की फ़ाइल चुनें।",
    close: "बंद करें",
    languages: "डेमो भाषाएँ",
    animals: { cattle: "गाय", buffalo: "भैंस", dog: "कुत्ता", horse: "घोड़ा", other: "अन्य" },
  },
  pa: {
    open: "ਡੈਮੋ ਸਹਾਇਕ ਖੋਲ੍ਹੋ",
    title: "ਡੈਮੋ ਸਹਾਇਕ",
    demo: "Demo",
    draft: "ਇਸ ਗੱਲਬਾਤ ਦੀ ਹਿੰਦੀ ਅਤੇ ਪੰਜਾਬੀ ਲਿਖਤ ਡਰਾਫਟ ਹੈ।",
    greeting: "ਇਹ ਡੈਮੋ ਛੇ ਨਮੂਨਾ ਉਤਪਾਦਾਂ ਵੱਲ ਲੈ ਜਾ ਸਕਦਾ ਹੈ। ਇਹ ਰੋਗ ਨਹੀਂ ਪਛਾਣਦਾ। ਕੋਈ ਸੁਨੇਹਾ ਜਾਂ ਫਾਈਲ ਨਹੀਂ ਭੇਜੀ ਜਾਂਦੀ।",
    placeholder: "ਜਾਨਵਰ ਅਤੇ ਪਰੇਸ਼ਾਨੀ ਲਿਖੋ",
    send: "ਭੇਜੋ",
    clarify: "ਜਾਨਵਰ ਅਤੇ ਪਰੇਸ਼ਾਨੀ ਲਿਖੋ। ਉਦਾਹਰਨ: ਪਸ਼ੂ ਵਿੱਚ ਭੁੱਖ ਨਾ ਲੱਗਣੀ, ਜਾਂ ਕੁੱਤੇ ਦੀ ਚਮੜੀ।",
    suggestLead: "{name} ਇਸ ਨਮੂਨੇ ਵਿੱਚ ਸੂਚੀਬੱਧ ਹੈ।",
    englishNote: "ਹੇਠਾਂ ਦਾ ਉਤਪਾਦ ਪਾਠ ਅੰਗਰੇਜ਼ੀ ਸੂਚੀ ਤੋਂ ਹੈ।",
    price: "ਕੀਮਤ ਪੁੱਛਗਿੱਛ ’ਤੇ।",
    viewProduct: "ਉਤਪਾਦ ਵੇਖੋ",
    basket: "ਪੁੱਛਗਿੱਛ ਟੋਕਰੀ",
    consultLead: "ਇਸ ਨਮੂਨੇ ਵਿੱਚ ਉਸ ਪਰੇਸ਼ਾਨੀ ਲਈ ਕੋਈ ਸੂਚੀਬੱਧ ਉਤਪਾਦ ਨਹੀਂ। ਡਾ. ਗਰੇਵਾਲ ਦੀ ਸਮੀਖਿਆ ਲਈ ਡੈਮੋ ਮੁਲਾਕਾਤ ਮੰਗ ਸਕਦੇ ਹੋ।",
    consultAction: "ਡਾ. ਗਰੇਵਾਲ ਨਾਲ ਸਲਾਹ",
    formTitle: "ਡੈਮੋ ਮੁਲਾਕਾਤ",
    name: "ਨਾਮ",
    contact: "ਫ਼ੋਨ ਜਾਂ ਈਮੇਲ",
    animal: "ਜਾਨਵਰ",
    concern: "ਪਰੇਸ਼ਾਨੀ",
    time: "ਨਮੂਨਾ ਸਮਾਂ",
    morning: "ਸਵੇਰ ਦਾ ਨਮੂਨਾ",
    afternoon: "ਦੁਪਹਿਰ ਦਾ ਨਮੂਨਾ",
    file: "ਤਸਵੀਰ ਜਾਂ ਛੋਟਾ ਵੀਡੀਓ",
    fileHint: "ਚੋਣਵਾਂ। JPG, PNG, WEBP, MP4, WEBM ਜਾਂ MOV, 8 MB ਤੱਕ। ਫਾਈਲ ਇਸ ਡਿਵਾਈਸ ’ਤੇ ਰਹਿੰਦੀ ਹੈ।",
    submit: "ਡੈਮੋ ਮੁਲਾਕਾਤ ਦਰਜ ਕਰੋ",
    booked: "ਡੈਮੋ ਮੁਲਾਕਾਤ {reference} ਐਡਮਿਨ ਸਮੀਖਿਆ ਵਿੱਚ ਹੈ। ਕੁਝ ਨਹੀਂ ਭੇਜਿਆ ਗਿਆ।",
    nameError: "ਨਾਮ ਲਿਖੋ।",
    contactError: "ਫ਼ੋਨ ਨੰਬਰ ਜਾਂ ਈਮੇਲ ਲਿਖੋ।",
    animalError: "ਜਾਨਵਰ ਚੁਣੋ।",
    concernError: "ਪਰੇਸ਼ਾਨੀ ਲਿਖੋ।",
    timeError: "ਨਮੂਨਾ ਸਮਾਂ ਚੁਣੋ।",
    fileType: "JPG, PNG, WEBP, MP4, WEBM ਜਾਂ MOV ਫਾਈਲ ਚੁਣੋ।",
    fileEmpty: "ਉਹ ਫਾਈਲ ਖਾਲੀ ਹੈ।",
    fileSize: "8 MB ਤੱਕ ਦੀ ਫਾਈਲ ਚੁਣੋ।",
    close: "ਬੰਦ ਕਰੋ",
    languages: "ਡੈਮੋ ਭਾਸ਼ਾਵਾਂ",
    animals: { cattle: "ਗਾਂ", buffalo: "ਮੱਝ", dog: "ਕੁੱਤਾ", horse: "ਘੋੜਾ", other: "ਹੋਰ" },
  },
};

export function chatFill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
