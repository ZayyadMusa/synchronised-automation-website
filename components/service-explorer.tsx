"use client";
import { useState, useEffect } from "react";
import { Check, House, ShieldCheck, Network, Sun, Phone, AudioLines, Settings2, Flame, KeyRound, Camera } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { services } from "@/lib/company";
import { ProductImage } from "@/components/product-image";

const icons = { home: House, shield: ShieldCheck, network: Network, sun: Sun, phone: Phone, audio: AudioLines, settings: Settings2, fire: Flame, access: KeyRound, camera: Camera };

export function ServiceExplorer({ full = false }: { full?: boolean }) {
  const [selected, setSelected] = useState("smart-home");
  const [narrow, setNarrow] = useState(false);
  const idPrefix = full ? "solution" : "home-solution";

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!full) return;
    const sync = () => {
      const id = window.location.hash.slice(1);
      if (services.some(solution => solution.id === id)) {
        setSelected(id);
        document.getElementById("solution-explorer")?.scrollIntoView({ block: "start" });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [full]);

  function select(value: string) {
    setSelected(value);
    if (full) window.history.replaceState(null, "", "#" + value);
  }

  return (
    <Tabs id={full ? "solution-explorer" : undefined} className={"service-explorer " + (full ? "full-explorer" : "")} orientation={narrow ? "horizontal" : "vertical"} value={selected} onValueChange={select}>
      <div className="service-navigation">
        <p className="service-index-label">Our solutions</p>
        <p className="service-mobile-hint">Swipe to explore all solutions</p>
        <TabsList className="service-list" aria-label="Explore our solutions">
          {services.map(solution => {
            const Icon = icons[solution.icon];
            return (
              <TabsTrigger className="service-tab" key={solution.id} value={solution.id} id={idPrefix + "-tab-" + solution.id} aria-controls={idPrefix + "-panel-" + solution.id}>
                <Icon size={22} strokeWidth={1.6} />
                <span className="service-tab-label">{solution.name}{solution.planned && <small>{solution.planned}</small>}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      <div className="service-content-area">
        {services.map(solution => (
          <TabsContent key={solution.id} value={solution.id} className="service-panel" id={idPrefix + "-panel-" + solution.id} aria-labelledby={idPrefix + "-tab-" + solution.id}>
            <figure className={"service-photo service-photo-" + solution.id + (solution.imageFit === "contain" ? " service-photo--product" : "")}>
              <div className="service-media">{solution.imageFrame ? <ProductImage src={"/images/" + solution.image + ".webp"} alt={solution.alt} width={solution.imageWidth} height={solution.imageHeight} frame={solution.imageFrame} fit="cover" /> : <img src={"/images/" + solution.image + ".webp"} srcSet={solution.imageWidth > 850 ? "/images/" + solution.image + "-small.webp 850w, /images/" + solution.image + ".webp " + solution.imageWidth + "w" : undefined} sizes="(max-width: 767px) 100vw, 70vw" alt={solution.alt} width={solution.imageWidth} height={solution.imageHeight} loading="lazy" />}</div>
              <figcaption>{solution.caption}</figcaption>
            </figure>
            <div className="service-description">
              {solution.planned && <p className="service-availability">{solution.planned}</p>}
              <h3>{solution.short}</h3>
              <p>{solution.intro}</p>
              {solution.items.length > 0 && <ul className="service-inclusions">{(full ? solution.items : solution.items.slice(0, 3)).map(item => <li key={item}><Check size={17} strokeWidth={1.7} />{item}</li>)}</ul>}
              <a className="button button-outline" href={full ? "/contact?service=" + solution.id : "/solutions#" + solution.id}>{full ? (solution.planned ? "Discuss the planned service" : "Enquire about this solution") : "Explore this solution"}</a>
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
