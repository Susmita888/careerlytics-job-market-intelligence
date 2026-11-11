import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { errMsg } from "../api";

export default function Auth({ mode }) {
  const reg = mode === "register";
  const { signIn } = useAuth();
  const go = useNavigate();
  const [f, setF] = useState({ full_name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await signIn(reg ? "/auth/register" : "/auth/login", reg ? f : { email: f.email, password: f.password });
      go(reg ? "/resume" : "/dashboard");
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="panel mx-auto mt-10 max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">{reg ? "Create your account" : "Sign in"}</h1>
      {reg && <label className="block text-sm font-medium">Name<input className="input mt-1" value={f.full_name} onChange={set("full_name")} autoComplete="name" /></label>}
      <label className="block text-sm font-medium">Email<input className="input mt-1" type="email" required value={f.email} onChange={set("email")} autoComplete="email" /></label>
      <label className="block text-sm font-medium">Password
        <input className="input mt-1" type="password" required minLength={reg ? 8 : 1} value={f.password} onChange={set("password")} autoComplete={reg ? "new-password" : "current-password"} />
        {reg && <span className="text-xs text-muted">At least 8 characters.</span>}
      </label>
      {err && <p role="alert" className="rounded bg-gap-soft p-2 text-sm text-gap">{err}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : reg ? "Create account" : "Sign in"}</button>
      <p className="text-sm text-muted">
        {reg ? <>Already registered? <Link className="font-semibold text-brand" to="/login">Sign in</Link></> : <>New here? <Link className="font-semibold text-brand" to="/register">Create an account</Link></>}
      </p>
    </form>
  );
}
