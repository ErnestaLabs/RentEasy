export default function AppBottomNav({ navItems, routeTab }) {
  // Socially-kit nav: airy white frosted pill, green active state (RentEazy brand).
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-5 pb-5 pt-2 lg:hidden">
      <div className="mx-auto flex max-w-[360px] items-center justify-between gap-1 rounded-full border border-white/70 bg-white/85 p-1.5 shadow-[0_22px_54px_-26px_rgba(9,34,67,0.5),inset_0_1px_0_white] backdrop-blur-xl">
        {navItems.map(([label, href, Icon]) => {
          const active = routeTab === label;
          return (
            <a
              key={label}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2.5 text-[0.6rem] font-semibold transition ${active ? 'bg-[#edf8ee] text-[#2f7d32]' : 'text-slate-400 hover:text-[#092243]'}`}
            >
              <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
