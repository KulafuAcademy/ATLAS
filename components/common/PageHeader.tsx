type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="max-w-4xl space-y-6">
      <p className="text-sm uppercase tracking-[0.32em] text-white/40">
        {eyebrow}
      </p>
      <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white md:text-7xl">
        {title}
      </h1>
      <p className="max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
        {description}
      </p>
    </section>
  );
}
