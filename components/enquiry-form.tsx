"use client";
import { useState, useEffect, useRef } from "react";
import { Check, Copy, Mail, LoaderCircle } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { contact, services } from "@/lib/company";
type Fields = { name: string; email: string; phone: string; service: string; message: string };
const empty: Fields = { name: "", email: "", phone: "", service: "", message: "" };
export function EnquiryForm({ initialService = "", initialMessage = "" }: { initialService?: string; initialMessage?: string }) {
  const [fields, setFields] = useState<Fields>({ ...empty, message: initialMessage, service: initialService === "general" || services.some(s => s.id === initialService) ? initialService : "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (initialService === "general" || services.some(s => s.id === initialService)) setFields(prev => ({ ...prev, service: initialService })); }, [initialService]);
  function update(key: keyof Fields, value: string) { setFields(prev => ({ ...prev, [key]: value })); setErrors(prev => ({ ...prev, [key]: undefined })); setDraft(null); setCopied(false); setCopyError(false); }
  async function prepare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const next: typeof errors = {};
    if (fields.name.trim().length < 2) next.name = "Please enter your name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = "Please enter a valid email address.";
    if (fields.phone && !/^[+\d\s()\-]{7,25}$/.test(fields.phone)) next.phone = "Please enter a valid phone number.";
    if (!fields.service) next.service = "Please select a solution or General enquiry.";
    if (fields.message.trim().length < 20) next.message = "Tell us a little more (at least 20 characters).";
    setErrors(next);
    if (Object.keys(next).length) { const first = Object.keys(next)[0]; document.getElementById(`enquiry-${first}`)?.focus(); return; }
    setBusy(true);
    const name = services.find(s => s.id === fields.service)?.name ?? "General enquiry";
    const body = `Hello Synchronised,\n\n${fields.message.trim()}\n\nSolution: ${name}\nName: ${fields.name.trim()}\nEmail: ${fields.email.trim()}${fields.phone ? `\nPhone: ${fields.phone.trim()}` : ""}\n`;
    setDraft(body); setBusy(false);
    requestAnimationFrame(() => statusRef.current?.focus());
  }
  async function copy() { if (!draft) return; try { await navigator.clipboard.writeText(draft); setCopied(true); setCopyError(false); } catch { setCopied(false); setCopyError(true); } }
  const emailHref = draft ? `mailto:${contact.email}?subject=${encodeURIComponent(`Project enquiry — ${services.find(s => s.id === fields.service)?.name ?? "General enquiry"}`)}&body=${encodeURIComponent(draft)}` : "";
  return <form className="enquiry-form" onSubmit={prepare} noValidate><div className="form-heading"><p className="section-label">Project enquiry</p><h2>Tell us about your project.</h2><p>Share a few details, then review and send your enquiry from your email app.</p></div><div className="form-two"><div className="field"><label htmlFor="enquiry-name">Your name <span>*</span></label><input id="enquiry-name" name="name" autoComplete="name" value={fields.name} onChange={e => update("name", e.target.value)} maxLength={120} aria-invalid={!!errors.name} aria-describedby={errors.name ? "error-name" : undefined} required />{errors.name && <p className="field-error" id="error-name">{errors.name}</p>}</div><div className="field"><label htmlFor="enquiry-email">Email address <span>*</span></label><input id="enquiry-email" type="email" name="email" autoComplete="email" value={fields.email} onChange={e => update("email", e.target.value)} maxLength={200} aria-invalid={!!errors.email} aria-describedby={errors.email ? "error-email" : undefined} required />{errors.email && <p className="field-error" id="error-email">{errors.email}</p>}</div></div><div className="form-two"><div className="field"><label htmlFor="enquiry-phone">Phone number <small>(optional)</small></label><input id="enquiry-phone" type="tel" name="phone" autoComplete="tel" value={fields.phone} onChange={e => update("phone", e.target.value)} maxLength={25} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "error-phone" : undefined} />{errors.phone && <p className="field-error" id="error-phone">{errors.phone}</p>}</div><div className="field"><label htmlFor="enquiry-service">Interested in <span>*</span></label><Select value={fields.service} onValueChange={v => update("service", v)}><SelectTrigger id="enquiry-service" className="form-select" aria-invalid={!!errors.service} aria-describedby={errors.service ? "error-service" : undefined}><SelectValue placeholder="Select a solution" /></SelectTrigger><SelectContent>{services.map(s => <SelectItem value={s.id} key={s.id}>{s.name}</SelectItem>)}<SelectItem value="general">General enquiry</SelectItem></SelectContent></Select>{errors.service && <p className="field-error" id="error-service">{errors.service}</p>}</div></div><div className="field"><label htmlFor="enquiry-message">What do you have in mind? <span>*</span></label><textarea id="enquiry-message" name="message" rows={5} placeholder="Tell us about your property, the systems you need and where the project is located." value={fields.message} onChange={e => update("message", e.target.value)} minLength={20} maxLength={2000} aria-invalid={!!errors.message} aria-describedby={errors.message ? "error-message" : "message-hint"} required />{errors.message ? <p className="field-error" id="error-message">{errors.message}</p> : <p className="field-hint" id="message-hint">{fields.message.length}/2000 characters</p>}</div>{!draft && <button className="button" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="loading-icon" size={18} />Preparing enquiry</> : "Prepare enquiry"}</button>}{draft && <div ref={statusRef} tabIndex={-1} className="enquiry-ready" role="status"><p><Check size={19} /><strong>Your enquiry is ready.</strong></p><p>Open your email app to review and send it to {contact.email}. Nothing has been sent yet.</p><div className="draft-actions"><a className="button" href={emailHref}><Mail size={17} />Open email app</a><button className="button button-outline" type="button" onClick={copy}><Copy size={16} />{copied ? "Copied" : "Copy enquiry"}</button></div>{copyError && <p className="field-error" role="alert">Copy isn’t available here. Open “Review your enquiry” below to select and copy the text.</p>}<details className="email-review" open={copyError || undefined}><summary>Review your enquiry</summary><pre>{draft}</pre></details></div>}<p className="form-privacy">Your details stay on this page until you choose to open your email app. Required fields are marked *.</p></form>;
}
