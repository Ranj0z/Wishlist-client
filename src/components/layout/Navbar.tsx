import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Gift, LogOut, Menu, X } from "lucide-react";
import type { RootState } from "../../app/store";
import { logout } from "../../reducers/login/userSlice";
import ThemeToggle from "./ThemeToggle";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${
    isActive ? "text-primary font-medium" : "text-base-content/70 hover:text-base-content"
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const close = () => setOpen(false);

  const userLinks = !user ? (
    <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
  ) : user.role === "admin" ? (
    <>
      <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
      <NavLink to="/admin/users" className={linkClass} onClick={close}>Users</NavLink>
      <NavLink to="/admin/wishlists" className={linkClass} onClick={close}>All Wishlists</NavLink>
      <NavLink to="/admin/payments" className={linkClass} onClick={close}>Payments</NavLink>
      <NavLink to="/admin/tickets" className={linkClass} onClick={close}>Tickets</NavLink>
    </>
  ) : (
    <>
      <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
      <NavLink to="/wishlists" className={linkClass} onClick={close}>My Wishlists</NavLink>
      <NavLink to="/support" className={linkClass} onClick={close}>Support</NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 h-16 bg-base-100 border-b border-base-300">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-primary">
          <Gift size={20} />
          Wishlist
        </Link>

        <nav className="hidden md:flex items-center gap-6">{userLinks}</nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-base-content/70">
                {user.firstName ?? user.email}
                {user.role === "admin" && (
                  <span className="ml-1 badge badge-xs badge-primary">admin</span>
                )}
              </span>
              <button
                onClick={() => dispatch(logout())}
                className="btn btn-sm btn-ghost gap-2"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Sign up</Link>
            </div>
          )}

          <button
            className="md:hidden btn btn-sm btn-ghost btn-circle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-base-100 border-b border-base-300 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-3">{userLinks}</div>
          {user ? (
            <button
              onClick={() => { dispatch(logout()); close(); }}
              className="btn btn-sm btn-ghost w-full justify-start gap-2"
            >
              <LogOut size={16} />
              Log out
            </button>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-sm btn-ghost flex-1" onClick={close}>Log in</Link>
              <Link to="/register" className="btn btn-sm btn-primary flex-1" onClick={close}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
