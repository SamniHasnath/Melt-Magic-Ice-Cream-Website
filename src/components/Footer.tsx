import { type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast, useUi } from '@/store/ui';

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
          ['Help', [['Delivery', '/#visit'], ['Allergens', '/#visit'], ['Contact', '/#visit']]],
        ].map(([h, links]) => (
          <div key={h as string}>
            <h5 className="mb-3 font-mono text-xs uppercase text-ink/50">{h as string}</h5>
            {(links as string[][]).map(([l, to]) => <Link key={l} to={to} className="mb-2 block text-sm font-semibold hover:text-accent hover:underline">{l}</Link>)}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-ink/10 pt-6 font-mono text-[12px] text-ink/60">
        <span>© 2026 Melt &amp; Magic</span>
        <span>42 Marine Drive, Colombo 03</span>
      </div>
    </footer>
  );
}
