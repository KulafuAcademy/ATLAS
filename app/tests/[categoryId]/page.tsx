import Link from "next/link";
import { notFound } from "next/navigation";

import { LocalizedText } from "@/components/common/LocalizedText";
import { CategoryListeningTest } from "@/components/training/CategoryListeningTest";
import { trainingLessons } from "@/data/trainingLessons";

type TestPageProps = {
  params: Promise<{ categoryId: string }>;
};

export function generateStaticParams() {
  return trainingLessons.map((lesson) => ({ categoryId: lesson.id }));
}

export default async function CategoryTestPage({ params }: TestPageProps) {
  const { categoryId } = await params;
  const lesson = trainingLessons.find((item) => item.id === categoryId);

  if (!lesson) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/#top"
        className="inline-flex min-h-10 items-center rounded-md border border-white/15 px-3 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200/60"
      >
        <LocalizedText value={{ en: "← All lessons", ja: "← レッスン一覧" }} />
      </Link>

      <header className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-100/60">
          <LocalizedText value={{ en: "Listening test", ja: "聞き取りテスト" }} />
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          <LocalizedText value={lesson.title} />
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/55">
          <LocalizedText value={lesson.description} />
        </p>
      </header>

      <CategoryListeningTest lesson={lesson} />
    </div>
  );
}
