// React import not required with the new JSX transform
import macFrame from "@/assets/ai-analysis.jpg";
import phoneFrame from "@/assets/damage-inspection.jpg";
import radarImg from "@/assets/weather-radar.jpg";

type Props = {
  images?: string[];
};

export default function InvestorDemoStrip({ images }: Props) {
  const imgs = images ?? [macFrame, phoneFrame, radarImg];

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="mb-4 text-2xl font-semibold">Investor Demo Strip</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Preview of the three screens we’ll use in the investor deck — Dashboard, AI Scope Builder,
        Weather+Code.
      </p>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {/* MacBook mock */}
        <div className="flex-1">
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl">
            <div className="bg-neutral-900 p-4 text-sm text-muted-foreground">
              MacBook Pro • Dashboard
            </div>
            <img
              src={(imgs[0] as any)?.src || imgs[0]}
              alt="Dashboard mock"
              className="h-[360px] w-full object-cover"
            />
          </div>
        </div>

        {/* Center: Phone + Tablet stack */}
        <div className="flex w-64 flex-col items-center gap-4">
          <div className="h-96 w-48 overflow-hidden rounded-lg border border-neutral-800 bg-black shadow-lg">
            <img
              src={(imgs[1] as any)?.src || imgs[1]}
              alt="AI Scope mock"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-sm text-muted-foreground">iPhone Pro Max • AI Scope</div>
        </div>

        {/* Right: Radar */}
        <div className="flex-1">
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl">
            <div className="bg-neutral-900 p-4 text-sm text-muted-foreground">
              Weather + Code • Proof
            </div>
            <img
              src={(imgs[2] as any)?.src || imgs[2]}
              alt="Weather radar mock"
              className="h-[360px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
