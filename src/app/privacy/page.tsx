import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `What the ${site.name} website collects, why, how long it is kept, and how to control it.`,
  alternates: { canonical: "/privacy" },
};

const sections = [
  { id: "who-we-are", label: "Who we are" },
  { id: "summary", label: "The short version" },
  { id: "without-consent", label: "Without consent" },
  { id: "with-consent", label: "With consent" },
  { id: "email", label: "Email sign-up" },
  { id: "legal-bases", label: "Legal bases" },
  { id: "sharing", label: "Who processes data" },
  { id: "retention", label: "How long we keep it" },
  { id: "your-rights", label: "Your rights" },
  { id: "children-app", label: "Children and the app" },
  { id: "changes-contact", label: "Changes and contact" },
];

export default function PrivacyPage() {
  const email = site.creator.email;
  return (
    <LegalPage
      title="Privacy policy"
      intro={`How the ${site.name} website handles your data, in plain English. No ads, no third-party trackers, and nothing is sold.`}
      sections={sections}
    >
      <section id="who-we-are">
        <h2>Who we are</h2>
        <p>
          {site.name} is a free Windows desktop app for party games. This website ({site.url}) markets the app and
          serves the installer download. Both are made and run by {site.creator.name}, an individual developer based
          in India, who is the controller of the personal data described here (&quot;we&quot;, &quot;us&quot;).
        </p>
        <p>
          You can reach us at <a href={`mailto:${email}`}>{email}</a> about anything on this page.
        </p>
        <p>
          This policy is written in plain language. It should be reviewed by a lawyer before anyone relies on it.
        </p>
      </section>

      <section id="summary">
        <h2>The short version</h2>
        <ul>
          <li>No ads, no third-party advertising or analytics trackers, and we never sell your data.</li>
          <li>
            If you don&apos;t accept analytics cookies, we only keep an anonymous count of page views, downloads and
            clicks.
          </li>
          <li>
            If you choose &quot;Accept all&quot;, we record details about your visit (listed below) to understand who
            uses the site and how.
          </li>
          <li>If you join the mailing list, we keep your email address to send {site.name} release news only.</li>
          <li>Raw IP addresses and full browser strings are deleted after 90 days.</li>
        </ul>
        <p>
          Fonts are bundled with the site when it is built, so your browser doesn&apos;t contact Google or any other
          font service when you visit.
        </p>
      </section>

      <section id="without-consent">
        <h2>What we collect without consent</h2>
        <p>
          Until you make a choice, if you pick &quot;Essential only&quot;, or if your browser sends a Do Not Track or
          Global Privacy Control signal and you haven&apos;t made a choice, we store only an anonymous count of page
          views, downloads and clicks. Each entry holds the event name and the page path. It contains no IP address,
          no user agent and no identifier, so it can&apos;t be tied to you.
        </p>
        <p>
          For downloads we also record the country the download came from. We set one essential cookie,{" "}
          <code>ht_consent</code>, to remember your choice. See the <Link href="/cookies">cookies page</Link> for
          details.
        </p>
        <p>
          Like any website, our host Vercel receives your IP address with each request and may keep it briefly in its
          server logs for security and operations.
        </p>
      </section>

      <section id="with-consent">
        <h2>What we collect if you accept analytics</h2>
        <p>
          If you choose &quot;Accept all&quot;, we set a random visitor ID and session ID (see the{" "}
          <Link href="/cookies">cookies page</Link>) and record the following.
        </p>
        <h3>Once per session</h3>
        <ul>
          <li>Your IP address and an approximate location derived from it (country, region and city).</li>
          <li>
            Your user agent and what we parse from it: browser and version, operating system and version, device type,
            vendor and model, and whether the visitor looks like a bot.
          </li>
          <li>Your preferred languages and timezone.</li>
          <li>Screen size, viewport size and pixel ratio.</li>
          <li>Your colour scheme and reduced-motion preferences.</li>
          <li>CPU core count and device memory, when your browser exposes them.</li>
          <li>Connection type and whether your device supports touch.</li>
          <li>The referring page, any UTM campaign parameters, and the page you landed on.</li>
        </ul>
        <h3>For each event</h3>
        <ul>
          <li>The event name and page path (query strings are dropped).</li>
          <li>Time spent on the page and how far you scrolled.</li>
          <li>The labels of buttons and links you click, and the destination of links that leave the site.</li>
        </ul>
        <h3>Downloads</h3>
        <p>
          When you download the installer we record the download and its country. With consent, we also record your
          IP address and the referring page.
        </p>
      </section>

      <section id="email">
        <h2>Email sign-up</h2>
        <p>
          If you join the mailing list, we store your email address, when you signed up, which form you used, and the
          IP address you signed up from (to help prevent abuse). We use your address only to send {site.name} release
          news. No newsletter has been sent yet.
        </p>
        <p>
          Every email will include a one-click unsubscribe link. You can also email{" "}
          <a href={`mailto:${email}`}>{email}</a> to be removed.
        </p>
      </section>

      <section id="legal-bases">
        <h2>Why we are allowed to use your data</h2>
        <p>
          We rely on the following grounds under the GDPR, the UK GDPR and India&apos;s Digital Personal Data
          Protection Act, 2023:
        </p>
        <ul>
          <li>
            <strong>Consent</strong> for analytics cookies and the data collected with them, and for the mailing list.
            You can withdraw consent at any time; this doesn&apos;t affect processing that already happened.
          </li>
          <li>
            <strong>Legitimate interest</strong> (or, under Indian law, a legitimate use) for keeping the site secure
            and preventing abuse, such as storing the sign-up IP address, and for the essential cookie that remembers
            your choice.
          </li>
        </ul>
      </section>

      <section id="sharing">
        <h2>Who processes your data</h2>
        <p>We don&apos;t sell or rent personal data, and we don&apos;t share it with advertisers. Two service providers process it on our behalf:</p>
        <ul>
          <li>
            <strong>Vercel</strong> hosts the website and its serverless functions. It sees request IP addresses in
            its logs.
          </li>
          <li>
            <strong>Supabase</strong> provides our database and file storage. It stores analytics, mailing-list
            subscribers and download records, and serves the installer file.
          </li>
        </ul>
        <p>
          These providers may process data outside your country, including in the United States, under their own
          data-protection terms. We may also disclose data if the law requires it.
        </p>
      </section>

      <section id="retention">
        <h2>How long we keep it</h2>
        <ul>
          <li>Raw IP addresses and full user-agent strings, including sign-up IPs: deleted after 90 days.</li>
          <li>Events, sessions and visitor records: deleted after 13 months.</li>
          <li>
            Mailing-list subscribers: kept until you unsubscribe. After that we keep the record marked as unsubscribed
            so we never email you again. Ask us and we&apos;ll delete it completely.
          </li>
          <li>Anonymous counts contain no personal data.</li>
        </ul>
      </section>

      <section id="your-rights">
        <h2>Your rights</h2>
        <p>Depending on where you live, you can ask us to:</p>
        <ul>
          <li>give you access to the personal data we hold about you;</li>
          <li>correct data that is wrong;</li>
          <li>delete your data;</li>
          <li>
            withdraw your consent (use the <Link href="/cookies">cookie settings</Link> or unsubscribe link);
          </li>
          <li>stop processing based on legitimate interest (object).</li>
        </ul>
        <p>
          Email <a href={`mailto:${email}`}>{email}</a> and we&apos;ll reply within 30 days. We may need a detail
          such as your visitor ID or email address to find your records. You can also complain to your local
          supervisory authority (for example, in the EEA or UK) or, in India, to the Data Protection Board of India.
        </p>
      </section>

      <section id="children-app">
        <h2>Children and the desktop app</h2>
        <p>
          This website isn&apos;t directed at children under 13 (under 16 in the EEA), and we don&apos;t knowingly
          collect their data. If you think a child has given us data, email us and we&apos;ll delete it.
        </p>
        <p>
          The {site.name} desktop app runs on your own laptop. It has no accounts and no telemetry, and the website
          analytics described here don&apos;t apply to it. Gameplay happens on your local network; players&apos;
          phones send only what is needed to run a game session on the host laptop. The app&apos;s online-play option
          uses a Cloudflare Tunnel to hottake.pranshubasak.site to relay phone controller traffic to the host laptop.
          That relay is part of the app and is covered by our <Link href="/terms">terms of use</Link>.
        </p>
      </section>

      <section id="changes-contact">
        <h2>Changes and contact</h2>
        <p>
          If we change this policy, we&apos;ll update it here and change the date at the top. If a change is
          significant, we&apos;ll ask for your consent again where the law requires it.
        </p>
        <p>
          Questions or requests: <a href={`mailto:${email}`}>{email}</a>. You can also find {site.creator.name} on{" "}
          <a href={site.creator.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
