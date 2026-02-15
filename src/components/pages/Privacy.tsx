import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
              Effective: {new Date().toISOString().slice(0, 10)}
            </p>
          </div>

          <p>
            We collect account details and usage data to provide and improve ClearSKai. We do not
            sell personal data.
          </p>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">What We Collect</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Account info (email, name)</li>
              <li>Project/report metadata</li>
              <li>Usage analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">How We Use Data</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Authentication, authorization, and support</li>
              <li>Generating reports and AI features you request</li>
              <li>Improving product reliability and performance</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">Your Choices</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Access, update, or delete your account</li>
              <li>Opt out of marketing emails</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">Contact</h2>
            <p>Questions? Email privacy@clearskairoofing.com</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
