export default function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">{subtitle}</div>
      <h2 className="text-xl uppercase tracking-tight">{title}</h2>
    </div>
  );
}
