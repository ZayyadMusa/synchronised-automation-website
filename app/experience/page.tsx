import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SmartScene } from "@/components/smart-scene";

export const metadata: Metadata = {
  title: "Smart Home Demo",
  description: "Explore a 3D connected living and dining space, bedroom and entrance. Try sensors, lighting, automated curtains, sound and visitor access with Synchronised Automation LTD.",
};

export default function Experience() {
  return <main id="main" className="experience-page">
    <section className="experience-intro wrap" aria-labelledby="experience-title">
      <div>
        <div className="experience-signature"><img src="/images/homesmart-logo.png" width="600" height="187" alt="HomeSmart.ng Smart Home Automation" /><p className="section-label">Interactive smart home demo</p></div>
        <h1 id="experience-title">Step inside.<br />Take control.</h1>
      </div>
      <p>Explore living and dining, the bedroom and the entrance. Tap a sensor, set the atmosphere, and watch the space respond to you.</p>
    </section>
    <section className="experience-showroom" aria-labelledby="showroom-title">
      <div className="wrap">
        <h2 id="showroom-title" className="sr-only">Explore the connected home</h2>
        <SmartScene />
        <div className="living-foot"><p>HomeSmart brings lighting, shading, sound and access into your home.</p><a href="/solutions#smart-home" className="text-link">Explore home automation <ArrowRight size={17} aria-hidden="true" /></a></div>
      </div>
    </section>
  </main>;
}
