export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-gradient-primary text-white py-16 lg:py-24 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-white/5" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10 animate-reveal">
        {eyebrow && (
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-[0.18em] mb-5 backdrop-blur-sm">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-5 leading-tight text-white">
          {title}
        </h1>
        {subtitle && <p className="max-w-2xl text-lg text-white/80 leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
