import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop — Coming Soon",
  description: "Our online shop for sensors and gadgets is coming soon.",
};

export default function Shop() {
  return <main id="main" className="shop-page">
    <section className="wrap shop-announcement" aria-labelledby="shop-title">
      <p className="section-label">Shop</p>
      <h1 id="shop-title">Coming soon.</h1>
      <p>Our online shop for sensors and gadgets is on its way.</p>
      <a href="/contact" className="text-link">Contact us <ArrowRight size={17} aria-hidden="true" /></a>
    </section>
  </main>;
}
