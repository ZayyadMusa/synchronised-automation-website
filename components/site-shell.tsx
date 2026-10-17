"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Phone, Mail, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { contact } from "@/lib/company";
const navigation = [{ href: "/", name: "Home" }, { href: "/solutions", name: "Solutions" }, { href: "/experience", name: "Smart Home Demo" }, { href: "/company", name: "Company" }, { href: "/shop", name: "Shop" }, { href: "/contact", name: "Contact" }];
function Brand({ footer = false }: { footer?: boolean }) {
  return <a href="/" className={footer ? "brand footer-brand" : "brand"} aria-label="Synchronised Automation LTD home"><img src="/images/synchronised-logo.png" width="679" height="850" alt="Synchronised Automation LTD" /></a>;
}
export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><div className="header-inner wrap"><Brand /><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(n => <a key={n.href} href={n.href} className={n.href === "/contact" ? "button nav-project" : undefined} aria-current={path === n.href ? "page" : undefined}>{n.href === "/contact" ? "Discuss a project" : n.name}</a>)}</nav><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button className="menu-trigger" aria-label="Open navigation"><Menu size={23} /><span>Menu</span></button></SheetTrigger><SheetContent className="mobile-sheet" side="right"><SheetTitle className="sr-only">Main navigation</SheetTitle><SheetDescription className="sr-only">Explore Synchronised Automation LTD.</SheetDescription><div className="drawer-brand"><a href="/" aria-label="Synchronised Automation LTD home" onClick={() => setOpen(false)}><img src="/images/synchronised-logo.png" width="679" height="850" alt="Synchronised Automation LTD" /></a></div><nav aria-label="Mobile navigation">{navigation.map(n => <a key={n.href} href={n.href} className={n.href === "/contact" ? "button nav-project" : undefined} onClick={() => setOpen(false)} aria-current={path === n.href ? "page" : undefined}>{n.href === "/contact" ? "Discuss a project" : n.name}</a>)}</nav><div className="mobile-contact"><a href={"tel:"+contact.tel}>{contact.phone}</a><a href={"mailto:"+contact.email}>{contact.email}</a><p>Port Harcourt, Nigeria</p></div></SheetContent></Sheet></div></header></>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-top wrap"><div className="footer-identity"><Brand footer /><p>Automation, security and ICT infrastructure.<br />Port Harcourt, Nigeria.</p></div><div className="footer-links"><h2>Explore Synchronised</h2><nav aria-label="Footer navigation">{navigation.slice(1).map(n => <a key={n.href} href={n.href}>{n.name}</a>)}</nav></div><div className="footer-contact"><h2>Speak to our team</h2><a href={"tel:"+contact.tel}><Phone size={18} />{contact.phone}</a><a href={"mailto:"+contact.email}><Mail size={18} />{contact.email}</a><a href={contact.map} target="_blank" rel="noopener noreferrer"><MapPin size={19} /><span>62 Mbonu Street, D-Line<br />Port Harcourt, Rivers State, Nigeria</span></a></div></div><div className="footer-bottom wrap"><span>© {new Date().getFullYear()} Synchronised Automation LTD</span></div></footer>;
}
export function ProjectCTA() {
  return <section className="project-cta"><div className="wrap"><div><h2>Let’s connect<br />your space.</h2><p>A home, an office, a hotel or an entire property.<br className="desktop-break" /> Tell us what you have in mind.</p></div><div className="project-cta-action"><a className="button button-light" href="/contact">Start a conversation</a><a className="cta-phone" href={"tel:"+contact.tel}>{contact.phone}</a></div></div></section>;
}
