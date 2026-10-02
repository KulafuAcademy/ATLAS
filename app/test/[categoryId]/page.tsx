import { notFound } from "next/navigation";

import { CategoryTestPage } from "@/components/training/CategoryTestPage";
import { trainingCategories } from "@/data/trainingCategories";
import { trainingSections } from "@/data/trainingSections";

type CategoryTestRouteProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function CategoryTestRoute({
  params,
}: CategoryTestRouteProps) {
  const { categoryId } = await params;
  const category = trainingCategories.find((item) => item.id === categoryId);
  const section = trainingSections.find((item) => item.id === categoryId);

  if (!category || !section || category.status !== "available") {
    notFound();
  }

  return <CategoryTestPage category={category} pairs={section.pairs} />;
}
