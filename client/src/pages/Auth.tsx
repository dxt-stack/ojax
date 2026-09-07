import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, post } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ErrBox } from "../context/ToastContext";
import { Icon } from "../lib/icons";
import { universities } from "../lib/meta";
import type { University } from "../lib/types";
import { useEffect } from "react";
import type { Session } from "../lib/api";

function PasswordInput({ value, onChange, placeholder, autoComplete }: any) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        className="input"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ paddingRight: 44 }}
      />
      <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility"
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: 0, color: "var(--ink-3)" }}>
        <Icon name={show ? "eye" : "eyeOff"} size={18} />
      </button>
    </div>
  );
}

function useNext() {
  const [sp] = useSearchParams();
  return sp.get("next") || "/";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { loginSession } = useAuth();
  const nav = useNavigate();
  const next = useNext();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const d = await post<Session>("/api/auth/login", { email, password });
      loginSession(d.user, d.accessToken);
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Welcome back 👋</h1>
        <div className="sub">Sign in to shop, sell and join campus events.</div>
        {err && <ErrBox>{err}</ErrBox>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu.ng" required autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <PasswordInput value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-foot">
          <Link to="/forgot-password">Forgot password?</Link> · New here? <Link to="/register">Create an account</Link>
        </div>
        <div className="demo-box" style={{ marginTop: 18, background: "var(--blue-bg)", border: "1px dashed var(--blue)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "var(--ink-2)" }}>
          <b style={{ color: "var(--blue)" }}>Demo accounts:</b>{" "}
          tunde@ojax.demo · chiamaka@ojax.demo (password <code>OjaX@2025demo</code>)
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => { setEmail("tunde@ojax.demo"); setPassword("OjaX@2025demo"); }}>Fill buyer</button>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => { setEmail("chiamaka@ojax.demo"); setPassword("OjaX@2025demo"); }}>Fill seller</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", universityCode: "", department: "", level: "", isOrg: false, orgName: "",
  });
  const [unis, setUnis] = useState<University[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [pw2, setPw2] = useState("");
  const { loginSession } = useAuth();
  const nav = useNavigate();
  const next = useNext();

  useEffect(() => {
    universities().then(setUnis);
  }, []);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.password.length < 8) return setErr("Password must be at least 8 characters.");
    if (form.password !== pw2) return setErr("Passwords don't match.");
    if (!form.fullName.trim() || !form.email.trim()) return setErr("Fill in your name and email.");
    setBusy(true);
    try {
      const d = await post<Session>("/api/auth/register", form);
      loginSession(d.user, d.accessToken);
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card wide">
        <h1>Join OjaX 🎓</h1>
        <div className="sub">Free for students &amp; student organisations.</div>
        {err && <ErrBox>{err}</ErrBox>}
        <div className="role-toggle">
          <button type="button" className={!form.isOrg ? "active" : ""} onClick={() => set("isOrg", false)}>
            🎒 Student <span className="cap">buy &amp; sell on campus</span>
          </button>
          <button type="button" className={form.isOrg ? "active" : ""} onClick={() => set("isOrg", true)}>
            🏛️ Organisation <span className="cap">post events &amp; earn</span>
          </button>
        </div>
        <form onSubmit={submit}>
          {form.isOrg ? (
            <div className="field">
              <label>Organisation / association name</label>
              <input className="input" value={form.orgName} onChange={(e) => set("orgName", e.target.value)} placeholder="e.g. NACOSS UNILAG Chapter" required />
            </div>
          ) : null}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Full name{form.isOrg ? " (contact person)" : ""} <span className="req">*</span></label>
              <input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder={form.isOrg ? "Your name" : "e.g. Ada Obi"} required />
            </div>
            <div className="field">
              <label>Email <span className="req">*</span></label>
              <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@school.edu.ng" required autoComplete="email" />
            </div>
          </div>
          <div className="field">
            <label>University</label>
            <select className="select" value={form.universityCode} onChange={(e) => set("universityCode", e.target.value)}>
              <option value="">Select your university…</option>
              {unis.map((u) => <option key={u.code} value={u.code}>{u.name} — {u.city}</option>)}
              <option value="OTHER">Other / not listed</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Department / course</label>
              <input className="input" value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Computer Science" />
            </div>
            <div className="field">
              <label>Level</label>
              <select className="select" value={form.level} onChange={(e) => set("level", e.target.value)}>
                <option value="">Select…</option>
                {["100L", "200L", "300L", "400L", "500L", "600L", "Graduate", "Staff"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Password <span className="req">*</span></label>
              <PasswordInput value={form.password} onChange={(e: any) => set("password", e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" />
            </div>
            <div className="field">
              <label>Confirm password <span className="req">*</span></label>
              <PasswordInput value={pw2} onChange={(e: any) => setPw2(e.target.value)} placeholder="Repeat password" autoComplete="new-password" />
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 0 }}>
            By joining you agree to trade safely: meet in public spots and never pay before inspecting items.
          </p>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? "Creating account…" : "Create my account"}</button>
        </form>
        <div className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await post("/api/auth/forgot-password", { email });
      setDone(true);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Reset password</h1>
        <div className="sub">Enter your email and we'll send a reset link (demo: check server logs).</div>
        {done ? (
          <div className="ok-box">✅ If an account exists for <b>{email}</b>, a reset token is on its way (demo: visible in the server console).</div>
        ) : (
          <>
            {err && <ErrBox>{err}</ErrBox>}
            <form onSubmit={submit}>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
            </form>
            <div className="auth-foot"><Link to="/login">← Back to sign in</Link></div>
          </>
        )}
      </div>
    </div>
  );
}

export function ResetPassword() {
  const [sp] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(sp.get("token") || "");
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await post("/api/auth/reset-password", { email, token, password: pw });
      setDone(true);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Set a new password</h1>
        {done ? (
          <div className="ok-box">✅ Password updated! <Link to="/login" style={{ fontWeight: 800 }}>Sign in now →</Link></div>
        ) : (
          <>
            {err && <ErrBox>{err}</ErrBox>}
            <form onSubmit={submit}>
              <div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="field"><label>Reset token</label><input className="input" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Paste the token from your email" /></div>
              <div className="field"><label>New password</label><PasswordInput value={pw} onChange={(e: any) => setPw(e.target.value)} autoComplete="new-password" /></div>
              <button className="btn btn-primary btn-block" disabled={busy || pw.length < 8}>{busy ? "Updating…" : "Update password"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
