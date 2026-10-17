export type HomeSystem = "lighting" | "shading" | "sound" | "access" | "security";
export const demoRooms = [
  { id:"living-room", name:"Living & dining", short:"Two spaces, connected", description:"A place to unwind, entertain and gather around the table.", shades:true, systems:["lighting","shading","sound"], title:"Make the space yours.", intro:"Independent lighting zones, automated curtains and integrated sound.", enquiry:"smart lighting for living and dining areas, motion sensors, automated shading and sound systems" },
  { id:"bedroom", name:"Bedroom", short:"Light, rest & privacy", description:"Open to the morning. Settle into a quieter evening.", shades:true, systems:["lighting","shading"], title:"Find your evening setting.", intro:"Room lighting, bedside lamps, daylight and privacy work together.", enquiry:"smart bedroom lighting, motion and daylight sensors, and automated shading" },
  { id:"entrance", name:"Entrance", short:"Arrival, access & security", description:"Welcome a visitor and decide when the door opens.", shades:false, systems:["access","security","lighting"], title:"Every arrival is your choice.", intro:"Explore a smart lock, visitor access, movement detection and a door-contact sensor.", enquiry:"automated door locks, visitor access, entrance lighting, motion sensors and intrusion alerts" },
] as const;
export type RoomId = typeof demoRooms[number]["id"];
export type SceneName = "Welcome" | "Evening" | "Away" | "Your settings";
export type Routine = "relax" | "dinner" | "movie" | "morning" | "reading" | "night" | "visitor" | "secure";
export type DeviceState = {
  lights:boolean; brightness:number; shadePosition:number; occupied:boolean;
  daylight:"bright"|"low"; automatic:boolean; doorOpen:boolean; locked:boolean; audio:boolean;
  diningLights:boolean; diningBrightness:number; diningOccupied:boolean; diningAutomatic:boolean; bedsideLights:boolean;
};
export type HomeState = {selected:RoomId; focus:HomeSystem; rooms:Record<RoomId,DeviceState>; scene:SceneName; armed:boolean; visitorWaiting:boolean; notice:{title:string;body:string}; signal:number};
export type HomeAction =
  | {type:"room";room:RoomId}
  | {type:"system";system:HomeSystem}
  | {type:"scene";scene:Exclude<SceneName,"Your settings">}
  | {type:"routine";routine:Routine}
  | {type:"presence"|"dining-presence"|"daylight"|"door"|"grant"|"decline"|"intrusion"}
  | {type:"lights"|"dining-lights"|"bedside"|"curtains"|"automatic"|"dining-automatic"|"lock"|"audio"|"security";value:boolean}
  | {type:"brightness"|"dining-brightness"|"shade-position";value:number}
  | {type:"reset"};

// The demonstration uses a readable rule rather than invented lux readings.
// Presence + low daylight (or fully closed curtains) requests light in a zone.
function response(device:DeviceState,armed:boolean,room:RoomId):DeviceState {
  const needsLight=device.daylight==="low" || device.shadePosition===100;
  return {...device,
    lights:device.automatic?((room==="entrance" && armed && device.doorOpen) || device.occupied && (room==="entrance" || needsLight)):device.lights,
    diningLights:room==="living-room" && (device.diningAutomatic?device.diningOccupied && needsLight:device.diningLights),
    bedsideLights:room==="bedroom" && (device.automatic && !device.occupied?false:device.bedsideLights),
  };
}
export function initialHome():HomeState {
  const rooms=Object.fromEntries(demoRooms.map(room=>[room.id,{
    lights:room.id!=="entrance",brightness:70,shadePosition:0,occupied:room.id!=="entrance",
    daylight:"low",automatic:true,doorOpen:false,locked:room.id==="entrance",audio:false,
    diningLights:false,diningBrightness:80,diningOccupied:false,diningAutomatic:true,bedsideLights:false,
  }])) as Record<RoomId,DeviceState>;
  return {selected:"living-room",focus:"lighting",rooms,scene:"Welcome",armed:false,visitorWaiting:false,signal:0,
    notice:{title:"A home that responds to you.",body:"Tap a sensor to move through the space. Try Dinner to bring the dining area to life."}};
}
export function homeReducer(state:HomeState,action:HomeAction):HomeState {
  if(action.type==="room") {
    const room=demoRooms.find(item=>item.id===action.room);if(!room)return state;
    return {...state,selected:room.id,focus:room.systems[0],signal:state.signal+1,notice:{title:room.name,body:room.description}};
  }
  if(action.type==="reset") {
    const next=initialHome();return {...next,selected:state.selected,focus:demoRooms.find(item=>item.id===state.selected)!.systems[0],signal:state.signal+1,notice:{title:"Ready to explore again.",body:"Room settings have reset. Try a scene, device or sensor."}};
  }
  if(action.type==="system") {
    if(!(demoRooms.find(item=>item.id===state.selected)!.systems as readonly HomeSystem[]).includes(action.system))return state;
    return {...state,focus:action.system};
  }
  if(action.type==="scene") {
    const away=action.scene==="Away",evening=action.scene==="Evening";
    const rooms=Object.fromEntries(demoRooms.map(room=>[room.id,response({...state.rooms[room.id],
      occupied:!away && room.id!=="entrance",diningOccupied:evening && room.id==="living-room",
      brightness:evening?35:70,diningBrightness:evening?65:80,bedsideLights:false,
      automatic:true,diningAutomatic:true,daylight:"low",shadePosition:room.shades && (away||evening)?100:0,
      audio:evening && room.id==="living-room",doorOpen:false,locked:room.id==="entrance",},away,room.id)])) as Record<RoomId,DeviceState>;
    return {...state,rooms,armed:away,visitorWaiting:false,scene:action.scene,signal:state.signal+1,notice:{title:away?"The home is set for Away.":evening?"An evening setting, across the home.":"Welcome home.",body:away?"Lights and speakers off, curtains closed, entrance locked and monitoring armed.":evening?"Warm room lighting, dining lights on, curtains closed and the speakers ready. Audio plays only when you request it.":"Room lighting is ready, curtains open, and the entrance remains locked until you choose to open it."}};
  }
  if(action.type==="security") {
    const entrance=response(state.rooms.entrance,action.value,"entrance");
    return {...state,armed:action.value,rooms:{...state.rooms,entrance},scene:"Your settings",signal:state.signal+1,notice:{title:action.value && entrance.doorOpen?"Open door. Demo alert.":action.value?"Entrance monitoring armed.":"Monitoring disarmed.",body:action.value && entrance.doorOpen?"Close the door or disarm monitoring to clear the warning.":action.value?"Test a forced opening to see the door-contact response. No real notification is sent.":"The contact sensor still shows whether the door is open or closed."}};
  }
  const room=state.selected,prev=state.rooms[room];let next={...prev},armed=state.armed,visitorWaiting=state.visitorWaiting,focus=state.focus,notice=state.notice;
  if(action.type==="routine") {
    switch(action.routine) {
      case "relax":case "dinner":case "movie": {
        if(room!=="living-room")return state;const dinner=action.routine==="dinner",movie=action.routine==="movie";
        next={...next,occupied:true,diningOccupied:dinner,automatic:false,diningAutomatic:false,lights:true,brightness:dinner?25:movie?10:35,diningLights:dinner,diningBrightness:80,shadePosition:dinner?65:100,daylight:"low",audio:dinner||movie};focus="lighting";
        notice={title:dinner?"Dinner is ready.":movie?"Settle in for a movie.":"Time to unwind.",body:dinner?"The dining pendants light the table. Living-room lights soften and curtains partly close.":movie?"Living-room lights dim to 10%, dining lights turn off, curtains close and speakers are ready.":"Living-room lights dim to 35%, curtains close and the dining area rests."};break;
      }
      case "morning":case "reading":case "night": {
        if(room!=="bedroom")return state;const morning=action.routine==="morning",reading=action.routine==="reading";
        next={...next,occupied:true,daylight:morning?"bright":"low",shadePosition:morning?0:reading?70:100,lights:reading,brightness:reading?25:70,bedsideLights:reading,automatic:morning};focus=morning||!reading?"shading":"lighting";
        notice={title:morning?"Let the morning in.":reading?"Your reading setting.":"Good night.",body:morning?"Curtains open to daylight. Room lights and bedside lamps stay off.":reading?"Bedside lamps glow, room lights soften to 25%, and the curtains give you privacy.":"Curtains close. Room lights and bedside lamps turn off."};break;
      }
      case "visitor":case "secure": {
        if(room!=="entrance")return state;visitorWaiting=action.routine==="visitor";armed=!visitorWaiting;
        next={...next,doorOpen:false,locked:true,occupied:visitorWaiting,automatic:true};focus=visitorWaiting?"access":"security";
        notice={title:visitorWaiting?"Someone is at the door.":"Entrance secured.",body:visitorWaiting?"Movement brings the entrance lights on. The visitor waits outside until you grant access.":"The door closes, the lock engages and monitoring is armed. Try the door-contact test."};break;
      }
    }
  } else switch(action.type) {
    case "presence":
      next.occupied=!prev.occupied;
      notice={title:next.occupied?"Movement detected.":"Presence cleared.",body:!next.automatic?"The sensor changes state. Switch on automatic lighting to let it control the lamps.":!next.occupied?"The zone is empty, so its automatic lights turn off.":room!=="entrance" && next.daylight==="bright" && next.shadePosition<100?"Daylight is enough. The automatic lamps stay off.":"The sensor detects someone who needs light. The lamps turn on."};break;
    case "dining-presence":
      if(room!=="living-room")return state;next.diningOccupied=!prev.diningOccupied;
      notice={title:next.diningOccupied?"Movement at the dining table.":"The dining area is empty.",body:!next.diningAutomatic?"The dining sensor changes state. Dining lighting is under manual control.":!next.diningOccupied?"Dining pendants switch off. Living-room lighting keeps its own setting.":next.daylight==="bright" && next.shadePosition<100?"Natural light takes over at the table. The pendants stay off.":"Dining pendants switch on independently of the living-room lights."};break;
    case "daylight":
      if(!demoRooms.find(item=>item.id===room)!.shades)return state;next.daylight=prev.daylight==="bright"?"low":"bright";
      notice={title:next.daylight==="bright"?"Daylight at the window.":"The daylight is low.",body:next.shadePosition===100?"The curtains are closed. Occupied automatic zones still use their lamps.":next.daylight==="bright"?"Automatic zones can use natural light. Manually set lighting stays as you chose.":"Occupied automatic zones switch their lamps on."};break;
    case "door":
      if(room!=="entrance")return state;
      if(visitorWaiting)return {...state,signal:state.signal+1,notice:{title:"Your visitor is waiting.",body:"Choose Let them in or Decline before operating the door."}};
      if(!prev.doorOpen && prev.locked)return {...state,signal:state.signal+1,notice:{title:"The door is locked.",body:"Tap the lock to release it, then open the door."}};
      next.doorOpen=!prev.doorOpen;if(next.doorOpen)next.occupied=true;
      notice={title:next.doorOpen?armed?"Open door. Demo alert.":"Door open.":"Door closed. Contact clear.",body:next.doorOpen?armed?"The armed contact sensor detects the opening. Close the door to clear it.":"The hinged door opens. Presence and the lock remain separate controls.":"The door-contact warning clears. Presence lighting follows its own sensor."};break;
    case "grant":case "decline":
      if(room!=="entrance" || !visitorWaiting)return state;visitorWaiting=false;
      if(action.type==="grant"){next.locked=false;next.doorOpen=true;next.occupied=true;armed=false;}else{next.locked=true;next.doorOpen=false;next.occupied=false;}
      notice={title:action.type==="grant"?"Access granted. Welcome in.":"Visit declined.",body:action.type==="grant"?"The lock releases, the door opens and your visitor enters. Monitoring disarms for this authorised arrival.":"The visitor leaves. The entrance stays closed and locked."};break;
    case "intrusion":
      if(room!=="entrance")return state;next.doorOpen=true;next.locked=false;next.occupied=true;next.automatic=true;visitorWaiting=false;
      notice={title:armed?"Forced opening. Demo alert.":"Door opened. Monitoring is off.",body:armed?"The contact sensor warns of an opening, and entrance lighting responds. No real alert is sent.":"Arm monitoring to see the simulated intrusion warning."};break;
    case "lock":
      if(room!=="entrance")return state;
      if(visitorWaiting)return {...state,signal:state.signal+1,notice:{title:"Choose how to respond to your visitor.",body:"Let them in or decline the visit."}};
      if(action.value && prev.doorOpen)return {...state,signal:state.signal+1,notice:{title:"Close the door first.",body:"An open door cannot be locked. Close it, then engage the lock."}};
      next.locked=action.value;notice={title:action.value?"Door locked.":"Lock released.",body:action.value?"The entrance is locked. Monitoring can still be armed independently.":"The door is unlocked and ready to open."};break;
    case "lights":next.lights=action.value;next.automatic=false;focus="lighting";notice={title:action.value?room==="entrance"?"Porch lights on.":"Room lights on.":room==="entrance"?"Porch lights off.":"Room lights off.",body:room==="living-room"?"Living-room fixtures change; dining lights keep their own setting.":"The fixtures follow your choice. Tap a motion sensor to return to automatic lighting."};break;
    case "dining-lights":
      if(room!=="living-room")return state;next.diningLights=action.value;next.diningAutomatic=false;focus="lighting";notice={title:action.value?"Dining pendants on.":"Dining pendants off.",body:"Dining lighting is independent. The living area keeps its current setting."};break;
    case "bedside":
      if(room!=="bedroom")return state;next.bedsideLights=action.value;next.automatic=false;focus="lighting";notice={title:action.value?"Bedside lamps on.":"Bedside lamps off.",body:"A separate light source for reading. Room lights keep their current level."};break;
    case "brightness":case "dining-brightness": {
      if(!Number.isFinite(action.value) || action.type==="dining-brightness" && room!=="living-room")return state;const value=Math.max(10,Math.min(100,Math.round(action.value)));focus="lighting";
      if(action.type==="brightness"){next.brightness=value;next.lights=true;next.automatic=false;}else{next.diningBrightness=value;next.diningLights=true;next.diningAutomatic=false;}
      notice={title:(action.type==="brightness"?"Room":"Dining")+" brightness: "+value+"%.",body:"You set this lighting zone directly. Its sensor can take over again when you choose."};break;
    }
    case "curtains":case "shade-position":
      if(!demoRooms.find(item=>item.id===room)!.shades || action.type==="shade-position" && !Number.isFinite(action.value))return state;
      next.shadePosition=action.type==="curtains"?(action.value?100:0):Math.max(0,Math.min(100,Math.round(Number(action.value))));focus="shading";
      notice={title:next.shadePosition===0?"Open to the outside.":next.shadePosition===100?"Closed for privacy.":"Curtains "+next.shadePosition+"% closed.",body:"The curtain panels move to your chosen position. Automatic lighting responds to the available daylight."};break;
    case "automatic":
      next.automatic=action.value;notice={title:action.value?"Room sensor control on.":"Manual room lighting.",body:action.value?"Presence and daylight now decide when this zone needs light.":"Your light switches and brightness setting control this zone."};break;
    case "dining-automatic":
      if(room!=="living-room")return state;next.diningAutomatic=action.value;notice={title:action.value?"Dining sensor control on.":"Manual dining lighting.",body:"The dining zone has its own presence sensor and lighting setting."};break;
    case "audio":
      if(room!=="living-room")return state;next.audio=action.value;focus="sound";notice={title:action.value?"Speakers ready.":"Speakers off.",body:action.value?"Speaker indicators glow. Press Listen to play the optional original sound sample.":"Speaker indicators go out and any playing sound sample stops."};break;
  }
  next=response(next,armed,room);
  return {...state,rooms:{...state.rooms,[room]:next},armed,visitorWaiting,focus,notice,scene:"Your settings",signal:state.signal+1};
}
