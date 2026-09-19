import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../reducers/login/loginAPI";
import { getApiErrorMessage } from "../../utils/apiError";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [register, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    try {
      await register(form).unwrap();
      // The register response carries no email back, so the typed one is
      // handed to the verify step directly.
      navigate("/register/verify", { state: { email: form.email } });
    } catch {
      // error state surfaced via `error` below
    }
  };

  return (
    <section className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-1">Create your account</h1>
      <p className="text-base-content/70 text-sm mb-8">
        Start building wishlists and sharing them.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-sm">First name</label>
            <input required className="input input-bordered w-full" value={form.firstName} onChange={setField("firstName")} />
          </div>
          <div>
            <label className="label text-sm">Last name</label>
            <input required className="input input-bordered w-full" value={form.lastName} onChange={setField("lastName")} />
          </div>
        </div>
        <div>
          <label className="label text-sm">Email</label>
          <input type="email" required className="input input-bordered w-full" value={form.email} onChange={setField("email")} />
        </div>
        <div>
          <label className="label text-sm">Phone number</label>
          <input required className="input input-bordered w-full" value={form.phoneNumber} onChange={setField("phoneNumber")} />
        </div>
        <div>
          <label className="label text-sm">Date of birth</label>
          <input type="date" required className="input input-bordered w-full" value={form.dateOfBirth} onChange={setField("dateOfBirth")} />
        </div>
        <div>
          <label className="label text-sm">Password</label>
          <input type="password" required minLength={8} className="input input-bordered w-full" value={form.password} onChange={setField("password")} />
        </div>
        <div>
          <label className="label text-sm">Confirm password</label>
          <input
            type="password"
            required
            className="input input-bordered w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {mismatch && <p className="text-error text-sm">Passwords don't match.</p>}
        {error && (
          <p className="text-error text-sm">
            {getApiErrorMessage(error) ?? "Couldn't create your account. Check your details and try again."}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-base-content/70 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium">
          Log in
        </Link>
      </p>
    </section>
  );
}
