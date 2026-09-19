import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

export default function Home() {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <section className="max-w-5xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl md:text-5xl max-w-xl leading-tight">
        Keep everything you're hoping for in one place.
      </h1>
      <p className="text-base-content/70 mt-4 max-w-prose">
        Build a wishlist, add the items you want, and let people contribute
        towards them. Wishlists, items and payments arrive in the next build
        phases.
      </p>

      {!user && (
        <div className="flex gap-3 mt-8">
          <Link to="/register" className="btn btn-primary">Create an account</Link>
          <Link to="/login" className="btn btn-ghost">Log in</Link>
        </div>
      )}
    </section>
  );
}
