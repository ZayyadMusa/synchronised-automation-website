import type { CSSProperties } from "react";
import type { HomeSystem, RoomId } from "@/lib/home-demo";

// This vector model is also the usable fallback on devices without WebGL.
export function RoomIllustration({ lights, shadePosition, room, doorOpen, daylight, brightness, locked, audio, diningLights=false, diningBrightness=80, bedsideLights=false, snapshot=false }: { lights: boolean; shadePosition: number; room: RoomId; doorOpen: boolean; daylight: "bright" | "low"; brightness: number; locked: boolean; audio: boolean; focus: HomeSystem; diningLights?:boolean; diningBrightness?:number; bedsideLights?:boolean; snapshot?:boolean }) {
  if(snapshot)return <img className="room-vector" src={"/images/room-model-"+room+".webp"} width="1200" height="800" alt="" aria-hidden="true" draggable={false} style={{objectFit:"contain"}}/>;
  return <svg className={"room-vector "+(lights ? "is-lit" : "is-unlit")} viewBox="0 0 920 680" style={{"--room-level": lights ? brightness/100 : 0, "--shade-scale": 0.08 + shadePosition/100*0.92} as CSSProperties} aria-hidden="true">
    <defs>
      <linearGradient id="room-vector-floor" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#b78e69" /><stop offset="1" stopColor="#8f6847" /></linearGradient>
      <radialGradient id="room-vector-glow"><stop stopColor="#ffd293" stopOpacity=".72" /><stop offset="1" stopColor="#ffd293" stopOpacity="0" /></radialGradient>
      <clipPath id="room-vector-window"><path d="M470 136 780 271 780 380 470 245Z" /></clipPath>
    </defs>
    <ellipse cx="456" cy="538" rx="355" ry="62" fill="#061526" opacity=".3" />
    <path d="M75 376 405 232 845 424 515 568Z" fill="url(#room-vector-floor)" stroke="#614934" strokeWidth="5" />
    <g stroke="#725338" strokeWidth="1" opacity=".45">{Array.from({length:15},(_,i)=><path key={i} d={"M"+(85+i*23)+" "+(372-i*10)+" "+(525+i*21)+" "+(564-i*10)} />)}</g>
    <path d="M75 376 75 186 405 42 405 232Z" fill="#bbb5a9" />
    <path d="M405 232 405 42 845 234 845 424Z" fill="#d7d0c2" />
    {room !== "entrance" && <g>
    <path d="M470 136 780 271 780 380 470 245Z" fill={daylight === "bright" ? "#c3dce8" : "#506682"} stroke="#344552" strokeWidth="7" />
    <path d="M573 181 573 290M678 225 678 335" stroke="#344552" strokeWidth="5" />
    <g clipPath="url(#room-vector-window)">
      <path className="vector-curtain vector-curtain-left" d="M465 128 628 200 628 318 465 249Z" fill="#abb7c3" />
      <path className="vector-curtain vector-curtain-right" d="M623 197 785 267 785 385 623 313Z" fill="#c2ccd4" />
    </g></g>}
    <path d="M75 185 405 42 845 234 515 378Z" fill="none" stroke="#735239" strokeWidth="7" />
    <path d="M120 269 265 207 265 277 120 339Z" fill="#384f64" stroke="#725338" strokeWidth="5" />
    <path d="M142 262 200 237 229 263 170 288Z" fill="#dbd1be" />
    <path className="vector-led" d="M82 367 397 230" fill="none" strokeWidth="5" />
    <path d="M250 427 445 342 689 448 498 532Z" fill="#aaa89e" opacity=".9" />
    <ellipse style={{opacity:lights ? brightness/100 : 0}} className="vector-light-pool" cx="488" cy="450" rx="181" ry="81" fill="url(#room-vector-glow)" />
    {room === "living-room" && <g>
      <path d="M279 334 449 261 647 346 480 419Z" fill="#e6ddce" />
      <path d="M279 334 279 380 480 467 480 419Z" fill="#bdb5a7" />
      <path d="M480 419 647 346 647 391 480 467Z" fill="#cdc4b5" />
      <path d="M290 318 447 250 646 336 634 360 445 279 301 340Z" fill="#d1c8b8" />
      <path d="M354 348 386 334 424 350 393 364Z" fill="#48647a" />
      <path d="M493 348 524 335 561 351 530 364Z" fill="#997454" />
    </g>}
    {room === "living-room" && <g><ellipse cx="476" cy="476" rx="73" ry="32" fill="#543b2a" />
    <path d="M412 439 412 473Q476 510 539 473V439Z" fill="#775033" />
    <ellipse cx="476" cy="439" rx="66" ry="29" fill="#a7794f" />
    <path d="M447 429 472 420 491 428 466 438Z" fill="#d9d3c7" />
    <g fill="#45647c"><path d="M667 463 697 451 697 485 667 498Z M750 448 777 461 777 496 750 482Z"/></g>
    </g>}
    {room === "living-room" && <g><ellipse cx="710" cy="477" rx="72" ry="29" fill="#634c36"/><path d="M648 452V465Q712 496 776 465V452Z" fill="#906944"/><ellipse cx="712" cy="452" rx="64" ry="27" fill="#c29a6f"/><g fill="#f0eade"><ellipse cx="681" cy="447" rx="12" ry="5"/><ellipse cx="725" cy="436" rx="12" ry="5"/><ellipse cx="712" cy="464" rx="12" ry="5"/><ellipse cx="751" cy="451" rx="12" ry="5"/></g><ellipse cx="710" cy="482" rx="78" ry="29" fill="url(#room-vector-glow)" opacity={diningLights?diningBrightness/100:0}/>{[677,714,751].map(x=><g key={x}><path d={"M"+x+" 322V375"} stroke="#304557" strokeWidth="2"/><ellipse cx={x} cy="375" rx="12" ry="7" fill="#304557"/><ellipse cx={x} cy="380" rx="9" ry="4" fill={diningLights?"#ffd095":"#596774"}/></g>)}</g>}
    {room === "bedroom" && <g><path d="M283 330 453 257 635 336 465 410Z" fill="#e8dfd0"/><path d="M283 330V390L465 469V410Z" fill="#aa8a6e"/><path d="M465 410 635 336V395L465 469Z" fill="#c5ae94"/><path d="M330 351 500 277 627 332 457 405Z" fill="#48647a"/><path d="M313 307 353 290 390 306 350 324Z M377 280 417 263 454 280 414 297Z" fill="#c7c1b6"/></g>}
    {room === "bedroom" && <g>{[{x:264,y:324},{x:646,y:319}].map(p=><g key={p.x}><path d={"M"+p.x+" "+p.y+"V"+(p.y-42)} stroke="#a88f64" strokeWidth="4"/><path d={"M"+(p.x-13)+" "+(p.y-55)+"H"+(p.x+13)+"L"+(p.x+18)+" "+(p.y-35)+"H"+(p.x-18)+"Z"} fill="#cfc8b9"/><ellipse cx={p.x} cy={p.y-34} rx="17" ry="5" fill={bedsideLights?"#ffda9b":"#62717e"}/></g>)}</g>}
    {room === "entrance" && <g><path d={doorOpen ? "M477 131 599 115 599 308 477 245Z" : "M477 131 625 196 625 310 477 245Z"} fill="#9f7754" stroke="#523f32" strokeWidth="5"/><path d="M126 349 273 285 314 303 167 367Z" fill="#d0c6b7"/><path d="M126 349V386L167 404V367Z M167 367 314 303V339L167 404Z" fill="#926d4e"/></g>}
    {room === "living-room" && <g fill="#263747"><path d="M161 304 194 290 194 354 161 369Z M219 280 251 266 251 330 219 345Z"/><circle cx="174" cy="328" r="7" fill={audio ? "#78c7ff" : "#718491"}/><circle cx="232" cy="303" r="7" fill={audio ? "#78c7ff" : "#718491"}/></g>}
    {room === "entrance" && <circle cx={doorOpen ? 576 : 605} cy={doorOpen ? 223 : 263} r="6" fill={locked ? "#f0bb67" : "#78c7ff"}/>}
    <g stroke="#a38b65" strokeWidth="5"><path d="M240 366V254" /><path d="M240 365 222 374M240 365 259 373" /></g>
    <path d="M216 245 244 233 266 246 257 268 228 255Z" fill="#dbd1bd" />
    <path className="vector-bulb" d="M228 254 257 267 248 272 221 260Z" />
    <g fill="#506e51"><ellipse cx="749" cy="342" rx="32" ry="13" transform="rotate(-30 749 342)" /><ellipse cx="728" cy="322" rx="33" ry="13" transform="rotate(30 728 322)" /><ellipse cx="760" cy="309" rx="31" ry="12" transform="rotate(-45 760 309)" /></g>
    <path d="M733 361 763 374 757 408 738 400Z" fill="#b9a082" /><path d="M747 373V314" stroke="#7e694b" strokeWidth="4" />
    {[{x:446,y:278},{x:504,y:304},{x:552,y:282}].map(p=><g key={p.x}><path d={"M"+p.x+" "+(p.y-63)+"V"+p.y} stroke="#2d343b" strokeWidth="2" /><ellipse cx={p.x} cy={p.y} rx="16" ry="9" fill="#28313a" /><ellipse className="vector-bulb" cx={p.x} cy={p.y+6} rx="12" ry="6" /></g>)}
  </svg>;
}

