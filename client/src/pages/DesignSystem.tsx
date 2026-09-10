import { Link } from "react-router-dom";
import { Icon, LogoMark } from "../lib/icons";

const colors = [
  ["Market orange", "#E95B2B", "Primary actions, active states"],
  ["Deep ink", "#17212B", "Navigation, dark surfaces"],
  ["Campus green", "#398D70", "Trust, success, verification"],
  ["Warm peach", "#FFF3ED", "Soft active backgrounds"],
  ["Quiet grey", "#F7F8FA", "App canvas and fields"],
];

export default function DesignSystem() {
  return <main className="ds-page"><div className="container"><div className="ds-head"><div><div className="section-kicker">OJAX / FOUNDATIONS</div><h1>Design system<br /><em>for the campus exchange.</em></h1><p>A calm, trusted visual language for buying, selling and belonging. Built to feel familiar on day one and unmistakably OjaX by day thirty.</p></div><Link className="btn btn-primary" to="/">Back to product <Icon name="arrowR" size={15} /></Link></div><div className="ds-rule" />
      <section className="ds-section"><div className="ds-label">01 / COLOR TOKENS</div><div className="ds-color-grid">{colors.map(([name, hex, use]) => <div key={hex} className="ds-color"><span style={{ background: hex }} /><b>{name}</b><code>{hex}</code><small>{use}</small></div>)}</div></section>
      <section className="ds-section"><div className="ds-label">02 / TYPOGRAPHY</div><div className="ds-type-grid"><div><small>DISPLAY / 56</small><h2>Your campus.<br /><em>One market.</em></h2></div><div><small>BODY / 16</small><p>Buy, sell and plug into campus life with people you can trust. Made for Nigerian students, from first lecture to final year.</p><small>LABEL / 11 · 0.17EM TRACKING</small><div className="eyebrow ds-eyebrow"><span className="pulse-dot" /> CAMPUS EXCHANGE</div></div></div></section>
      <section className="ds-section"><div className="ds-label">03 / COMPONENTS</div><div className="ds-components"><div className="ds-demo-card"><div className="ds-demo-top"><span className="chip chip-green"><Icon name="check" size={12} /> VERIFIED</span><button className="icon-demo"><Icon name="heart" size={16} /></button></div><div className="ds-demo-art"><LogoMark size={62} /></div><b>Trust-led commerce</b><small>Simple signals, clear choices.</small></div><div className="ds-demo-card ds-buttons"><button className="btn btn-primary">Primary action <Icon name="arrowR" size={15} /></button><button className="btn btn-outline">Secondary action</button><button className="btn btn-dark">Dark surface</button><div className="ds-input"><Icon name="search" size={16} /><span>Search your campus</span></div></div><div className="ds-demo-card ds-spacing"><b>Spacing scale</b><div><i style={{width:8}} /><span>8 / compact</span></div><div><i style={{width:16}} /><span>16 / default</span></div><div><i style={{width:24}} /><span>24 / section</span></div><div><i style={{width:40}} /><span>40 / feature</span></div></div></div></section>
      <section className="ds-section ds-principles"><div className="ds-label">04 / PRODUCT PRINCIPLES</div><div className="principle-grid"><div><b>Trust is visible.</b><p>Verification, reputation and safe meetups are first-class UI, not buried in settings.</p></div><div><b>Campus is the context.</b><p>Every action is grounded in the school, people and places around the student.</p></div><div><b>Warm, never noisy.</b><p>Orange brings energy. Deep ink creates calm. Content gets to lead.</p></div></div></section></div></main>;
}
