export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`brand-mark flex items-baseline font-semibold tracking-tight ${className}`}>
      <span className="text-[1.05rem] leading-none md:text-[1.1rem]">SkaiScraper</span>
      <sup className="ml-0.5 text-[10px] leading-none opacity-70">TM</sup>
    </div>
  );
}
