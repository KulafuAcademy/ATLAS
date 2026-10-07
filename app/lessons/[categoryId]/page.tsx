import Link from "next/link";
import { notFound } from "next/navigation";

import { LocalizedText } from "@/components/common/LocalizedText";
import { MinimalPairTrainer } from "@/components/training/MinimalPairTrainer";
import { trainingLessons } from "@/data/trainingLessons";

type LessonPageProps = {
  params: Promise<{ categoryId: string }>;
};

export function generateStaticParams() {
  return trainingLessons.map((lesson) => ({ categoryId: lesson.id }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { categoryId } = await params;
  const lesson = trainingLessons.find((item) => item.id === categoryId);

  if (!lesson) notFound();

  return (
    <div className="space-y-10">
      <Link
        href="/#curriculum"
        className="inline-flex min-h-11 items-center border border-white/20 px-4 text-sm font-semibold text-white/75 transition hover:border-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <LocalizedText value={{ en: "← All lessons", ja: "← レッスン一覧" }} />
      </Link>

      <header className="max-w-4xl space-y-4">
        <p className="text-sm uppercase tracking-[0.28em] text-white/40">
          <LocalizedText value={{ en: "Lesson", ja: "レッスン" }} />
        </p>
        <h1 className="text-5xl font-semibold text-white md:text-7xl">
          <LocalizedText value={lesson.title} />
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-white/60">
          <LocalizedText value={lesson.description} />
        </p>
      </header>

      <MinimalPairTrainer
        id={`${lesson.id}-learn`}
        title={lesson.title}
        description={lesson.description}
        pairs={lesson.pairs}
      />
    </div>
  );
}
