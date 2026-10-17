import { House, ShieldCheck, Network, Sun, ArrowUpRight, MapPin } from "lucide-react";
import { ServiceExplorer } from "@/components/service-explorer";
import { HomeExperiencePreview } from "@/components/home-experience-preview";
import { ProjectCTA } from "@/components/site-shell";
import { TechnologyBrands } from "@/components/technology-brands";
import { ClienteleGallery } from "@/components/clientele-gallery";
import { contact } from "@/lib/company";
import { HeroSecurityVideo } from "@/components/hero-security-video";
import { ProductImage } from "@/components/product-image";
export default function Home() {
  return <main id="main">
    <section className="home-hero" aria-labelledby="hero-title"><div className="hero-heading wrap"><h1 id="hero-title">Smart homes.<br />Connected businesses.</h1><div className="hero-intro"><p>Automation, security and ICT infrastructure for the spaces you live and work in. Designed, installed and supported from Port Harcourt.</p><a href="/solutions" className="button">Explore our solutions</a></div></div><HeroSecurityVideo /><nav className="hero-scope wrap" aria-label="Featured solutions"><a href="/solutions#smart-home"><House size={21} />Smart home automation</a><a href="/solutions#security"><ShieldCheck size={21} />Security & surveillance</a><a href="/solutions#networks"><Network size={21} />Network engineering</a><a href="/solutions#power"><Sun size={21} />Renewable Energy</a></nav></section>
    <HomeExperiencePreview />
    <section className="home-solutions wrap section-space"><div className="section-heading"><div><p className="section-label">Designed around your space</p><h2>What would you<br />like to connect?</h2></div><p>From a single room to the systems behind an organisation. Explore the scope of our automation, engineering and support services.</p></div><ServiceExplorer /></section>
    <section className="business-section wrap section-space"><div className="business-heading"><p className="section-label">Network engineering · Communications · ICT support</p><h2>From room networks<br />to campus infrastructure.</h2></div><div className="business-layout"><figure className="business-equipment"><ProductImage src="/images/network-rack-client.webp" width={1600} height={1600} frame={[328, 569, 944, 1027]} alt="UniFi network equipment rack" /><figcaption>Network equipment</figcaption></figure><div className="business-copy"><p>Connect your people, buildings and equipment. Synchronised designs, installs and maintains network infrastructure, with PBX communications and ICT support alongside it.</p><div className="business-disciplines"><a href="/solutions#networks"><h3>Networks & connectivity <ArrowUpRight size={20} aria-hidden="true" /></h3><p>LAN, wireless, fibre, campus networks and LEO satellite.</p></a><a href="/solutions#communications"><h3>PBX & communications <ArrowUpRight size={20} aria-hidden="true" /></h3><p>Analogue, digital and IP PBX, intercom and call centre infrastructure.</p></a><a href="/solutions#support"><h3>ICT support & consultancy <ArrowUpRight size={20} aria-hidden="true" /></h3><p>System administration, technical support and Internet of Things services.</p></a></div></div></div></section>
    <section className="company-preview company-preview--specific section-space">
      <div className="wrap">
        <div className="company-preview-copy"><p className="section-label">The company behind the systems</p><h2>Based in Port Harcourt.<br />Working across systems.</h2><p>Home automation, surveillance, network engineering and renewable energy. Our team brings engineering, technical support and administration together.</p><a href="/company" className="button button-outline">Meet Synchronised</a></div>
        <div className="company-offerings">
          <p className="company-offerings-label">Two specialist offerings. One Synchronised team.</p>
          <a href="/solutions#smart-home"><span className="company-offering-type">Home automation</span><h3>HomeSmart <ArrowUpRight size={21} aria-hidden="true" /></h3><p>Smart lighting and shading, automated locks, visitor management and connected property solutions.</p></a>
          <a href="/solutions#security"><span className="company-offering-type">Security & surveillance</span><h3>Synchronised Eye <ArrowUpRight size={21} aria-hidden="true" /></h3><p>Design, installation and sales of IP and analogue surveillance systems, with access control and intrusion alerts.</p></a>
        </div>
      </div>
      <div className="company-location wrap"><a href={contact.map} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true" /><span>62 Mbonu Street, D-Line · Port Harcourt, Rivers State</span><ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only">Open location in Google Maps, in a new tab</span></a><a href="/contact" className="text-link">Talk to our team</a></div>
    </section>
    <ClienteleGallery preview />
    <TechnologyBrands />
    <ProjectCTA />
  </main>;
}
