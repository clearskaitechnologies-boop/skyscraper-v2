import { ReactNode } from "react";

interface StorySectionProps {
  title: string;
  children: ReactNode;
}

export default function StorySection({ title, children }: StorySectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl md:p-10">
      <h2 className="mb-6 text-3xl font-bold text-white">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
