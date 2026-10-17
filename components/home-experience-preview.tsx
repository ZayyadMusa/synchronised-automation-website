"use client";

import { useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Move, Scan, Sun } from "lucide-react";
import { homeReducer, initialHome } from "@/lib/home-demo";
import { RoomIllustration } from "@/components/room-illustration";
import type { RoomRenderer, RoomState } from "@/lib/room-renderer";

export function HomeExperiencePreview() {
  const [home, dispatch] = useReducer(homeReducer, undefined, initialHome);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<RoomRenderer | null>(null);
  const device = home.rooms["living-room"];
  const state: RoomState = { ...device, room: "living-room", armed: false, visitorWaiting: false, focus: "lighting", signal: home.signal };
  const current = useRef(state);
  current.current = state;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let started = false;
    async function start() {
      if (started || cancelled) return;
      started = true;
      try {
        const { createRoomRenderer } = await import("@/lib/room-renderer");
        if (cancelled) return;
        engine.current = createRoomRenderer(element!, current.current, () => {
          engine.current?.dispose();
          engine.current = null;
          if (!cancelled) {setReady(false);setFallback(true);}
        });
        setReady(true);
      } catch {
        if (!cancelled) {setReady(false);setFallback(true);}
      }
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        void start();
      }
    }, { rootMargin: "160px" });
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => { engine.current?.update(current.current); }, [home]);

  function rotate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && ready && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      engine.current?.rotate(event.key === "ArrowLeft" ? -1 : 1);
    }
  }

  const explanation = !device.occupied
    ? "The room is empty. The presence sensor lets the lights switch off."
    : device.daylight === "bright"
      ? "You’re in the room, with enough daylight. The lamps stay off."
      : "Movement detected in low daylight. The room lights come on.";

  return <section id="connected-living" className="home-experience-preview" aria-labelledby="preview-title">
    <div className="wrap">
      <div className="preview-story">
        <img src="/images/homesmart-logo.png" width="600" height="187" alt="HomeSmart.ng Smart Home Automation" loading="lazy" />
        <p className="section-label">Smart home demo</p>
        <h2 id="preview-title">Walk in.<br />Watch the room respond.</h2>
        <p>Move in and out of the room, then change the daylight. See how the lighting responds.</p>
        <a href="/experience" className="button">Explore every room <ArrowRight size={18} aria-hidden="true" /></a>
        <p className="preview-scope">Explore living and dining, the bedroom and the entrance.<br />Sensors, lighting, curtains, sound and access.</p>
      </div>
      <div className="room-preview" data-lights={device.lights ? "on" : "off"} data-presence={device.occupied ? "detected" : "clear"} data-daylight={device.daylight} data-renderer={ready ? engine.current?.kind : "illustration"}>
        <div className="preview-room-heading"><h3>Living & dining</h3><span><i className={device.lights ? "is-on" : ""} />{device.lights ? "Living lights on" : "Living lights off"}</span></div>
        <div className={"preview-model" + (ready ? " has-renderer" : "")} role="group" aria-label={"Illustrated living room. Use the movement and daylight controls below." + (ready ? " Drag or use left and right arrow keys to rotate." : "")} tabIndex={ready ? 0 : -1} onKeyDown={rotate}>
          <RoomIllustration {...device} room="living-room" focus="lighting" snapshot={!fallback&&home.signal===0}/>
          <div ref={host} className="room-canvas" aria-hidden="true" />
          {ready && <span className="preview-drag"><Move size={14} aria-hidden="true" />Drag to explore</span>}
        </div>
        <div className="preview-sensors" role="group" aria-label="Try movement and daylight">
          <button type="button" onClick={() => dispatch({ type: "presence" })} aria-describedby="preview-response"><Scan size={22} aria-hidden="true" /><span><small>Movement sensor</small><strong>{device.occupied ? "Step out" : "Walk in"}</strong></span><ArrowRight size={18} aria-hidden="true" /></button>
          <button type="button" onClick={() => dispatch({ type: "daylight" })} aria-describedby="preview-response"><Sun size={22} aria-hidden="true" /><span><small>Daylight sensor</small><strong>{device.daylight === "low" ? "Bring in daylight" : "Make it dusk"}</strong></span><ArrowRight size={18} aria-hidden="true" /></button>
        </div>
        <p id="preview-response" className="preview-response" role="status" aria-live="polite">{explanation}</p>
        <p className="preview-note">Illustrative system · No live devices</p>
      </div>
    </div>
  </section>;
}
