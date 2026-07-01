import Link from "next/link";

type SectionLinkProps = {
  title: string;
  description: string;
  href: string;
};

export function SectionLink({ title, description, href }: SectionLinkProps) {
  return (
    <Link
      href={href}
      className="group border border-white/10 p-6 transition hover:border-white/35"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-medium text-white">{title}</h2>
          <p className="leading-7 text-white/55">{description}</p>
        </div>
        <span className="text-2xl text-white/35 transition group-hover:text-white">
          /
        </span>
      </div>
    </Link>
  );
}
