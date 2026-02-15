"use client";

export default function InvestorDeckEmbed() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      {/* Option 1: PDF Embed (if you have the PDF in /public/docs/) */}
      {/* <iframe
        src="/docs/SkaiScraper_Investor_Deck.pdf#view=FitH"
        className="w-full h-[800px]"
        title="SkaiScraper Investor Deck"
      /> */}

      {/* Option 2: Google Slides Embed */}
      {/* <iframe
        src="https://docs.google.com/presentation/d/YOUR_PRESENTATION_ID/embed?start=false&loop=false&delayms=3000"
        className="w-full h-[800px]"
        title="SkaiScraper Investor Deck"
        allowFullScreen
      /> */}

      {/* Option 3: Link to download (until deck is embedded) */}
      <div className="flex h-[600px] w-full flex-col items-center justify-center p-12 text-center">
        <div className="mb-6 text-6xl">📊</div>
        <h3 className="mb-4 text-2xl font-bold text-white">Investor Pitch Deck</h3>
        <p className="mb-6 max-w-md text-gray-300">
          Our complete 15-slide investor deck covering market opportunity, traction, business model,
          and the path to Series A.
        </p>
        <div className="flex gap-4">
          <a
            href="/SKAISCRAPER_INVESTOR_DECK.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-gradient-cyan px-6 py-3 font-semibold text-white transition-all hover:opacity-95 hover:shadow-xl"
          >
            Download Deck (PDF)
          </a>
          <a
            href="/investor"
            className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-xl transition-all hover:bg-white/20"
          >
            View Full Investor Materials
          </a>
        </div>
      </div>
    </div>
  );
}
