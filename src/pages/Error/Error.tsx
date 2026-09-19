import { Link } from "react-router-dom";

export default function Error() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-3xl mb-2">This page isn't here</h1>
      <p className="text-base-content/70 mb-8">
        The link may be wrong, or the page may have moved.
      </p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </section>
  );
}
