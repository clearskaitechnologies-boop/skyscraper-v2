import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function Terms() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">
              Effective: {new Date().toISOString().slice(0, 10)}
            </p>
          </div>

          <p>
            Welcome to ClearSKai. These Terms govern your use of the ClearSKai platform, reports,
            and related services.
          </p>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">1. Your Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password,
              and for restricting access to your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">2. Acceptable Use</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>No unlawful, infringing, or fraudulent activity.</li>
              <li>No reverse engineering or unauthorized scraping.</li>
              <li>Respect privacy and applicable building codes/regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">3. Data & Reports</h2>
            <p>
              Reports and AI outputs are provided for informational purposes only. You are
              responsible for professional review and compliance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">4. Payment & Plans</h2>
            <p>
              Paid plans are billed per the pricing page. Fees are non-refundable unless required by
              law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">5. Disclaimers</h2>
            <p>
              Service is provided "as is" without warranties. We are not liable for indirect or
              consequential damages.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">6. Contact</h2>
            <p>Questions? Email support@clearskairoofing.com</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
