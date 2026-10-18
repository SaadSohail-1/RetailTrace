
import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  Bell,
  Blocks,
  Database,
  LayoutDashboard,
  Layers,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/schemas", label: "Schemas", icon: Layers },
  { to: "/records", label: "Records & Verification", icon: ShieldCheck },
];

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F5EB] text-[#263326]">
      {/* Top navbar */}
      <header className="sticky top-0 z-30 border-b border-[#D9D28B]/70 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-[#6A795D] transition hover:bg-[#D9D28B]/30 lg:hidden"
            >
              <Menu size={22} />
            </button>

            {/* Brand */}
            <NavLink to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6A795D] text-white">
                <Blocks size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  RetailTrace
                </h1>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#6A795D]">
                  BUSINESS CONSOLE
                </p>
              </div>
            </NavLink>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-2 lg:flex">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#6A795D] text-white shadow-sm"
                      : "text-[#68735C] hover:bg-[#D9D28B]/30 hover:text-[#263326]"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Business Workspace</p>
              <p className="text-xs text-[#8E9162]">Manage your records</p>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-[#D9D28B]/70 p-2.5 text-[#6A795D] transition hover:bg-[#D9D28B]/30"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#B2BD7E]" />
            </button>
          </div>
        </div>

        {/* Mobile navigation dropdown */}
        {mobileMenuOpen && (
          <nav className="border-t border-[#D9D28B]/60 bg-white p-3 lg:hidden">
            <div className="space-y-1">
              {navigation.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#6A795D] text-white"
                        : "text-[#68735C] hover:bg-[#D9D28B]/30"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D9D28B]/70 px-6 py-4 text-center text-xs text-[#68735C]">
        <div className="flex items-center justify-center gap-2">
          <Database size={14} />
          <span>RetailTrace · Blockchain-backed record integrity</span>
          <Activity size={14} />
        </div>
      </footer>
    </div>
  );
}