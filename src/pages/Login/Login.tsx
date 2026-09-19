import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../reducers/login/loginAPI";
import { loginSuccess } from "../../reducers/login/userSlice";
import { getApiErrorMessage } from "../../utils/apiError";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const justVerified = (location.state as { verified?: boolean } | null)?.verified === true;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(loginSuccess({ token: res.token, user: res.user }));

      // Role-based dashboards don't exist until Phases 2–3 — send everyone
      // home for now rather than hitting the catch-all Error page.
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch {
      // error state surfaced via `error` below
    }
  };

  return (
    <section className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-1">Welcome back</h1>
      <p className="text-base-content/70 text-sm mb-8">Log in to your wishlist account.</p>

      {justVerified && (
        <p className="text-success text-sm mb-4">Your account is verified. Log in to continue.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label text-sm">Email</label>
          <input
            type="email"
            required
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label text-sm">Password</label>
          <input
            type="password"
            required
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-error text-sm">
            {getApiErrorMessage(error) ?? "Couldn't log you in. Check your details and try again."}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm text-base-content/70 mt-6">
        No account yet?{" "}
        <Link to="/register" className="text-primary font-medium">
          Sign up
        </Link>
      </p>
    </section>
  );
}
