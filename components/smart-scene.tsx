"use client";

import { useEffect, useReducer, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Lightbulb, PanelLeftClose, Sun, Moon, RotateCcw, Move, Sofa, BedDouble, DoorOpen, Scan, ShieldCheck, ShieldAlert, Play, Pause, X, Volume2, LockKeyhole, UserRound, Check, ChevronDown, BellRing, Utensils, Film, BookOpen, Plus, Minus, SlidersHorizontal, MousePointer2 } from "lucide-react";
import { RoomIllustration } from "@/components/room-illustration";
import { ProjectPlanner } from "@/components/project-planner";
import { parseProjectPlan } from "@/lib/project-plan";
import { arrangeHotspots } from "@/lib/model-hotspots";
import { Switch } from "@/components/ui/switch";
import { demoRooms, homeReducer, initialHome, type HomeAction, type HomeSystem, type RoomId, type Routine } from "@/lib/home-demo";
import type { RoomRenderer, RoomState, SensorPositions, ModelTarget, ModelView } from "@/lib/room-renderer";
import styles from "./smart-scene.module.css";

const roomIcons = { "living-room": Sofa, bedroom: BedDouble, entrance: DoorOpen };
const presets = {
  "living-room": [{label:"Relax", value:"relax", icon:Moon}, {label:"Dinner", value:"dinner", icon:Utensils}, {label:"Movie", value:"movie", icon:Film}],
  bedroom: [{label:"Morning", value:"morning", icon:Sun}, {label:"Reading", value:"reading", icon:BookOpen}, {label:"Good night", value:"night", icon:Moon}],
  entrance: [{label:"Visitor", value:"visitor", icon:BellRing}, {label:"Secure", value:"secure", icon:ShieldCheck}],
} as const;
const systemLabels:Record<HomeSystem,{label:string;icon:typeof Lightbulb}> = {
  lighting:{label:"Lighting",icon:Lightbulb}, shading:{label:"Curtains",icon:PanelLeftClose},
  sound:{label:"Sound",icon:Volume2}, access:{label:"Access",icon:LockKeyhole}, security:{label:"Security",icon:ShieldCheck},
};
const targetLabels:Record<ModelTarget,{label:string;icon:typeof Lightbulb}> = {
  presence:{label:"Motion",icon:Scan}, diningPresence:{label:"Dining motion",icon:Scan}, daylight:{label:"Daylight",icon:Sun},
  door:{label:"Door sensor",icon:ShieldCheck}, bell:{label:"Doorbell",icon:BellRing},light:{label:"Room lights",icon:Lightbulb},
  diningLight:{label:"Dining lights",icon:Utensils},curtain:{label:"Curtains",icon:PanelLeftClose}, sound:{label:"Speakers",icon:Volume2},
  lock:{label:"Smart lock",icon:LockKeyhole},bedside:{label:"Bedside lamps",icon:BookOpen},entry:{label:"Front door",icon:DoorOpen},
};
function DeviceControl({id,label,detail,checked,onChange,icon:Icon,disabled=false}: {id:string;label:string;detail:string;checked:boolean;onChange:(value:boolean)=>void;icon:typeof Lightbulb;disabled?:boolean}) {
  return <div className={styles.setting}><div><Icon size={20} aria-hidden="true"/><label htmlFor={id}>{label}<small>{detail}</small></label></div><Switch id={id} className="device-switch" checked={checked} onCheckedChange={onChange} disabled={disabled}/></div>;
}
function LevelControl({id,label,value,onChange,disabled=false,min=10,suffix="%"}: {id:string;label:string;value:number;onChange:(value:number)=>void;disabled?:boolean;min?:number;suffix?:string}) {
  return <div className={styles.range}><label htmlFor={id}>{label}<output htmlFor={id}>{value}{suffix}</output></label><input id={id} type="range" min={min} max="100" value={value} disabled={disabled} onChange={event=>onChange(Number(event.target.value))}/></div>;
}

// Sound is optional and starts only from this explicit user action. The short
// melody is original synthesis, separate from the illustrated installed system.
function SoundPreview({enabled,onToggle}: {enabled:boolean;onToggle:(value:boolean)=>void}) {
  const [playing,setPlaying]=useState(false);
  const [volume,setVolume]=useState(35);
  const [error,setError]=useState("");
  const [finished,setFinished]=useState(false);
  const [busy,setBusy]=useState(false);
  const context=useRef<AudioContext|null>(null);
  const gain=useRef<GainNode|null>(null);
  const nodes=useRef<OscillatorNode[]>([]);
  const timer=useRef<number|undefined>(undefined);
  const request=useRef(0);
  const panel=useRef<HTMLDivElement>(null);
  function stop() {
    request.current++;window.clearTimeout(timer.current);
    nodes.current.forEach(node=>{try{node.stop();node.disconnect();}catch{}});nodes.current=[];
    gain.current?.disconnect();gain.current=null;
    if(context.current?.state==="running")void context.current.suspend();
    setPlaying(false);setBusy(false);
  }
  useEffect(()=>{if(!enabled)stop();},[enabled]);
  useEffect(()=>{
    const hidden=()=>{if(document.hidden)stop();};document.addEventListener("visibilitychange",hidden);
    const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();});
    if(panel.current)observer.observe(panel.current);
    return ()=>{document.removeEventListener("visibilitychange",hidden);observer.disconnect();request.current++;window.clearTimeout(timer.current);nodes.current.forEach(node=>{try{node.stop();}catch{}});if(context.current)void context.current.close();};
  },[]);
  async function play() {
    if(playing){stop();return;}
    if(busy)return;
    const token=++request.current;setBusy(true);setError("");setFinished(false);
    try {
      if(!window.AudioContext)throw Error("Unavailable");
      const audio=context.current??new AudioContext();context.current=audio;
      await audio.resume();if(token!==request.current)return;
      const master=audio.createGain();master.gain.value=volume/100*0.22;master.connect(audio.destination);gain.current=master;
      const now=audio.currentTime+0.04;
      const notes=[293.66,369.99,440,587.33,440,369.99,329.63,440,554.37,659.25,554.37,440];
      notes.forEach((frequency,i)=>{
        const oscillator=audio.createOscillator(),envelope=audio.createGain();oscillator.type="sine";oscillator.frequency.value=frequency;
        const start=now+i*0.53;envelope.gain.setValueAtTime(0,start);envelope.gain.linearRampToValueAtTime(0.42,start+0.025);envelope.gain.exponentialRampToValueAtTime(0.001,start+1.35);
        oscillator.connect(envelope);envelope.connect(master);oscillator.start(start);oscillator.stop(start+1.45);nodes.current.push(oscillator);
      });
      onToggle(true);setPlaying(true);setBusy(false);
      timer.current=window.setTimeout(()=>{stop();setFinished(true);},8000);
    }catch{stop();setError("Audio preview is unavailable in this browser. You can still explore the illustrated sound system.");}
  }
  return <div ref={panel} className="lab-sound-panel">
    <DeviceControl id="scene-audio" icon={Volume2} label="Room sound" detail={enabled?"Speakers on in the illustration":"Speakers off in the illustration"} checked={enabled} onChange={onToggle}/>
    <div className={"lab-sound-visual "+(enabled?"sound-enabled":"")+(playing?" sample-playing":"")} aria-hidden="true"><Volume2 size={26}/><div>{Array.from({length:17},(_,i)=><i key={i} style={{"--bar":(i*7%11)+4,"--delay":i*.085+"s"} as CSSProperties}/>)}</div></div>
    <button type="button" className="lab-action lab-sample" disabled={busy} onClick={()=>void play()}>{playing?<Pause size={16}/>:<Play size={16}/>} {playing?"Stop sample":busy?"Preparing sound…":finished?"Play sample again":"Listen to a sound sample"}</button>
    <div className="lab-range"><label htmlFor="sample-volume">Sample volume <output>{volume}%</output></label><input type="range" id="sample-volume" min="0" max="100" value={volume} onChange={event=>{const next=Number(event.target.value);setVolume(next);if(gain.current&&context.current)gain.current.gain.setTargetAtTime(next/100*0.22,context.current.currentTime,0.04);}}/></div>
    <p className="lab-panel-note" role="status">{error|| (playing?"Playing an original 8-second audio sample.":finished?"Sample finished. Room sound stays on in the illustration.":"An original 8-second sample. Sound plays only when you choose.")}</p>
  </div>;
}

export function SmartScene() {
  const [home,dispatch]=useReducer(homeReducer,undefined,initialHome);
  const [phase,setPhase]=useState<"waiting"|"loading"|"ready"|"fallback">("waiting");
  const [overlay,setOverlay]=useState<"sensors"|"devices">("sensors");
  const [view,setView]=useState<ModelView>("overview");
  const [positions,setPositions]=useState<SensorPositions>({});
  const [size,setSize]=useState({width:800,height:560});
  const [selectedPin,setSelectedPin]=useState<ModelTarget|null>(null);
  const [plan,setPlan]=useState<string[]>([]),[planReady,setPlanReady]=useState(false);
  const host=useRef<HTMLDivElement>(null),viewport=useRef<HTMLDivElement>(null),engine=useRef<RoomRenderer|null>(null);
  const device=home.rooms[home.selected],room=demoRooms.find(item=>item.id===home.selected)!;
  const entrance=home.selected==="entrance",living=home.selected==="living-room",bedroom=home.selected==="bedroom";
  const alert=home.armed&&home.rooms.entrance.doorOpen;
  const currentAlert=alert&&entrance;
  const modelState:RoomState={...device,room:home.selected,armed:home.armed,visitorWaiting:home.visitorWaiting,focus:home.focus,signal:home.signal};
  const current=useRef(modelState);current.current=modelState;
  const pickHandler=useRef<(key:ModelTarget)=>void>(()=>{});

  useEffect(()=>{try{setPlan(parseProjectPlan(JSON.parse(sessionStorage.getItem("synchronised-project-plan")||"[]")));}catch{}setPlanReady(true);},[]);
  useEffect(()=>{if(planReady){try{sessionStorage.setItem("synchronised-project-plan",JSON.stringify(plan));}catch{}}},[plan,planReady]);
  useEffect(()=>{
    let cancelled=false,started=false;const element=host.current;if(!element)return;
    setPhase("waiting");setPositions({});setView("overview");setSelectedPin(null);
    async function start(){
      if(started||cancelled)return;started=true;setPhase("loading");
      try {
        const {createRoomRenderer}=await import("@/lib/room-renderer");if(cancelled)return;
        engine.current=createRoomRenderer(element!,current.current,()=>{engine.current?.dispose();engine.current=null;if(!cancelled)setPhase("fallback");},points=>{if(!cancelled)setPositions(points);},key=>pickHandler.current(key));
        setPhase("ready");
      }catch{if(!cancelled)setPhase("fallback");}
    }
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();void start();}},{rootMargin:"320px"});observer.observe(element);
    return()=>{cancelled=true;observer.disconnect();engine.current?.dispose();engine.current=null;};
  },[home.selected]);
  useEffect(()=>{engine.current?.update(current.current);},[home]);
  useEffect(()=>{const element=viewport.current;if(!element)return;const observer=new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;setSize({width,height});});observer.observe(element);return()=>observer.disconnect();},[]);

  function operate(system:HomeSystem,action:HomeAction){dispatch({type:"system",system});dispatch(action);}
  function sensor(key:"presence"|"dining-presence"|"daylight"){
    if(entrance&&home.visitorWaiting&&key==="presence"){dispatch({type:"system",system:"access"});dispatch({type:"door"});return;}
    dispatch({type:"system",system:"lighting"});
    if(key!=="dining-presence")dispatch({type:"automatic",value:true});if(living&&(key==="dining-presence"||key==="daylight"))dispatch({type:"dining-automatic",value:true});
    dispatch({type:key});
  }
  function testDoor(){
    if(home.visitorWaiting){dispatch({type:"system",system:"access"});dispatch({type:"door"});return;}
    dispatch({type:"system",system:"security"});
    if(device.doorOpen)dispatch({type:"door"});else{dispatch({type:"security",value:true});dispatch({type:"intrusion"});}
  }
  function pick(key:ModelTarget){
    setSelectedPin(key);
    switch(key){
      case "presence":sensor("presence");break;
      case "diningPresence":sensor("dining-presence");break;
      case "daylight":sensor("daylight");break;
      case "light":operate("lighting",{type:"lights",value:!device.lights});break;
      case "diningLight":operate("lighting",{type:"dining-lights",value:!device.diningLights});break;
      case "bedside":operate("lighting",{type:"bedside",value:!device.bedsideLights});break;
      case "curtain":operate("shading",{type:"curtains",value:device.shadePosition<50});break;
      case "sound":operate("sound",{type:"audio",value:!device.audio});break;
      case "bell":dispatch({type:"routine",routine:"visitor"});break;
      case "lock":operate("access",{type:"lock",value:!device.locked});break;
      case "entry":operate("access",{type:"door"});break;
      case "door":testDoor();break;
    }
  }
  pickHandler.current=pick;
  function chooseRoom(id:RoomId){dispatch({type:"room",room:id});}
  function roomKey(event:KeyboardEvent<HTMLButtonElement>,id:RoomId){
    const ids=demoRooms.map(item=>item.id),index=ids.indexOf(id);
    const next=event.key==="ArrowRight"?ids[(index+1)%ids.length]:event.key==="ArrowLeft"?ids[(index+ids.length-1)%ids.length]:event.key==="Home"?ids[0]:event.key==="End"?ids[ids.length-1]:undefined;
    if(next){event.preventDefault();chooseRoom(next);document.getElementById("demo-tab-"+next)?.focus();}
  }
  function systemKey(event:KeyboardEvent<HTMLButtonElement>,system:HomeSystem){
    const ids:readonly HomeSystem[]=room.systems,index=ids.indexOf(system);
    const next=event.key==="ArrowRight"?ids[(index+1)%ids.length]:event.key==="ArrowLeft"?ids[(index+ids.length-1)%ids.length]:event.key==="Home"?ids[0]:event.key==="End"?ids[ids.length-1]:undefined;
    if(next){event.preventDefault();dispatch({type:"system",system:next});document.getElementById("system-tab-"+next)?.focus();}
  }
  function presetActive(value:Routine){
    if(value==="relax")return !device.automatic&&device.lights&&device.brightness===35&&!device.diningLights&&device.shadePosition===100&&!device.audio;
    if(value==="dinner")return !device.automatic&&device.lights&&device.brightness===25&&device.diningLights&&device.diningBrightness===80&&device.shadePosition===65&&device.audio;
    if(value==="movie")return !device.automatic&&device.lights&&device.brightness===10&&!device.diningLights&&device.shadePosition===100&&device.audio;
    if(value==="morning")return device.shadePosition===0&&device.daylight==="bright"&&!device.lights&&!device.bedsideLights&&device.automatic;
    if(value==="reading")return !device.automatic&&device.bedsideLights&&device.lights&&device.brightness===25&&device.shadePosition===70;
    if(value==="night")return device.shadePosition===100&&!device.lights&&!device.bedsideLights&&!device.automatic;
    if(value==="visitor")return home.visitorWaiting;
    return device.locked&&!device.doorOpen&&home.armed&&!home.visitorWaiting&&!device.occupied;
  }
  function pinDetail(key:ModelTarget){
    switch(key){
      case "presence":return device.occupied?"Detected · step out":"Clear · walk in";
      case "diningPresence":return device.diningOccupied?"Detected · step out":"Clear · take a seat";
      case "daylight":return device.daylight==="bright"?"Bright · make it dusk":"Low · bring in daylight";
      case "door":return home.visitorWaiting?"Visitor waiting":device.doorOpen?"Open · close door":"Closed · test alert";
      case "bell":return home.visitorWaiting?"Visitor waiting":"Ring the bell";
      case "light":return device.lights?device.brightness+"% · switch off":"Off · switch on";
      case "diningLight":return device.diningLights?device.diningBrightness+"% · switch off":"Off · switch on";
      case "bedside":return device.bedsideLights?"On · switch off":"Off · reading light";
      case "curtain":return device.shadePosition===100?"Closed · open":"Close for privacy";
      case "sound":return device.audio?"Ready · switch off":"Off · switch on";
      case "lock":return device.locked?"Locked · release":"Released · lock";
      case "entry":return device.doorOpen?"Open · close":"Closed · open";
    }
  }
  const sensorKeys:ModelTarget[]=entrance?["presence","door"]:living?["presence","diningPresence","daylight"]:["presence","daylight"];
  const deviceKeys:ModelTarget[]=entrance?["bell","lock","entry","light"]:living?["light","diningLight","curtain","sound"]:["light","bedside","curtain"];
  const pins=(overlay==="sensors"?sensorKeys:deviceKeys).filter(key=>positions[key]?.visible);
  const points=Object.fromEntries(pins.map(key=>[key,{x:positions[key]!.x,y:positions[key]!.y}])) as Record<ModelTarget,{x:number;y:number}>;
  const arranged=arrangeHotspots(points,pins,size.width,size.height);
  const fallbackHref="/contact?service="+(entrance?"security":"smart-home")+"&room="+home.selected;
  return <div id="connected-living" className={styles.showroom}>
    <div className={styles.rooms} role="tablist" aria-label="Choose a space">
      {demoRooms.map((item,index)=>{const Icon=roomIcons[item.id];return <button key={item.id} type="button" role="tab" id={"demo-tab-"+item.id} aria-controls={"demo-panel-"+item.id} aria-selected={home.selected===item.id} tabIndex={home.selected===item.id?0:-1} onClick={()=>chooseRoom(item.id)} onKeyDown={event=>roomKey(event,item.id)}><span className={styles.roomNumber}>0{index+1}</span><Icon size={22} strokeWidth={1.6} aria-hidden="true"/><span>{item.name}<small>{item.short}</small></span><ArrowRight className={styles.tabArrow} size={19} aria-hidden="true"/>{item.id==="entrance"&&alert&&<i className={styles.alertDot} aria-label="Simulated entrance alert"/>}</button>;})}
    </div>
    <section className={styles.surface} role="tabpanel" id={"demo-panel-"+home.selected} aria-labelledby={"demo-tab-"+home.selected}>
      <div className={styles.stage} data-room={home.selected} data-renderer={phase==="ready"?engine.current?.kind:"illustration"} data-lights={device.lights?"on":"off"} data-dining-lights={device.diningLights?"on":"off"} data-bedside={device.bedsideLights?"on":"off"} data-shade-position={device.shadePosition} data-door={device.doorOpen?"open":"closed"} data-lock={device.locked?"locked":"unlocked"} data-presence={device.occupied?"detected":"clear"} data-daylight={device.daylight}>
        <div className={styles.stageHeading}><div><p>Explore the space</p><h2>{room.name}</h2></div><div className={styles.overlayToggle} role="group" aria-label="Show sensors or devices">{(["sensors","devices"] as const).map(item=><button key={item} type="button" aria-pressed={overlay===item} onClick={()=>setOverlay(item)}>{item==="sensors"?<Scan size={16} aria-hidden="true"/>:<SlidersHorizontal size={16} aria-hidden="true"/>}{item==="sensors"?"Sensors":"Devices"}</button>)}</div></div>
        <div ref={viewport} className={styles.viewport+(phase==="ready"?" has-renderer":"")} role="group" aria-label={room.name+" interactive architectural model. Tap a labelled sensor or device. Drag or use arrow keys to rotate; plus and minus to zoom."} tabIndex={phase==="ready"?0:-1} onKeyDown={event=>{if(event.target!==event.currentTarget||phase!=="ready")return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();engine.current?.rotate(event.key==="ArrowLeft"?-1:1);}else if(event.key==="+"||event.key==="="||event.key==="-"){event.preventDefault();engine.current?.zoom(event.key==="-"?-1:1);}else if(event.key==="Home"){event.preventDefault();engine.current?.resetView();setView("overview");}}}>
          <RoomIllustration {...device} room={home.selected} focus={home.focus} snapshot={phase!=="fallback"}/><div ref={host} className="room-canvas" aria-hidden="true"/>
          {phase==="ready"&&<div className={styles.pins} aria-label="Interactive model labels">
            <svg className={styles.leaders} viewBox={"0 0 "+size.width+" "+size.height} aria-hidden="true">{pins.map(key=><line key={key} x1={positions[key]!.x/100*size.width} y1={positions[key]!.y/100*size.height} x2={arranged[key].x/100*size.width} y2={arranged[key].y/100*size.height}/>)}</svg>
            {pins.map(key=>{const {label,icon:Icon}=targetLabels[key];const disabled=entrance&&home.visitorWaiting&&(key==="lock"||key==="entry"||key==="presence"||key==="door");return <button key={key} type="button" className={styles.pin+(selectedPin===key?" "+styles.pinActive:"")+(key==="door"&&currentAlert?" "+styles.pinWarning:"")} style={{left:arranged[key].x+"%",top:arranged[key].y+"%"}} aria-label={label+": "+pinDetail(key)} disabled={disabled} onClick={()=>pick(key)}><span><Icon size={18} strokeWidth={1.7} aria-hidden="true"/></span><strong>{label}</strong><small>{pinDetail(key)}</small></button>;})}
          </div>}
          {phase!=="ready"&&<span className={styles.loadingNote}>{phase==="fallback"?"Use the controls to explore this illustration.":"Preparing your space…"}</span>}
        </div>
        <div className={styles.viewBar}>
          {living?<div className={styles.views} role="group" aria-label="Model camera views">{(["overview","living","dining"] as const).map(item=><button key={item} type="button" disabled={phase!=="ready"} aria-pressed={view===item} onClick={()=>{setView(item);engine.current?.setView(item);}}>{item==="overview"?"Whole space":item==="living"?"Living":"Dining"}</button>)}</div>:<span className={styles.dragHint}><Move size={15} aria-hidden="true"/>Drag to look around</span>}
          <div className={styles.cameraControls}><button type="button" aria-label="Rotate model left" disabled={phase!=="ready"} onClick={()=>engine.current?.rotate(-1)}><ArrowLeft size={17}/></button><button type="button" aria-label="Zoom out" disabled={phase!=="ready"} onClick={()=>engine.current?.zoom(-1)}><Minus size={17}/></button><button type="button" aria-label="Zoom in" disabled={phase!=="ready"} onClick={()=>engine.current?.zoom(1)}><Plus size={17}/></button><button type="button" aria-label="Reset model view" disabled={phase!=="ready"} onClick={()=>{engine.current?.resetView();setView("overview");}}><RotateCcw size={16}/></button><button type="button" aria-label="Rotate model right" disabled={phase!=="ready"} onClick={()=>engine.current?.rotate(1)}><ArrowRight size={17}/></button></div>
        </div>
        <div className={styles.modelStatus}><span><i data-on={device.lights}/>{entrance?"Porch":living?"Living":"Room"} lights <strong>{device.lights?device.brightness+"%":"Off"}</strong></span>{living&&<span><i data-on={device.diningLights}/>Dining lights <strong>{device.diningLights?device.diningBrightness+"%":"Off"}</strong></span>}{bedroom&&<span><i data-on={device.bedsideLights}/>Bedside <strong>{device.bedsideLights?"On":"Off"}</strong></span>}{entrance&&<span><LockKeyhole size={13} aria-hidden="true"/><strong>{device.locked?"Locked":"Unlocked"}</strong></span>}<small><MousePointer2 size={13} aria-hidden="true"/>Tap a label. Watch it respond.</small></div>
        <div className={styles.response+(alert?" "+styles.responseAlert:"")} role="status" aria-live="polite" aria-atomic="true"><span key={home.signal}>{alert?<ShieldAlert size={19} aria-hidden="true"/>:<Check size={19} aria-hidden="true"/>}</span><div><strong>{alert&&!entrance?"The entrance needs attention.":home.notice.title}</strong><p>{alert&&!entrance?"A simulated door alert is active. Open Entrance to close the door or disarm monitoring.":home.notice.body}</p>{alert&&!entrance&&<button type="button" onClick={()=>chooseRoom("entrance")}>View entrance <ArrowRight size={14}/></button>}</div></div>
      </div>
      <div className={styles.controls}>
        <div className={styles.controlHeading}><p>Make it yours</p><h3>{room.title}</h3><span>{room.intro}</span></div>
        <div className={styles.sceneLabel}>One touch. A different atmosphere.</div>
        <div className={styles.presets} role="group" aria-label={room.name+" scenes"}>{presets[home.selected].map(item=>{const Icon=item.icon;return <button type="button" key={item.value} aria-pressed={presetActive(item.value)} onClick={()=>{setSelectedPin(null);dispatch({type:"routine",routine:item.value});}}><Icon size={21} strokeWidth={1.5} aria-hidden="true"/>{item.label}</button>;})}{entrance&&<button type="button" aria-pressed={currentAlert} disabled={home.visitorWaiting} onClick={testDoor}><ShieldAlert size={21} strokeWidth={1.5} aria-hidden="true"/>Door alert</button>}</div>
        {entrance&&home.visitorWaiting&&<div className={styles.visitor} role="status"><p><BellRing size={20} aria-hidden="true"/><strong>Someone’s at the door.</strong></p><span>The visitor is waiting on the porch.</span><div><button type="button" onClick={()=>operate("access",{type:"grant"})}><Check size={16} aria-hidden="true"/>Let them in</button><button type="button" onClick={()=>operate("access",{type:"decline"})}><X size={16} aria-hidden="true"/>Decline</button></div></div>}
        <div className={styles.systems} role="tablist" aria-label="Room controls">{room.systems.map(system=>{const {label,icon:Icon}=systemLabels[system];return <button key={system} id={"system-tab-"+system} type="button" role="tab" aria-selected={home.focus===system} aria-controls={"system-panel-"+home.focus} tabIndex={home.focus===system?0:-1} onKeyDown={event=>systemKey(event,system)} onClick={()=>dispatch({type:"system",system})}><Icon size={16} aria-hidden="true"/>{label}</button>;})}</div>
        <div className={styles.systemPanel} role="tabpanel" id={"system-panel-"+home.focus} aria-labelledby={"system-tab-"+home.focus}>
          {home.focus==="lighting"&&<>
            <DeviceControl id="demo-light" icon={Lightbulb} label={living?"Living lights":entrance?"Porch lights":"Room lights"} detail={device.automatic?"Motion sensor control is on":"You’re setting this zone directly"} checked={device.lights} onChange={value=>operate("lighting",{type:"lights",value})}/>
            <LevelControl id="demo-brightness" label="Brightness" value={device.brightness} disabled={!device.lights} onChange={value=>operate("lighting",{type:"brightness",value})}/>
            {living&&<><DeviceControl id="demo-dining" icon={Utensils} label="Dining pendants" detail={device.diningAutomatic?"Dining motion sensor is on":"A separate lighting zone"} checked={device.diningLights} onChange={value=>operate("lighting",{type:"dining-lights",value})}/><LevelControl id="demo-dining-brightness" label="Dining brightness" value={device.diningBrightness} disabled={!device.diningLights} onChange={value=>operate("lighting",{type:"dining-brightness",value})}/></>}
            {bedroom&&<DeviceControl id="demo-bedside" icon={BookOpen} label="Bedside lamps" detail="A softer light for reading" checked={device.bedsideLights} onChange={value=>operate("lighting",{type:"bedside",value})}/>}
          </>}
          {home.focus==="shading"&&<><div className={styles.curtainDiagram} aria-hidden="true"><span style={{width:(8+device.shadePosition*.42)+"%"}}/><i/><span style={{width:(8+device.shadePosition*.42)+"%"}}/></div><p className={styles.panelCaption}>{device.shadePosition===0?"Open to the daylight.":device.shadePosition===100?"A little more privacy.":"Daylight and privacy, in balance."}</p><LevelControl id="demo-shade" label="Curtain position" min={0} value={device.shadePosition} onChange={value=>operate("shading",{type:"shade-position",value})}/><div className={styles.curtainButtons}><button type="button" onClick={()=>operate("shading",{type:"shade-position",value:0})}>Open fully</button><button type="button" onClick={()=>operate("shading",{type:"shade-position",value:50})}>Halfway</button><button type="button" onClick={()=>operate("shading",{type:"shade-position",value:100})}>Close fully</button></div><p className={styles.panelNote}>The panels move in the model. Sensor-controlled lights respond to the available daylight.</p></>}
          {home.focus==="sound"&&<SoundPreview enabled={device.audio} onToggle={value=>operate("sound",{type:"audio",value})}/>}
          {home.focus==="access"&&<><DeviceControl id="demo-lock" icon={LockKeyhole} label="Smart lock" detail={home.visitorWaiting?"Choose how to respond to the visitor":device.doorOpen?"Close the door before locking":device.locked?"The entrance is locked":"Released and ready to open"} checked={device.locked} disabled={device.doorOpen||home.visitorWaiting} onChange={value=>operate("access",{type:"lock",value})}/><button type="button" className={styles.doorButton} disabled={(!device.doorOpen&&device.locked)||home.visitorWaiting} onClick={()=>operate("access",{type:"door"})}><DoorOpen size={19} aria-hidden="true"/>{device.doorOpen?"Close the door":"Open the door"}<ArrowRight size={17}/></button><p className={styles.panelNote}>{home.visitorWaiting?"Use Let them in or Decline above.":device.locked?"Release the lock, then open the door.":"The contact sensor follows the actual door position."}</p>{!home.visitorWaiting&&<button type="button" className={styles.secondaryAction} onClick={()=>dispatch({type:"routine",routine:"visitor"})}><BellRing size={17} aria-hidden="true"/>Ring the doorbell</button>}</>}
          {home.focus==="security"&&<><DeviceControl id="demo-security" icon={ShieldCheck} label="Arm monitoring" detail={home.armed?"An opening raises a visible demo alert":"The door position is still detected"} checked={home.armed} onChange={value=>operate("security",{type:"security",value})}/><div className={styles.contactReading+(currentAlert?" "+styles.contactWarning:"")}><ShieldCheck size={23} aria-hidden="true"/><div><strong>{currentAlert?"Door opening detected":device.doorOpen?"Door is open":"Door is closed"}</strong><small>{currentAlert?"Simulated warning active":home.armed?"Monitoring armed":"Monitoring disarmed"}</small></div></div><button type="button" className={styles.doorButton} disabled={home.visitorWaiting} onClick={testDoor}>{device.doorOpen?<DoorOpen size={19}/>:<ShieldAlert size={19}/>} {device.doorOpen?"Close and clear alert":"Test the door alert"}<ArrowRight size={17}/></button><p className={styles.panelNote}>This test arms monitoring and simulates a forced opening. No real notification is sent.</p></>}
        </div>
        <div className={styles.sensors}><div className={styles.sensorHeading}><Scan size={17} aria-hidden="true"/><h4>Try the sensors</h4><span>Simulated inputs</span></div><p>Change an input. See what happens in the space.</p>{sensorKeys.map(key=>{const {label,icon:Icon}=targetLabels[key];const disabled=entrance&&home.visitorWaiting&&(key==="presence"||key==="door");return <button key={key} type="button" disabled={disabled} onClick={()=>pick(key)}><Icon size={19} aria-hidden="true"/><span><strong>{key==="presence"&&living?"Living motion":label}</strong><small>{pinDetail(key)}</small></span><ArrowRight size={16} aria-hidden="true"/></button>;})}<details className={styles.automation}><summary>Automatic lighting <ChevronDown size={15} aria-hidden="true"/></summary><DeviceControl id="demo-auto" icon={Scan} label={living?"Living sensor control":"Motion sensor control"} detail={device.automatic?"Sensor input controls the room lights":"Manual lighting is selected"} checked={device.automatic} onChange={value=>dispatch({type:"automatic",value})}/>{living&&<DeviceControl id="demo-dining-auto" icon={Scan} label="Dining sensor control" detail={device.diningAutomatic?"Dining sensor controls its pendants":"Dining lights are set manually"} checked={device.diningAutomatic} onChange={value=>dispatch({type:"dining-automatic",value})}/>}</details></div>
        <button type="button" className={styles.reset} onClick={()=>{dispatch({type:"reset"});engine.current?.resetView();setView("overview");setSelectedPin(null);}}><RotateCcw size={15} aria-hidden="true"/>Start again</button>
      </div>
    </section>
    <p className={styles.simulation}><i/>An interactive illustration of home automation. No live devices are connected.</p>
    <ProjectPlanner selected={plan} onToggle={key=>setPlan(previous=>parseProjectPlan(previous.includes(key)?previous.filter(item=>item!==key):[...previous,key]))} onClear={()=>setPlan([])} fallbackHref={fallbackHref}/>
  </div>;
}
