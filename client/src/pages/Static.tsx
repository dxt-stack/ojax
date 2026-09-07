import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Icon } from "../lib/icons";

const COPY: Record<string, { title: string; body: ReactNode }> = {
  about: {
    title: "About OjaX",
    body: (
      <>
        <p><b>OjaX</b> (from <i>ojà</i>, the Yoruba word for market) is Nigeria's student-built marketplace and campus events
          hub — created for university students, by university students.</p>
        <p>We started with a simple frustration: selling your laptop after final year meant shouting in WhatsApp groups
          or risking stranger-to-stranger deals. Buying a textbook meant hiking to the bookshop on the other side of town.
          And finding out about campus events? Pure luck.</p>
        <p>OjaX fixes that with one trusted space where you know everyone is a fellow student. Every seller's university is
          on their profile, every chat happens on-platform, and meetups happen where you're comfortable.</p>
        <h3 style={{ margin: "18px 0 8px" }}>Our mission</h3>
        <p>To create the most trusted digital marketplace and event platform for university students.</p>
        <h3 style={{ margin: "18px 0 8px" }}>Our vision</h3>
        <p>To become the leading campus marketplace across Nigeria — making it effortless for students to trade goods and
          stay connected with campus life.</p>
        <p className="chip chip-brand" style={{ marginTop: 8 }}> Proudly made in Lagos, Nigeria</p>
      </>
    ),
  },
  safety: {
    title: "Safety & trust",
    body: (
      <>
        <p>OjaX works because trades stay safe. Follow these golden rules:</p>
        <h3 style={{ margin: "14px 0 6px" }}> Meet in public</h3>
        <p>Arrange meetups in busy, public campus spots — the library entrance, the faculty building, a staffed gate.
          Bring a friend if you can.</p>
        <h3 style={{ margin: "14px 0 6px" }}> Keep the chat on OjaX</h3>
        <p>If someone pushes you to WhatsApp or Telegram immediately, that's a warning sign. On-OjaX chats leave a record
          that keeps both of you honest.</p>
        <h3 style={{ margin: "14px 0 6px" }}> Inspect before you pay</h3>
        <p>Test the phone, open the laptop, flip through the textbook. If it's not what was listed, walk away — no hard feelings.</p>
        <h3 style={{ margin: "14px 0 6px" }}> Never pay in advance off-platform</h3>
        <p>No deposits "to hold the item". No "transport fee" via transfer to a random account. Scammers live on urgency —
          slow down and use the in-app payment flow when you buy with delivery.</p>
        <h3 style={{ margin: "14px 0 6px" }}> Report bad behaviour</h3>
        <p>Harassment, spam or suspected fraud? Report the conversation and we'll review it. Verified students who misbehave
          lose their access.</p>
        <div className="chip chip-green">Every user shows their university — that's our trust layer.</div>
      </>
    ),
  },
  help: {
    title: "Help centre",
    body: (
      <>
        <h3 style={{ margin: "0 0 8px" }}>How do I sell an item?</h3>
        <p>Create a free account → tap <b>Sell an item</b> → add up to 8 photos, a price and your meetup spot → publish.
          You'll manage it from your dashboard (edit, pause, mark sold).</p>
        <h3 style={{ margin: "16px 0 8px" }}>How do I buy something?</h3>
        <p>Browse the market, tap an item, then either <b>Add to cart → checkout</b> (with delivery) or <b>Message the seller</b>
          to arrange a campus pickup. Checkout uses the secure OjaPay flow.</p>
        <h3 style={{ margin: "16px 0 8px" }}>What does it cost?</h3>
        <p>Listing is free during our campus launch. Delivery orders include a flat ₦2,500 nationwide shipping fee —
          free on orders above ₦20,000. Sellers keep 100% of the sale.</p>
        <h3 style={{ margin: "16px 0 8px" }}>How do organisations post events?</h3>
        <p>Register as an organisation, then use <b>Events (org)</b> in the dashboard to publish flyers, dates and venues,
          and to track RSVPs.</p>
        <h3 style={{ margin: "16px 0 8px" }}>Is my data safe?</h3>
        <p>Passwords are hashed, sessions are short-lived and rotated, and only your chosen public details (name, university,
          level, photo) are shown to other students.</p>
        <p className="chip chip-blue" style={{ marginTop: 8 }}>Still stuck? Write to help@ojax.app (demo).</p>
      </>
    ),
  },
  contact: {
    title: "Contact us",
    body: (
      <>
        <p>We'd love to hear from you — feedback, school partnerships, or bug reports.</p>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <span className="chip" style={{ justifyContent: "flex-start", padding: "10px 14px" }}> hello@ojax.app (demo)</span>
          <span className="chip" style={{ justifyContent: "flex-start", padding: "10px 14px" }}> @ojaxmarket on Instagram, TikTok & X</span>
          <span className="chip" style={{ justifyContent: "flex-start", padding: "10px 14px" }}> Lagos, Nigeria</span>
        </div>
        <p style={{ marginTop: 16 }}>Want OjaX at your university? <Link to="/contact"><b>Partner with us</b></Link> — we're rolling out
          campus by campus.</p>
      </>
    ),
  },
};

export default function StaticPage({ page }: { page: string }) {
  const c = COPY[page] || COPY.about;
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <div className="breadcrumb"><Link to="/">Home</Link> <Icon name="arrowR" size={13} /> <b>{c.title}</b></div>
      <div className="card" style={{ padding: "28px 26px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 12 }}>{c.title}</h1>
        <div style={{ color: "var(--ink-2)", lineHeight: 1.75, fontSize: 15 }}>{c.body}</div>
      </div>
    </div>
  );
}
