import { notFound } from "next/navigation";
import FillerPage from "@/app/components/marketing/FillerPage";
import { getFillerContent } from "@/app/lib/fillerContent";

export const createFillerPage = (slug: string) => () => {
  const content = getFillerContent(slug);
  if (!content) {
    notFound();
  }

  return <FillerPage {...content} />;
};
