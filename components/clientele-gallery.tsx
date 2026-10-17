import { ArrowUpRight } from "lucide-react";
import { clients } from "@/lib/company";
import { clientLogos, featuredClientIds } from "@/lib/clientele";

export function ClienteleGallery({ preview = false }: { preview?: boolean }) {
  const logos = preview
    ? featuredClientIds.map(id => clientLogos.find(client => client.id === id)!)
    : clientLogos;
  const otherClients = clients.filter(name => !clientLogos.some(client => client.name === name));

  return (
    <section className={`clientele-showcase ${preview ? "clientele-showcase--home" : "clientele-showcase--directory"}`} aria-labelledby="clientele-title">
      <div className="wrap">
        <header className="clientele-heading" id="clientele">
          <div>
            <p className="section-label">{preview ? "Selected clientele" : "Our clientele"}</p>
            <h2 id="clientele-title">Organisations<br />we’ve worked with.</h2>
          </div>
          <p>Engagements include direct and third-party agreements.</p>
        </header>
        <ul className="client-logo-grid" aria-label={preview ? "Selected clientele" : "Client organisations with logos"}>
          {logos.map(client => (
            <li key={client.id}>
              <figure>
                <div className={`client-mark ${client.reverse ? "client-mark--reverse" : ""}`}>
                  <img src={client.src} width={client.width} height={client.height} alt={`${client.shortName} logo`} loading="lazy" decoding="async" className={`client-logo client-logo--${client.id}`} />
                </div>
                <figcaption>{client.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {preview ? (
          <div className="clientele-foot">
            <p>Explore the complete clientele on our Company page.</p>
            <a href="/company#clientele" className="text-link">View the complete clientele <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        ) : (
          <>
            <div className="clientele-additional">
              <h3>Additional clientele</h3>
              <ul className="clientele-name-list">{otherClients.map(name => <li key={name}>{name}</li>)}</ul>
            </div>
            <div className="clientele-foot">
              <p>Our services, people and clientele.</p>
              
            </div>
          </>
        )}
      </div>
    </section>
  );
}
