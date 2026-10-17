import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { demoRooms } from "@/lib/home-demo";
import { parseProjectPlan, projectEnquiry } from "@/lib/project-plan";
import { contact } from "@/lib/company";
import { EnquiryForm } from "@/components/enquiry-form";
export const metadata: Metadata = { title: "Contact", description: "Discuss your automation, security, network or renewable energy project with Synchronised. Contact our team in Port Harcourt, Nigeria." };
export default async function Contact({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const selectedPlan = projectEnquiry(parseProjectPlan(params.plan));
  const initialService = selectedPlan?.service ?? (typeof params.service === "string" ? params.service : "");
  const inspiredRoom = demoRooms.find(room => room.id === params.room);
  const initialMessage = selectedPlan?.message ?? (inspiredRoom ? `I explored the ${inspiredRoom.name.toLowerCase()} demonstration on your website and would like to discuss ${inspiredRoom.enquiry} for my property. Please help me explore a suitable scope for the project.` : "");
  return <main id="main"><section className="contact-intro wrap"><p className="section-label">Contact Synchronised</p><h1>What would you<br />like to connect?</h1><p>Tell us about your home, your organisation or your next project. We’ll help you explore the right technology.</p></section><section className="contact-layout wrap"><aside className="contact-details"><div><Mail size={24} strokeWidth={1.5} /><h2>Email our team</h2><a className="contact-big" href={"mailto:"+contact.email}>{contact.email}</a><p>Project enquiries and general information.</p></div><div><Phone size={24} strokeWidth={1.5} /><h2>Call Synchronised</h2><a className="contact-big" href={"tel:"+contact.tel}>{contact.phone}</a></div><div><MapPin size={24} strokeWidth={1.5} /><h2>Find us in Port Harcourt</h2><address>62 Mbonu Street, D-Line<br />Port Harcourt, Rivers State<br />Nigeria, {contact.postcode}</address><a className="text-link" href={contact.map} target="_blank" rel="noopener noreferrer">Open in Google Maps</a></div></aside><EnquiryForm initialService={initialService} initialMessage={initialMessage} /></section></main>;
}
