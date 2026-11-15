import type { Metadata } from "next";
import Link from "next/link";
import { CookiePrefsButton } from "@/components/site/cookie-prefs-button";
import { LegalPage } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookies",
  description: `Every cookie the ${site.name} website sets, what it is for, how long it lasts, and how to change your choice.`,
  alternates: { canonical: "/cookies" },
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "cookie-list", label: "Cookies we use" },
  { id: "dnt-gpc", label: "Do Not Track and GPC" },
  { id: "change-choice", label: "Changing your choice" },
  { id: "clear-cookies", label: "Clearing cookies" },
  { id: "no-storage", label: "What uses no cookies" },
];

const cookies = [
  {
    name: "ht_consent",
    purpose: 'Remembers your cookie choice ("all" or "essential"). Readable by the page\'s JavaScript.',
    type: "Essential",
    duration: "12 months",
  },
  {
    name: "ht_vid",
    purpose: "A random visitor ID, so visits from the same browser can be grouped. HttpOnly.",
    type: "Analytics",
    duration: "12 months",
  },
  {
    name: "ht_sid",
    purpose: "A random session ID that groups the pages of one visit. HttpOnly.",
    type: "Analytics",
    duration: "30 minutes, extended while you browse",
  },
  {
    name: "ht_last",
    purpose: "The time of your last visit, used to tell new visits from returning ones.",
    type: "Analytics",
    duration: "12 months",
  },
];

export default function CookiesPage() {
  const email = site.creator.email;
  return (
    <LegalPage
      title="Cookies"
      intro={`The ${site.name} website uses four first-party cookies at most, and only one unless you say yes.`}
      sections={sections}
    >
      <section id="overview">
        <h2>Overview</h2>
        <p>
          All our cookies are first-party: they are set by this website ({site.url}) and nobody else. There are no
          advertising cookies and no third-party trackers.
        </p>
        <p>
          We always set one essential cookie to remember your choice. The three analytics cookies are set only after
          you choose &quot;Accept all&quot;. What we record with them is explained in the{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

      <section id="cookie-list">
        <h2>Cookies we use</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Purpose</th>
              <th scope="col">Type</th>
              <th scope="col">Duration</th>
              <th scope="col">Set by</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((c) => (
              <tr key={c.name}>
                <td>
                  <code>{c.name}</code>
                </td>
                <td>{c.purpose}</td>
                <td>{c.type}</td>
                <td>{c.duration}</td>
                <td>{site.name} (first-party)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="dnt-gpc">
        <h2>Do Not Track and Global Privacy Control</h2>
        <p>
          If your browser sends a Do Not Track or Global Privacy Control signal and you haven&apos;t made a choice, we
          treat it as &quot;Essential only&quot;. No analytics cookies are set, and we keep only an anonymous count of
          page views, downloads and clicks (event name and page path, with no IP address, user agent or ID).
        </p>
        <p>If you later choose &quot;Accept all&quot; yourself, we follow that explicit choice.</p>
      </section>

      <section id="change-choice">
        <h2>Changing your choice</h2>
        <p>
          You can change or withdraw your consent at any time. When you withdraw it, <code>ht_last</code> is deleted
          straight away, and the HttpOnly cookies (<code>ht_vid</code> and <code>ht_sid</code>) are deleted on your
          next page view.
        </p>
        <CookiePrefsButton />
      </section>

      <section id="clear-cookies">
        <h2>Clearing cookies in your browser</h2>
        <p>
          You can also delete cookies yourself. Every major browser lets you clear cookies for a single site or for all
          sites:
        </p>
        <ul>
          <li>Chrome and Edge: Settings, then Privacy, then cookies and site data.</li>
          <li>Firefox: Settings, then Privacy &amp; Security, then Cookies and Site Data.</li>
          <li>Safari: Settings, then Privacy, then Manage Website Data.</li>
        </ul>
        <p>
          If you clear <code>ht_consent</code>, we&apos;ll ask for your choice again on your next visit. Questions?
          Email <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </section>

      <section id="no-storage">
        <h2>What uses no cookies</h2>
        <p>
          The page transitions, ASCII animations and shader background are purely visual. They use no cookies, local
          storage or other browser storage. Fonts are bundled with the site, so no font service sets cookies either.
        </p>
      </section>
    </LegalPage>
  );
}
