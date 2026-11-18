import { type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast, useUi } from '@/store/ui';

const svg = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);

const CONTACT = [
  { label: 'Call us', value: '+94 76 004 1594', href: 'tel:+94760041594', icon: svg('M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2') },
  { label: 'Email us', value: 'info@neirahtech.com', href: 'mailto:info@neirahtech.com', icon: svg('M3 6h18v12H3zM3 7l9 6 9-6') },
  { label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/94760041594', external: true, icon: svg('M4 20l1.3-3.9A8 8 0 1 1 8 19zM9 10c0 2.5 2.5 5 5 5l1.2-1.2-2-1-.8.8a4 4 0 0 1-2-2l.8-.8-1-2z') },
];

export function Footer() {
  const confetti = useUi((s) => s.confetti);
  const join = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    toast("You're in the Scoop Club. See you on your birthday!");
    confetti();
  };
  return (
    <footer className="relative z-[6] px-[clamp(16px,5vw,80px)] pb-8 pt-10">
      <div className="reveal flex flex-wrap items-center justify-between gap-8 glass !rounded-5xl p-8 md:p-12">
        <div>
          <div className="mb-3 font-mono text-xs uppercase">Scoop Club</div>
          <h3 className="font-serif text-[clamp(30px,3.6vw,44px)] leading-none">Free scoop on your birthday.</h3>
          <p className="mt-2 text-ink/70">Plus a heads-up when a new flavour lands. About one email a month.</p>
        </div>
        <form onSubmit={join} className="flex gap-2 rounded-full border border-white/80 bg-white/60 p-1.5 pl-5">
          <input type="email" required placeholder="you@email.com" aria-label="Email" className="w-52 bg-transparent outline-none" />
          <button className="btn-dark py-2.5">Sign me up</button>
        </form>
      </div>
      <div className="my-12 flex flex-wrap justify-between gap-8">
        <div>
          <div className="font-serif text-[28px] leading-none">Melt &amp; Magic</div>
          <p className="mt-3 text-sm text-ink/70">Small-batch ice cream,<br />made every morning in Colombo.</p>
        </div>
        {[
          ['Shop', [['All treats', '/shop'], ['Build your own', '/build'], ['Cones', '/shop?type=cone'], ['Shakes', '/shop?type=shake']]],
          ['Company', [['Visit us', '/#visit'], ['Reviews', '/#love'], ['Admin', '/admin']]],
        ].map(([h, links]) => (
          <div key={h as string}>
            <h5 className="mb-3 font-mono text-xs uppercase text-ink/50">{h as string}</h5>
            {(links as string[][]).map(([l, to]) => <Link key={l} to={to} className="mb-2 block text-sm font-semibold hover:text-accent hover:underline">{l}</Link>)}
          </div>
        ))}
        <div>
          <h5 className="mb-3 font-mono text-xs uppercase text-ink/50">Contact</h5>
          <div className="grid gap-3.5">
            {CONTACT.map((c) => (
              <a key={c.label} href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noreferrer' : undefined} className="group flex items-center gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ink/5 text-ink/70 transition group-hover:bg-accent group-hover:text-white">{c.icon}</span>
                <span className="leading-tight">
                  <small className="block text-[12px] text-ink/50">{c.label}</small>
                  <span className="text-sm font-semibold group-hover:text-accent">{c.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid justify-items-center gap-4 border-t border-ink/10 pt-7 text-center text-[13px] text-ink/60">
        <p>© 2026 Melt &amp; Magic. All rights reserved.</p>
                <p className="mt-2">Designed &amp; developed by</p>
        <a href="mailto:info@neirahtech.com" className="rounded-2xl bg-white px-4 py-2.5 shadow-card transition hover:-translate-y-0.5">
          <img src="/neirah-logo-footer.jpg" alt="neirah tech" width={570} height={362} loading="lazy" className="h-14 w-auto" />
        </a>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href="tel:+94760041594" className="hover:text-accent">+94 76 004 1594</a>
          <a href="mailto:info@neirahtech.com" className="hover:text-accent">info@neirahtech.com</a>
        </div>
      </div>
    </footer>
  );
}
