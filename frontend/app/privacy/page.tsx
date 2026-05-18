export default function PrivacyPage() {
  return (
    <div className="page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p>This is a personal portfolio site. I do not sell, share, or monetize your data. No analytics, no tracking cookies, no advertising.</p>

        <h2>What data is collected</h2>
        <p>The contact form collects your name, email address, and message. Submitting the form is voluntary — you choose what to share.</p>

        <h2>Legal basis (GDPR)</h2>
        <p>Processing is based on legitimate interest: you are contacting me, and I need your email to respond. No automated decisions or profiling take place.</p>

        <h2>How data is used</h2>
        <p>Your contact information is used solely to respond to your inquiry. It is never sold, shared with third parties for marketing, or used for any purpose beyond our conversation.</p>

        <h2>Data storage</h2>
        <p>Contact form submissions are stored in a Supabase database hosted in the United States. Supabase acts as a data processor and does not access your data for its own purposes.</p>

        <h2>Retention</h2>
        <p>Contact form data is retained indefinitely unless you request deletion. I keep it to maintain context for ongoing conversations and professional relationships.</p>

        <h2>Your rights</h2>
        <p>Under GDPR (EU/UK residents) and CCPA (California residents), you have the right to:</p>
        <ul>
          <li>Know what personal data I hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data — including from the database and from Slack</li>
          <li>Receive a copy of your data</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>To exercise these rights, email me at the address on the Contact page. I will respond within 30 days as required by law.</p>

        <h2>CCPA notice</h2>
        <p>I do not sell personal information. I do not use your data for targeted advertising. I collect only the categories of information you voluntarily provide (name, email, message content).</p>

        <h2>Third-party services</h2>
        <p>This site uses the following services that may process your data:</p>
        <ul>
          <li><strong>Vercel</strong> — hosting. May process IP addresses and request metadata.</li>
          <li><strong>Supabase</strong> — database. Stores contact form submissions.</li>
          <li><strong>Cloudflare</strong> — DNS, security, and bot protection (Turnstile). Processes IP addresses and security challenge data. Turnstile does not track you across sites.</li>
          <li><strong>Slack</strong> — when you submit the contact form, your name, email, and message are forwarded to a private Slack channel so I can respond quickly. The message persists in Slack unless deleted.</li>
        </ul>
        <p>None of these services receive your data for their own marketing or advertising purposes.</p>

        <h2>Children&apos;s privacy</h2>
        <p>This site is not directed at children under 13, and I do not knowingly collect data from them.</p>

        <h2>International transfers</h2>
        <p>Data is stored in the United States. By using the contact form, you consent to this transfer. Supabase and Vercel maintain Standard Contractual Clauses for EU data transfers.</p>

        <h2>Changes</h2>
        <p>If this policy changes, I&apos;ll update this page.</p>

        <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)' }}>
          Last updated: May 2026 &middot; Questions? Use the contact form.
        </p>
      </div>
    </div>
  )
}
