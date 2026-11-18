import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/services';
import { errorMessage, USE_MOCK } from '@/api/client';
import { useAuth } from '@/store/auth';


export default function Login() {
  const { token, setSession } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  if (token) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      // ignore stray spaces from copy-paste (" scoop123" would otherwise fail)
      setSession(await authApi.login({ email: email.trim(), password: password.trim() }));
      nav(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setShake((s) => s + 1);
    } finally { setBusy(false); }
  };

  return (
    <div className="admin grid min-h-screen place-items-center p-4">
      <div className="w-[min(380px,100%)]">
        <Link to="/" className="mb-5 block text-center text-[30px] text-[#495057]"><b>Melt &amp; Magic</b> Admin</Link>
        <div className="card">
          <form key={shake} onSubmit={submit} className={`card-body grid gap-3 ${shake ? 'animate-shake' : ''}`}>
            <p className="mb-1 text-center text-[#6c757d]">Sign in to start your session</p>
            <label className="field">Email<input type="email" required autoComplete="username" className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className="field">Password
              <input type={show ? 'text' : 'password'} required minLength={6} autoComplete="current-password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Show password</label>
            {error && <div className="rounded border border-[#f1aeb5] bg-[#f8d7da] px-3 py-2 text-[14px] text-[#842029]" role="alert">{error}</div>}
            <button disabled={busy} className="btn-dark w-full !py-2">{busy ? 'Signing in...' : 'Sign In'}</button>
            <Link to="/" className="text-center text-[14px] text-[#1e3a5f] hover:underline">Back to website</Link>
          </form>
        </div>
        {USE_MOCK && (
          <div className="alert-warning mt-3 text-[13px]">
            <b>Demo login:</b> admin@meltandmagic.lk / scoop123
          </div>
        )}
      </div>
    </div>
  );
}
