import React from "react";

export default function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex flex-col gap-2">
          <div className="font-semibold">SkaiScraper<span className="ml-[1px] align-super text-[10px]">™</span></div>
          <p className="max-w-xs text-gray-500">AI-powered transparency for roofing & restoration claims.</p>
        </div>
        <ul className="flex flex-wrap gap-4 text-gray-600">
          <li><a href="#" className="hover:text-gray-900">Terms</a></li>
          <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
          <li><a href="#contact" className="hover:text-gray-900">Contact</a></li>
          <li className="text-gray-600 dark:text-gray-400">© {year} SkaiScraper™</li>
        </ul>
      </div>
    </footer>
  );
}
