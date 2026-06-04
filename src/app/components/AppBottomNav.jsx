export default function AppBottomNav({ navItems, routeTab }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-5 pb-5 pt-2 lg:hidden">
      <div className="mx-auto grid max-w-[335px] grid-cols-5 gap-1 rounded-[2rem] bg-[#050506] p-1.5 text-white/55 shadow-[0_24px_60px_-26px_rgba(0,0,0,0.75)]">
        {navItems.map(([label, href, Icon]) => (
          <a key={label} href={href} className={`flex flex-col items-center gap-1 rounded-[1.45rem] px-2 py-2 text-[0.64rem] font-bold transition ${routeTab === label ? 'bg-[#bff4ef] text-[#050506]' : 'hover:bg-white/10 hover:text-white'}`}>
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
