import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `The terms for using the ${site.name} app and website: licence, third-party games, warranty, liability and governing law.`,
  alternates: { canonical: "/terms" },
};

const sections = [
  { id: "agreement", label: "About these terms" },
  { id: "licence", label: "Using the app" },
  { id: "download", label: "Downloading safely" },
  { id: "third-party", label: "Third-party games" },
  { id: "user-games", label: "Games you make" },
  { id: "online-play", label: "Online play" },
  { id: "website-use", label: "Using the website" },
  { id: "ip", label: "Intellectual property" },
  { id: "warranty", label: "No warranty and liability" },
  { id: "law", label: "Changes and governing law" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  const email = site.creator.email;
  return (
    <LegalPage
      title="Terms of use"
      intro={`The ground rules for using ${site.name} and this website. Short version: it's free, have fun, don't resell it.`}
      sections={sections}
    >
      <section id="agreement">
        <h2>About these terms</h2>
        <p>
          These terms cover the {site.name} desktop app and this website ({site.url}). Both are made by{" "}
          {site.creator.name}, an individual developer in India (&quot;we&quot;, &quot;us&quot;). By downloading the
          app or using the site, you agree to these terms. If you don&apos;t agree, please don&apos;t use them.
        </p>
        <p>
          These terms are written in plain language and should be reviewed by a lawyer before anyone relies on them.
        </p>
        <p>
          How we handle data on the website is explained in the <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

      <section id="licence">
        <h2>Using the app</h2>
        <p>
          {site.name} is free. You may download, install and use it for personal use and private events, such as game
          nights with friends, family gatherings or office parties. You may not sell, resell, rent or sublicense the
          app, or bundle it into a paid product.
        </p>
        <p>
          We may update, change or stop offering the app at any time. You don&apos;t need an account to use it.
        </p>
      </section>

      <section id="download">
        <h2>Downloading safely</h2>
        <p>
          The installer isn&apos;t code-signed yet, so Windows SmartScreen may warn you before running it. Only
          download {site.name} from this website. Copies from anywhere else may have been tampered with, and we
          can&apos;t vouch for them.
        </p>
      </section>

      <section id="third-party">
        <h2>Third-party games</h2>
        <p>
          Some games in {site.name} are ported from open projects by other authors. They keep their original licences,
          which include MIT, BSD-3-Clause and CC-BY 4.0. Cartastrophe is included with its author&apos;s permission.
          Each of these games is credited on its game page and in the NOTICE.md file that ships with the app. Your use
          of those games is also subject to their licences.
        </p>
      </section>

      <section id="user-games">
        <h2>Games you make</h2>
        <p>
          If you create or install your own games in {site.name}, you&apos;re responsible for them, including their
          content and any rights needed to use it. We don&apos;t review, host or endorse games made by users.
        </p>
      </section>

      <section id="online-play">
        <h2>Online play</h2>
        <p>
          The app runs locally on your laptop, and players usually connect over your local network. The optional online
          play mode uses a Cloudflare Tunnel, on a hostname the host sets up themselves, to relay phone controller traffic to the host
          laptop. The tunnel runs on the host&apos;s own Cloudflare account and under Cloudflare&apos;s terms; the app feature that uses it is covered by these terms. It is offered as is and may be
          unavailable at times. The website analytics described in our privacy policy don&apos;t apply to the app.
        </p>
      </section>

      <section id="website-use">
        <h2>Using the website</h2>
        <p>Please use the website fairly. In particular, don&apos;t:</p>
        <ul>
          <li>scrape it in a way that puts load on it or ignores reasonable limits;</li>
          <li>attack, probe, overload or try to break into its endpoints or the services behind them;</li>
          <li>submit fake sign-ups, spam or automated junk through its forms;</li>
          <li>use the open /api/health endpoint for anything other than checking whether the site is up.</li>
        </ul>
        <p>We may block access that breaks these rules.</p>
      </section>

      <section id="ip">
        <h2>Intellectual property</h2>
        <p>
          The {site.name} name, logo, and the design and content of this website belong to {site.creator.name}. You
          may share links and screenshots to talk about {site.name}, but please don&apos;t use the name or logo in a
          way that suggests we endorse something we don&apos;t. Third-party games and assets belong to their
          respective owners.
        </p>
      </section>

      <section id="warranty">
        <h2>No warranty and limits of liability</h2>
        <p>
          The app and website are provided &quot;as is&quot; and &quot;as available&quot;, without any warranty,
          express or implied, including fitness for a particular purpose or that they will be error-free.
        </p>
        <p>
          To the fullest extent the law allows, {site.creator.name} isn&apos;t liable for any indirect, incidental or
          consequential loss, or for loss of data, arising from using or being unable to use the app or website. Since
          {" "}{site.name} is free, our total liability for any claim is limited to zero, or the lowest amount the law
          permits. Nothing here limits liability that can&apos;t legally be limited.
        </p>
      </section>

      <section id="law">
        <h2>Changes and governing law</h2>
        <p>
          We may update these terms. When we do, we&apos;ll change the date at the top of this page. Continuing to use
          the app or website after a change means you accept the updated terms.
        </p>
        <p>
          These terms are governed by the laws of {site.legal.jurisdiction}, and the courts of{" "}
          {site.legal.jurisdiction} have jurisdiction over any dispute. If you live elsewhere, you keep any consumer
          protections your local law gives you.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          Questions about these terms? Email <a href={`mailto:${email}`}>{email}</a> or reach{" "}
          {site.creator.name} on{" "}
          <a href={site.creator.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
