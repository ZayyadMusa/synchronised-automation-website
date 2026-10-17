"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { demoRooms } from "@/lib/home-demo";
import { planOptions, projectEnquiry } from "@/lib/project-plan";

export function ProjectPlanner({ selected, onToggle, onClear, fallbackHref }: {
  selected: string[];
  onToggle: (key: string) => void;
  onClear: () => void;
  fallbackHref: string;
}) {
  const [open, setOpen] = useState(false);
  const brief = projectEnquiry(selected);
  const spaces = new Set(planOptions.filter(option => selected.includes(option.key)).map(option => option.room)).size;
  const href = brief ? `/contact?service=${brief.service}&plan=${encodeURIComponent(selected.join(","))}` : fallbackHref;
  return <section className="lab-project" aria-labelledby="project-plan-heading">
    <div className="lab-enquiry">
      <div><span id="project-plan-heading">Bring these ideas home.</span><p>Talk to Synchronised about this room, or choose the features you want for your property.</p><div className="lab-plan-summary" role="status">{selected.length ? <><Check size={15}/>{selected.length} {selected.length === 1 ? "feature" : "features"} across {spaces} {spaces === 1 ? "room" : "rooms"}</> : <><SlidersHorizontal size={15}/>Lighting, privacy, sound and access.</>}</div></div>
      <div className="lab-enquiry-actions"><button type="button" className="lab-plan-disclosure" aria-expanded={open} aria-controls="project-plan-choices" onClick={() => setOpen(!open)}>{selected.length ? "Review my choices" : "Choose features"}<ChevronDown size={17}/></button><a className="button" href={href}>Discuss a project<ArrowRight size={18}/></a></div>
    </div>
    {open && <div id="project-plan-choices" className="lab-plan-choices">
      <div className="lab-plan-heading"><div><h3>A plan for your spaces.</h3><p>Select the systems you would like to discuss.</p></div>{selected.length > 0 && <button type="button" className="lab-plan-clear" onClick={onClear}>Clear choices</button>}</div>
      {demoRooms.map(room => <fieldset className="lab-plan-room" key={room.id}><legend>{room.name}</legend><div>{planOptions.filter(option => option.room === room.id).map(option => <label key={option.key}><input type="checkbox" checked={selected.includes(option.key)} onChange={() => onToggle(option.key)}/><span>{option.label}</span></label>)}</div></fieldset>)}
      <p className="lab-plan-note">Your choices become an editable enquiry. No message is sent automatically.</p>
      <a className="button" href={href}>Continue to my enquiry<ArrowRight size={18}/></a>
    </div>}
  </section>;
}
