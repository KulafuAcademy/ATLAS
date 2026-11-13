import { notFound } from "next/navigation";

import { WordDetail } from "@/components/words/WordDetail";
import { wordDetails } from "@/data/wordDetails";
import { getWordPage } from "@/lib/words";

type WordPageProps = {
  params: Promise<{
    word: string;
  }>;
};

export function generateStaticParams() {
  return wordDetails.map((detail) => ({ word: detail.word }));
}

export default async function WordPage({ params }: WordPageProps) {
  const { word } = await params;
  const page = getWordPage(decodeURIComponent(word).toLowerCase());

  if (!page) {
    notFound();
  }

  return <WordDetail {...page} />;
}
