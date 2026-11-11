import { getContent } from "./content";

export type Faq = { question: string; answer: string; category?: string };

export const faqs = (): Faq[] => getContent().faqs;
