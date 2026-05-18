export default function PrivacyPage() {
  return (
    <div className="page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p>This is a personal portfolio site. I do not sell, share, or monetize your data.</p>

        <h2>What data is collected</h2>
        <p>The contact form collects the name, email, and message you provide. This data is stored securely and used only to respond to your inquiry.</p>

        <h2>Third-party services</h2>
        <p>This site is hosted on Vercel and uses Supabase for data storage. Neither service receives your data for their own purposes. The site does not use analytics, tracking cookies, or advertising.</p>

        <h2>Your rights</h2>
        <p>You can request deletion of your contact form data at any time by emailing me. I will remove your information within 30 days.</p>

        <p className="text-sm" style={{ marginTop: '3rem', color: 'var(--color-text-muted)' }}>
          Last updated: May 2026
        </p>
      </div>
    </div>
  )
}
