import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createAvatarWalker, walkingLeg } from "./avatar-motion";
import type { DeviceState, HomeSystem, RoomId } from "./home-demo";

export type RoomState = DeviceState & { room: RoomId; armed: boolean; visitorWaiting: boolean; focus: HomeSystem; signal: number };
export type ModelTarget = "presence" | "diningPresence" | "daylight" | "door" | "bell" | "light" | "diningLight" | "curtain" | "sound" | "lock" | "bedside" | "entry";
export type ModelView = "overview" | "living" | "dining";

// Original, unbranded architectural maquettes. All visible device responses
// belong to geometry and local light sources, never an image-opacity effect.
// Kept independent of the DOM so the actual geometry can be inspected offline.
export function createRoomModel(initial: RoomState, vector = false) {
  const scene = new THREE.Scene(), root = new THREE.Group();scene.add(root);
  const entrance = initial.room === "entrance", bedroom = initial.room === "bedroom";
  const width = entrance ? 8.4 : bedroom ? 8.8 : 12.2, depth = 7.6;
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  const anchors: Partial<Record<ModelTarget, THREE.Object3D>> = {};
  const interactables: THREE.Object3D[] = [];
  function material(color: string, roughness = .85) {
    const m = new THREE.MeshStandardMaterial({ color, roughness });materials.add(m);return m;
  }
  function basic(color: string) { const m = new THREE.MeshBasicMaterial({color});materials.add(m);return m; }
  const plaster = material("#e9e4da"), linen = material("#ece5d7"), stone = material("#d8d4ca");
  const oak = material("#ac8158"), walnut = material("#684d37"), trim = material("#8f7356");
  const navy = material("#284556"), cushion = material("#b8aea0"), terracotta = material("#ac7760");
  const metal = material("#26343b", .4), brass = material("#b3996e", .35), green = material("#506b55");
  const rug = material("#c9c4b7"), white = material("#f0eee8"), blue = material("#387eaf");
  function mesh(g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) {
    geometries.add(g);const o = new THREE.Mesh(g, m);o.position.set(x,y,z);
    o.castShadow = true;o.receiveShadow = true;parent.add(o);return o;
  }
  function box(w: number,h: number,d: number,x: number,y: number,z: number,m: THREE.Material,round = 0,parent: THREE.Object3D = root) {
    const segments = (v:number) => vector && v > 1.8 && h > .18 ? Math.ceil(v/.8) : 1;
    const g = round && !vector ? new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/3,h/3,d/3)) : new THREE.BoxGeometry(w,h,d,segments(w),segments(h),segments(d));
    return mesh(g,m,x,y,z,parent);
  }
  function cylinder(top:number,bottom:number,h:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D = root,segments = 20) {
    return mesh(new THREE.CylinderGeometry(top,bottom,h,segments),m,x,y,z,parent);
  }
  function sphere(r:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D = root) {
    return mesh(new THREE.SphereGeometry(r,12,8),m,x,y,z,parent);
  }
  function order(o:THREE.Object3D,n:number) { if(vector)o.renderOrder=n;return o; }
  function anchor(key:ModelTarget,x:number,y:number,z:number,parent:THREE.Object3D=root) {
    const o=new THREE.Object3D();o.position.set(x,y,z);parent.add(o);anchors[key]=o;return o;
  }
  function pick(o:THREE.Object3D,key:ModelTarget) { o.userData.interactionKey=key;interactables.push(o);return o; }
  function plant(x:number,z:number,scale=1) {
    const p=new THREE.Group();root.add(p);p.position.set(x,0,z);p.scale.setScalar(scale);
    cylinder(.3,.22,.58,0,.29,0,stone,p);cylinder(.023,.037,1.1,0,1.09,0,walnut,p);
    for(let i=0;i<8;i++){const a=i*2.4;const leaf=sphere(1,Math.sin(a)*.28,1.35+i%3*.17,Math.cos(a)*.28,green,p);leaf.scale.set(.44,.06,.16);leaf.rotation.set(.2,a,Math.sin(a)*.24);}
  }
  function book(x:number,y:number,z:number,parent:THREE.Object3D=root) {
    order(box(.34,.035,.25,x,y,z,navy,0,parent),1).rotation.y=-.15;
    order(box(.31,.025,.23,x+.015,y+.03,z,linen,0,parent),2).rotation.y=-.09;
  }
  function loungeChair(x:number,z:number,angle:number) {
    const c=new THREE.Group();root.add(c);c.position.set(x,0,z);c.rotation.y=angle;
    box(1.04,.23,1.03,0,.49,0,navy,.09,c);box(1.08,.6,.21,0,.82,-.44,navy,.08,c).rotation.x=-.12;
    for(const s of [-1,1]){box(.14,.35,.93,s*.5,.71,0,navy,.06,c);for(const zz of [-.36,.36])box(.065,.29,.065,s*.4,.2,zz,walnut,0,c);}
    order(box(.66,.15,.68,0,.65,.02,cushion,.07,c),1);
  }

  // Cutaway shell and plank floor: the front and right stay open to the viewer.
  order(box(width+.14,.24,depth+.14,0,-.16,0,walnut,.03),-30);
  const plankColors=[material("#b99169"),material("#bd986f"),material("#c29d76")];
  const plankCount=Math.round(width/.32);
  for(let i=0;i<plankCount;i++) order(box(width/plankCount-.012,.024,depth-.06,-width/2+(i+.5)*width/plankCount,-.026,0,plankColors[i%3]),-29);
  order(box(.16,3.12,depth,-width/2,1.54,0,plaster),-16);
  box(.17,.055,depth,-width/2,3.12,0,trim);
  box(.1,.09,depth-.12,-width/2+.08,.04,0,stone);

  const sky=basic("#a9c0cd"), curtains:THREE.Mesh[]=[];
  let windowCenter=0,windowWidth=0;
  if(!entrance) {
    windowCenter=bedroom?1.85:-2.0;windowWidth=bedroom?4.2:6;
    const left=windowCenter-windowWidth/2,right=windowCenter+windowWidth/2;
    order(box(width,.47,.16,0,.2,-depth/2,plaster),-16);
    order(box(width,.3,.16,0,2.97,-depth/2,plaster),-16);
    const leftWidth=left+width/2,rightWidth=width/2-right;
    order(box(leftWidth,2.4,.16,-width/2+leftWidth/2,1.63,-depth/2,plaster),-16);
    order(box(rightWidth,2.4,.16,right+rightWidth/2,1.63,-depth/2,plaster),-16);
    const glass=mesh(new THREE.PlaneGeometry(windowWidth,2.38,vector?12:1,vector?6:1),sky,windowCenter,1.64,-depth/2-.075);order(glass,-15);
    glass.castShadow=glass.receiveShadow=false;
    for(let i=0;i<4;i++)order(box(.055,2.46,.07,left+i*windowWidth/3,1.64,-depth/2+.04,metal),-14);
    for(const y of [.41,2.87])order(box(windowWidth+.08,.055,.07,windowCenter,y,-depth/2+.04,metal),-14);
    box(windowWidth+.28,.045,.13,windowCenter,2.94,-depth/2+.2,brass);
    const cm=material("#c6c2b6");cm.side=THREE.DoubleSide;
    for(const side of [-1,1]) {
      const half=windowWidth/2+.04,g=new THREE.PlaneGeometry(half,2.43,32,vector?6:1),a=g.attributes.position;
      for(let i=0;i<a.count;i++){const xx=a.getX(i)+half/2;a.setXYZ(i,xx,a.getY(i),Math.cos(xx/half*Math.PI*24)*.047);}
      g.computeVertexNormals();const c=mesh(g,cm,windowCenter+side*windowWidth/2,1.64,-depth/2+.22);c.scale.x=side===-1?.09:-.09;order(c,-13);pick(c,"curtain");curtains.push(c);
    }
    anchor("curtain",windowCenter+windowWidth/2-.24,1.76,-depth/2+.3);
    box(width,.06,.17,0,3.13,-depth/2,trim);
  }

  type Zone={bulb:THREE.MeshStandardMaterial;lights:THREE.Light[];pools:THREE.MeshBasicMaterial[]};
  function zone():Zone {
    const bulb=new THREE.MeshStandardMaterial({color:"#fff0cc",emissive:"#ffc37d",emissiveIntensity:2.4,roughness:.4});materials.add(bulb);return {bulb,lights:[],pools:[]};
  }
  const main=zone(),dining=zone(),bedside=zone();
  function pool(zone:Zone,x:number,z:number,r:number,y=.012) {
    for(let i=0;i<4;i++){
      const m=new THREE.MeshBasicMaterial({color:"#ffd29c",transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});materials.add(m);zone.pools.push(m);
      const o=mesh(new THREE.CircleGeometry(r*(1-i*.17),28),m,x,y+i*.002,z);o.rotation.x=-Math.PI/2;order(o,-9+i);o.castShadow=o.receiveShadow=false;
    }
  }
  function localLight(zone:Zone,x:number,y:number,z:number,power:number,reach:number) {
    const l=new THREE.PointLight("#ffcb91",vector?.52:power,reach,1.8);l.position.set(x,y,z);scene.add(l);zone.lights.push(l);
  }
  function pendant(x:number,z:number,y:number,zone:Zone,key:ModelTarget) {
    cylinder(.009,.009,3.08-y,x,(3.08+y)/2,z,metal);
    pick(cylinder(.14,.24,.16,x,y,z,metal),key);
    pick(cylinder(.205,.205,.024,x,y-.09,z,zone.bulb),key);
    localLight(zone,x,y-.13,z,10,5);
  }
  function standingLamp(x:number,z:number,zone:Zone,key:ModelTarget) {
    cylinder(.23,.23,.045,x,.035,z,metal);cylinder(.017,.017,1.68,x,.86,z,brass);
    pick(cylinder(.23,.32,.35,x,1.88,z,linen),key);pick(cylinder(.28,.28,.023,x,1.69,z,zone.bulb),key);
    localLight(zone,x,1.65,z,7,3.5);pool(zone,x,z,.84);
  }
  if(!entrance&&!bedroom) {
    // Living zone: modular sofa, chaise, oak tables and media wall.
    order(box(4.85,.025,4.12,-2.65,.012,.13,rug,.06),-20);
    for(let i=0;i<6;i++)box(4.65,.005,.015,-2.65,.028,-1.66+i*.065,cushion);
    box(3.6,.21,1.18,-3.0,.33,-1.57,walnut,.06);
    box(3.72,.69,.24,-3,.79,-2.05,linen,.08);
    for(let i=0;i<3;i++){
      box(1.13,.23,.94,-4.15+i*1.16,.55,-1.55,linen,.09);
      box(1.05,.48,.18,-4.15+i*1.16,.89,-1.83,cushion,.06).rotation.x=-.13;
    }
    for(const x of [-4.86,-1.14])box(.22,.47,1.2,x,.69,-1.56,linen,.06);
    box(1.12,.23,1.13,-4.14,.55,-.5,linen,.08);
    for(const [x,m,a] of [[-4.06,navy,-.2],[-1.75,terracotta,.18]] as const)box(.47,.43,.18,x,.9,-1.67,m,.05).rotation.z=a;
    const table=cylinder(.78,.78,.09,-2.6,.46,.06,oak);table.scale.z=.74;
    cylinder(.39,.45,.4,-2.6,.23,.06,walnut).scale.z=.72;book(-2.78,.53,.07);
    cylinder(.1,.09,.15,-2.28,.56,-.05,stone);cylinder(.19,.2,.034,-2.3,.52,.36,brass);
    loungeChair(-.75,1.48,-.7);
    cylinder(.38,.38,.04,-1.05,.65,.05,stone);cylinder(.07,.1,.62,-1.05,.32,.05,walnut);
    standingLamp(-5.25,-1.61,main,"light");
    box(.48,.48,2.82,-5.66,.25,-.69,oak,.025);
    for(const z of [-1.58,-.68,.22])box(.028,.34,.015,-5.405,.25,z,walnut);
    box(.052,1.26,2.15,-5.93,1.55,-.64,metal);
    box(.057,1.13,2.01,-5.891,1.55,-.64,navy);
    box(.062,.5,.7,-5.851,1.57,-.9,stone);box(.062,.31,.53,-5.85,1.79,-.17,terracotta);
    for(const [x,z,y] of [[-2.97,.13,2.52],[-2.31,.42,2.33],[-2.62,-.4,2.7]])pendant(x,z,y,main,"light");
    pool(main,-2.65,.1,1.27,.055);anchor("light",-2.6,2.42,.14);
    // Dining zone: six seats, independently dimmable pendants and tableware.
    const dt=cylinder(1.65,1.65,.09,2.85,.96,.1,oak);dt.scale.z=.46;
    for(const x of [1.87,3.83])box(.15,.88,.66,x,.48,.1,walnut);
    for(const x of [1.75,2.85,3.95])for(const side of [-1,1]){
      const c=new THREE.Group();root.add(c);c.position.set(x,0,.1+side*1.06);c.rotation.y=side===1?0:Math.PI;
      box(.68,.14,.67,0,.5,0,cushion,.06,c);box(.68,.46,.13,0,.78,.31,navy,.05,c);
      for(const xx of [-.27,.27])for(const zz of [-.26,.26])box(.045,.45,.045,xx,.24,zz,walnut,0,c);
      const plate=cylinder(.16,.16,.018,x,1.017,.1+side*.44,white);plate.scale.z=.94;order(plate,1);
      order(cylinder(.095,.08,.05,x,1.047,.1+side*.44,stone),2);
      box(.018,.008,.2,x-.24,1.025,.1+side*.45,brass);box(.014,.008,.2,x+.24,1.025,.1+side*.45,brass);
    }
    for(const x of [1.8,2.85,3.9])pendant(x,.1,2.45,dining,"diningLight");
    pool(dining,2.85,.1,1.56);anchor("diningLight",2.85,2.37,.1);
    cylinder(.15,.11,.24,2.85,1.15,.1,stone);sphere(.16,2.85,1.4,.1,green).scale.y=.55;
    box(3.0,.7,.48,3.27,.38,-3.45,oak,.035);box(3.07,.035,.51,3.27,.76,-3.45,stone);
    for(const x of [2.55,3.25,3.95])box(.025,.47,.014,x,.4,-3.193,walnut);
    const mirror=cylinder(.76,.76,.055,3.25,2.06,-3.68,brass);mirror.rotation.x=Math.PI/2;order(mirror,1);
    const glass=cylinder(.7,.7,.058,3.25,2.06,-3.643,stone);glass.rotation.x=Math.PI/2;order(glass,2);
    book(2.5,.81,-3.43);cylinder(.17,.14,.3,4.3,.93,-3.46,terracotta);plant(5.34,-2.65,1.07);
  } else if(bedroom) {
    // Bedroom: upholstered bed, layered linen, independent bedside lamps.
    order(box(5.32,.025,5.04,-1.5,.012,-.39,rug,.07),-20);
    box(2.88,.32,3.65,-1.75,.23,-1.52,walnut,.06);
    order(box(2.84,.29,3.6,-1.75,.53,-1.52,linen,.08),1);
    box(3.04,1.55,.18,-1.75,.85,-3.37,navy,.06);
    for(let i=0;i<7;i++)box(.403,1.39,.035,-3.01+i*.42,.87,-3.25,navy,.045);
    order(box(2.8,.064,1.47,-1.75,.704,-.49,navy,.02),2);
    for(const z of [-.38,-.22,-.06])order(box(2.75,.012,.035,-1.75,.74,z,cushion),3);
    for(const x of [-2.48,-1.04]){order(box(1.19,.19,.74,x,.77,-2.62,cushion,.09),3).rotation.x=.1;order(box(1.1,.12,.68,x,.81,-2.35,linen,.09),4);}
    for(const x of [-3.64,.15]) {
      box(.67,.59,.68,x,.3,-2.77,oak,.035);box(.7,.04,.71,x,.62,-2.77,stone);
      box(.13,.02,.03,x,.4,-2.41,brass);cylinder(.11,.13,.2,x,.77,-2.79,brass);
      pick(cylinder(.18,.25,.29,x,1.02,-2.79,linen),"bedside");pick(cylinder(.22,.22,.022,x,.866,-2.79,bedside.bulb),"bedside");
      localLight(bedside,x,.87,-2.79,5,2.9);pool(bedside,x,-2.59,.65);
    }
    anchor("bedside",.15,1.07,-2.7);book(.15,.67,-2.58);
    box(2.57,.15,.62,-1.75,.49,1.02,cushion,.05);
    for(const x of [-2.85,-.65])for(const z of [.81,1.23])box(.06,.42,.06,x,.25,z,walnut);
    box(.61,2.42,2.22,-3.97,1.2,1.82,oak,.025);
    for(const z of [1.06,1.8,2.54]){box(.012,2.32,.014,-3.655,1.2,z,walnut);box(.04,.25,.023,-3.637,1.12,z+.24,brass);}
    loungeChair(2.9,1.41,-.55);standingLamp(3.67,.45,main,"light");
    const side=cylinder(.35,.35,.05,1.94,.57,1.17,stone);side.scale.z=.9;cylinder(.075,.12,.53,1.94,.29,1.17,brass);book(1.92,.62,1.15);
    pendant(1.27,-.25,2.62,main,"light");pool(main,1.28,-.25,1.19);anchor("light",1.27,2.52,-.25);
    plant(3.55,-2.55,.95);
    box(.045,1.04,1.2,-4.26,2.05,-.41,brass);box(.052,.94,1.09,-4.223,2.05,-.41,stone);
  }

  // Entrance front door sits between an interior foyer and an exterior porch.
  const doorPivot=new THREE.Group();root.add(doorPivot);doorPivot.position.set(-1.1,0,.16);doorPivot.name="hinged-front-door";doorPivot.userData.interactionKey="entry";
  const lockIndicator=basic("#d5a456"),speakerIndicator=basic("#54707e"),bellIndicator=basic("#4c9ed5");
  let bolt:THREE.Mesh|undefined;
  if(entrance) {
    for(const x of [-2.66,2.66])box(3.08,2.98,.24,x,1.49,.1,plaster);
    box(width,.24,.25,0,3.08,.1,plaster);
    order(box(width,.97,.16,0,.46,-depth/2,plaster),-16);
    order(box(width,.08,.31,0,3.23,.1,trim),1);
    for(const x of [-1.15,1.15])box(.13,2.96,.25,x,1.48,.12,walnut);
    box(2.43,.13,.25,0,2.93,.12,walnut);
    order(pick(box(2.16,2.83,.105,1.08,1.425,0,oak,0,doorPivot),"entry"),-3);
    for(let i=0;i<11;i++)order(box(.026,2.66,.015,.15+i*.185,1.425,.058,trim,0,doorPivot),-2);
    order(pick(box(.15,.37,.06,1.92,1.35,.085,metal,.016,doorPivot),"lock"),-1);
    order(pick(box(.32,.038,.055,1.8,1.31,.12,brass,.012,doorPivot),"lock"),-1);
    order(box(.055,.03,.02,1.92,1.47,.126,lockIndicator,0,doorPivot),-1);
    bolt=box(.16,.035,.045,2.135,1.35,.026,brass,0,doorPivot);bolt.name="lock-bolt";order(bolt,-1);
    anchor("lock",1.92,1.42,.15,doorPivot);anchor("entry",1.1,1.8,.17,doorPivot);
    for(let i=0;i<4;i++)order(box(width-.06,.034,.88,0,-.001,.65+i*.92,stone),-25);
    box(width+.08,.17,.46,0,-.16,3.8,stone);order(box(2.5,.026,.98,0,.027,1.22,navy,.035),-3);
    for(let i=0;i<5;i++)box(2.3,.006,.015,0,.044,.87+i*.16,cushion);
    for(const x of [-2.63,2.63]) {
      box(.17,.44,.055,x,1.82,.255,metal,.01);box(.19,.035,.22,x,2.06,.34,metal);
      pick(box(.115,.28,.1,x,1.82,.32,main.bulb,.02),"light");
      localLight(main,x,1.82,.53,9,4);pool(main,x,1.02,.88,.025);
    }
    anchor("light",-2.63,1.9,.35);
    const bell=pick(box(.18,.34,.075,1.67,1.37,.28,metal,.025),"bell");
    const button=pick(cylinder(.043,.043,.02,1.67,1.29,.329,bellIndicator),"bell");button.rotation.x=Math.PI/2;
    bell.castShadow=false;anchor("bell",1.67,1.41,.39);
    plant(-3.31,1.32,.92);plant(3.3,1.3,.92);
    // Interior bench, mirror and console are visible when you orbit the model.
    box(.65,.38,2.3,-3.68,.34,-1.7,oak,.04);box(.67,.15,2.25,-3.68,.61,-1.7,cushion,.06);
    for(const z of [-2.66,-.75])box(.59,.28,.08,-3.68,.15,z,metal);
    box(.05,1.5,1.1,-4.07,1.95,-1.7,brass);box(.06,1.38,.99,-4.027,1.95,-1.7,stone);
    box(1.61,.78,.44,2.2,.41,-3.49,oak,.03);box(1.66,.04,.48,2.2,.83,-3.49,stone);book(1.93,.89,-3.44);
    cylinder(.12,.11,.25,2.59,.98,-3.44,terracotta);
  }
  if(!entrance&&!bedroom) {
    for(const z of [-2.07,.66]){
      pick(box(.27,.62,.31,-5.46,.86,z,metal,.02),"sound");
      for(const y of [.72,.97]){const cone=pick(cylinder(.097,.097,.025,-5.31,y,z,navy),"sound");cone.rotation.z=Math.PI/2;}
      box(.014,.024,.13,-5.305,1.15,z,speakerIndicator);
    }
    anchor("sound",-5.27,1.16,.66);
  }

  // Each sensor has its own housing, status lens and spatial anchor.
  const lenses:Partial<Record<ModelTarget,THREE.MeshBasicMaterial>>={};
  function sensor(key:ModelTarget,x:number,y:number,z:number,leftWall=false) {
    const lens=basic("#438ecc");lenses[key]=lens;
    pick(box(leftWall?.17:.19,.26,leftWall?.21:.08,x,y,z,white,.024),key);
    const eye=pick(sphere(.073,x+(leftWall?.09:0),y-.025,z+(leftWall?0:.05),lens),key);
    eye.scale.set(leftWall?.36:1,1,leftWall?1:.36);anchor(key,x+(leftWall?.16:0),y,z+(leftWall?0:.14));
  }
  sensor("presence",-width/2+.15,2.52,entrance?1.65:1.7,true);
  if(!entrance) sensor("daylight",windowCenter+windowWidth/2-.14,2.66,-depth/2+.17);
  if(!entrance&&!bedroom)sensor("diningPresence",5.32,2.57,-depth/2+.15);
  if(entrance){
    const lens=basic("#4296c7");lenses.door=lens;
    pick(box(.12,.31,.08,1.15,2.59,.28,white,.015),"door");pick(box(.08,.04,.027,1.15,2.63,.337,lens),"door");
    box(.075,.19,.055,2.155,2.6,.088,white,.01,doorPivot);anchor("door",1.15,2.67,.4);
  }

  // Visitors and room occupants are deliberately illustrative figures.
  function person(x:number,z:number) {
    const p=new THREE.Group();root.add(p);p.position.set(x,0,z);
    // Individual materials allow a gentle transition at the cutaway boundary.
    // The figure stays full-sized throughout; furniture materials are untouched.
    const colors=[stone,blue,navy,metal].map(source=>{const m=source.clone();m.transparent=true;materials.add(m);return m;});
    const body=new THREE.Group();p.add(body);
    sphere(.14,0,1.25,0,colors[0],body);cylinder(.17,.125,.49,0,.86,0,colors[1],body);
    const legs:{hip:THREE.Group;knee:THREE.Group;ankle:THREE.Group}[]=[];
    const arms:{shoulder:THREE.Group;elbow:THREE.Group}[]=[];
    for(const s of [-1,1]){
      const hip=new THREE.Group();p.add(hip);hip.position.set(s*.075,.63,0);
      cylinder(.049,.041,.29,0,-.145,0,colors[2],hip);
      const knee=new THREE.Group();hip.add(knee);knee.position.y=-.29;
      cylinder(.043,.036,.29,0,-.145,0,colors[2],knee);
      const ankle=new THREE.Group();knee.add(ankle);ankle.position.y=-.29;
      const shoe=box(.105,.06,.23,0,-.015,.055,colors[3],.016,ankle);shoe.userData.avatarPart="foot";legs.push({hip,knee,ankle});
      const shoulder=new THREE.Group();body.add(shoulder);shoulder.position.set(s*.175,1.04,0);shoulder.rotation.z=-s*.11;
      cylinder(.042,.037,.235,0,-.118,0,colors[1],shoulder);
      const elbow=new THREE.Group();shoulder.add(elbow);elbow.position.y=-.235;
      cylinder(.035,.028,.22,0,-.11,0,colors[1],elbow);sphere(.035,0,-.239,0,colors[0],elbow);arms.push({shoulder,elbow});
    }
    return {group:p,body,legs,arms,colors,opacity:1};
  }
  const occupant=person(entrance?0:bedroom?2.45:-1.23,entrance?3.4:2.42),guest=person(4.88,2.47);
  occupant.group.name="primary-occupant";guest.group.name="dining-occupant";
  guest.group.visible=!entrance&&!bedroom;
  const pulses: {o:THREE.Mesh;m:THREE.MeshBasicMaterial}[]=[];
  for(let i=0;i<3;i++){
    const m=new THREE.MeshBasicMaterial({color:"#388fc6",transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});materials.add(m);
    const o=mesh(new THREE.RingGeometry(.88,.905,40),m,0,.048,0);o.rotation.x=-Math.PI/2;o.castShadow=o.receiveShadow=false;o.userData.ignorePick=true;order(o,3);pulses.push({o,m});
  }
  const traceMaterial=basic("#39a3d2"),trace:THREE.Mesh[]=[];
  for(let i=0;i<7;i++){const dot=sphere(.035,0,0,0,traceMaterial);dot.castShadow=false;dot.visible=false;dot.userData.ignorePick=true;trace.push(dot);}
  const ambient=vector?new THREE.AmbientLight("#b9b9b5",1.22):new THREE.HemisphereLight("#f1f6fc","#a99d89",1.6);scene.add(ambient);
  const sun=new THREE.DirectionalLight("#e6eff8",1.7);sun.position.set(-2,9,5);sun.target.position.set(0,0,0);scene.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=9;sun.shadow.camera.bottom=-9;sun.shadow.normalBias=.04;sun.shadow.bias=-.0004;

  let target={...initial},level=initial.lights?initial.brightness/100:0,diningLevel=initial.diningLights?initial.diningBrightness/100:0,bedLevel=initial.bedsideLights?.8:0;
  let shade=initial.shadePosition/100,door=initial.doorOpen?1:0,outdoor=initial.daylight==="bright"?1:0,lock=initial.locked?1:0;
  let admitted=entrance&&initial.occupied&&!initial.visitorWaiting&&initial.doorOpen,interiorExit=false;
  const roomPoint={x:entrance?0:bedroom?2.45:-1.23,z:entrance?(admitted?-1.1:2.12):2.42};
  const entryPoint={x:roomPoint.x+(entrance?0:.28),z:4.32},diningPoint={x:4.88,z:2.47},diningEntry={x:5.2,z:4.32};
  const primaryWalker=createAvatarWalker(initial.occupied&&!initial.visitorWaiting?roomPoint:entryPoint);
  const diningWalker=createAvatarWalker(initial.diningOccupied?diningPoint:diningEntry);
  occupant.opacity=initial.occupied&&!initial.visitorWaiting?1:0;guest.opacity=initial.diningOccupied?1:0;
  if(initial.visitorWaiting)primaryWalker.setRoute([{x:0,z:2.12}],Math.PI);
  let pulseAge=10,pulseKey:ModelTarget="presence";
  const endPoint=new THREE.Vector3(),startPoint=new THREE.Vector3();
  function paint(zone:Zone,l:number) {
    zone.bulb.color.set(l>.01?"#ffe4b5":"#727269");zone.bulb.emissive.set("#ffbc76").multiplyScalar(l);zone.bulb.emissiveIntensity=vector?1:2.4;
    zone.lights.forEach(light=>{if(light.userData.nominal===undefined)light.userData.nominal=light.intensity;light.intensity=light.userData.nominal*l;});
    zone.pools.forEach((m,i)=>{m.opacity=.033*(4-i%4)*l;});
  }
  function update(state:RoomState) {
    if(state.signal!==target.signal) {
      pulseAge=0;
      pulseKey=state.diningOccupied!==target.diningOccupied?"diningPresence":state.occupied!==target.occupied?"presence":state.daylight!==target.daylight?"daylight":state.visitorWaiting!==target.visitorWaiting&&state.visitorWaiting?"bell":state.doorOpen!==target.doorOpen?"door":state.shadePosition!==target.shadePosition?"curtain":state.audio!==target.audio?"sound":state.locked!==target.locked?"lock":state.bedsideLights!==target.bedsideLights?"bedside":state.diningLights!==target.diningLights||state.diningBrightness!==target.diningBrightness?"diningLight":"light";
    }
    if(entrance){
      const wasAdmitted=admitted;
      if(state.visitorWaiting||!state.occupied)admitted=false;else if(state.doorOpen)admitted=true;
      if(state.occupied!==target.occupied||state.visitorWaiting!==target.visitorWaiting||admitted!==wasAdmitted){
        const pose=primaryWalker.pose;
        if(state.occupied||state.visitorWaiting){
          interiorExit=false;
          if(occupant.opacity===0)primaryWalker.relocateHidden(entryPoint);
          if(admitted)primaryWalker.setRoute([{x:0,z:-1.1}],Math.PI);
          else if(pose.z<.25)primaryWalker.setRoute([{x:4.67,z:-1.1},{x:4.67,z:2.12},{x:0,z:2.12}],Math.PI);
          else primaryWalker.setRoute([{x:0,z:2.12}],Math.PI);
        }else{
          // Clearing an indoor sensor moves into the open cutaway side of the
          // foyer. It never shrinks the person or passes through a closed slab.
          interiorExit=pose.z<.25;
          primaryWalker.setRoute(interiorExit?[{x:0,z:-.85},{x:4.67,z:-1.1}]:[entryPoint],interiorExit?Math.PI/2:0);
        }
      }
    }else if(state.occupied!==target.occupied){
      if(state.occupied&&occupant.opacity===0)primaryWalker.relocateHidden(entryPoint);
      primaryWalker.setRoute([state.occupied?roomPoint:entryPoint],state.occupied?Math.PI:0);
    }
    if(!entrance&&!bedroom&&state.diningOccupied!==target.diningOccupied){
      if(state.diningOccupied&&guest.opacity===0)diningWalker.relocateHidden(diningEntry);
      diningWalker.setRoute([state.diningOccupied?diningPoint:diningEntry],state.diningOccupied?Math.PI:0);
    }
    target={...state};
  }
  function step(dt:number,reduced:boolean) {
    let changing=false;
    function damp(value:number,to:number,speed:number) {
      const next=reduced?to:THREE.MathUtils.damp(value,to,speed,dt);
      if(Math.abs(next-to)<.001)return to;changing=true;return next;
    }
    level=damp(level,target.lights?target.brightness/100:0,15);diningLevel=damp(diningLevel,target.diningLights?target.diningBrightness/100:0,15);bedLevel=damp(bedLevel,target.bedsideLights?.8:0,15);
    const crossing=!reduced&&entrance&&Math.abs(primaryWalker.pose.x)<.5&&primaryWalker.pose.z<.6&&primaryWalker.pose.z>-.4&&(admitted||interiorExit);
    const opening=target.doorOpen||crossing;
    lock=damp(lock,target.locked&&!opening&&(reduced||door<.035)?1:0,10);
    shade=damp(shade,target.shadePosition/100,4.2);door=damp(door,opening&&lock<.12?1:0,4.3);outdoor=damp(outdoor,target.daylight==="bright"?1:0,3.5);
    paint(main,level);paint(dining,diningLevel);paint(bedside,bedLevel);
    curtains.forEach((c,i)=>{c.scale.x=(i===0?1:-1)*(.085+.915*shade);});
    sky.color.setRGB(.4+outdoor*.26,.51+outdoor*.24,.57+outdoor*.22);
    sun.intensity=(vector?.53+.27*outdoor:1.45+.8*outdoor)*(entrance?1:1-.35*shade);
    doorPivot.rotation.y=1.23*door;if(bolt)bolt.scale.x=.05+.95*lock;
    lockIndicator.color.set(lock>.5?"#d2a052":"#49a4d2");speakerIndicator.color.set(target.audio?"#62c0e0":"#526c76");bellIndicator.color.set(target.visitorWaiting?"#4fc3ed":"#528ea7");
    if(lenses.presence)lenses.presence.color.set(target.occupied?"#3ba7d9":"#819390");
    if(lenses.diningPresence)lenses.diningPresence.color.set(target.diningOccupied?"#3ba7d9":"#819390");
    if(lenses.daylight)lenses.daylight.color.set(target.daylight==="bright"?"#d5aa5c":"#4b86af");
    if(lenses.door)lenses.door.color.set(target.armed&&target.doorOpen?"#dc6450":target.doorOpen?"#d5a95f":"#4398bf");
    const blocked=entrance&&admitted&&!target.visitorWaiting&&primaryWalker.pose.z>.25&&door<.66;
    changing=primaryWalker.step(dt,reduced,blocked)||changing;
    changing=diningWalker.step(dt,reduced)||changing;
    function animatePerson(actor:typeof occupant,walker:typeof primaryWalker,present:boolean,enabled=true){
      const pose=walker.pose,edge=THREE.MathUtils.clamp((4.32-pose.z)/.5,0,1)*(entrance?THREE.MathUtils.clamp((4.67-pose.x)/.62,0,1):1);
      actor.opacity=damp(actor.opacity,enabled&&(present||walker.travelling||pose.speed>.001)?edge:0,10);
      actor.group.visible=actor.opacity>.005;actor.group.scale.setScalar(1);
      let ground=-.019;
      if(entrance)ground=-.019+.03*THREE.MathUtils.smoothstep(pose.z,-.15,.4)-.091*THREE.MathUtils.smoothstep(pose.z,3.44,3.83);
      actor.group.position.set(pose.x,ground,pose.z);actor.group.rotation.y=pose.yaw;
      const bob=(1-Math.cos(pose.phase*2))*.009*pose.blend,hipHeight=.63-.047*pose.blend+bob;
      actor.body.position.y=hipHeight-.63;actor.body.rotation.x=-pose.speed*.035;actor.body.rotation.z=Math.sin(pose.phase)*.012*pose.blend;
      actor.legs.forEach(({hip,knee,ankle},i)=>{const leg=walkingLeg(pose.phase+i*Math.PI,pose.blend,hipHeight);hip.position.y=hipHeight;hip.rotation.x=leg.hip;knee.rotation.x=leg.knee;ankle.rotation.x=leg.ankle;});
      actor.arms.forEach(({shoulder,elbow},i)=>{shoulder.rotation.x=Math.cos(pose.phase+i*Math.PI)*.25*pose.blend;elbow.rotation.x=-.12-.16*pose.blend;});
      actor.colors.forEach(m=>{m.opacity=actor.opacity;m.depthWrite=actor.opacity>.995;});
    }
    animatePerson(occupant,primaryWalker,target.occupied||entrance&&target.visitorWaiting);
    animatePerson(guest,diningWalker,target.diningOccupied,!entrance&&!bedroom);
    pulseAge+=dt;const pulsing=!reduced&&pulseAge<1.65;
    const sensorPulse=pulseKey==="presence"||pulseKey==="diningPresence"||pulseKey==="daylight"||pulseKey==="door";
    const pulsePosition=pulseKey==="diningPresence"?guest.group.position:sensorPulse?occupant.group.position:anchors[pulseKey]?.getWorldPosition(new THREE.Vector3())??occupant.group.position;
    const warning=target.armed&&target.doorOpen;
    pulses.forEach(({o,m},i)=>{const p=(pulseAge*.78+i/3)%1;o.position.set(pulsePosition.x,.058,pulsePosition.z);o.scale.setScalar(.28+p*1.1);m.opacity=pulsing?(1-p)*.44:0;m.color.set(warning?"#d46953":"#3998c6");});
    root.updateMatrixWorld(true);
    const from=anchors[pulseKey],to=anchors[pulseKey==="diningPresence"?"diningLight":"light"];
    const automatic=pulseKey==="diningPresence"?target.diningAutomatic:target.automatic;
    if(sensorPulse&&automatic&&from&&to){from.getWorldPosition(startPoint);to.getWorldPosition(endPoint);trace.forEach((dot,i)=>{dot.visible=pulsing;const p=(pulseAge*.7+i*.05)%1;dot.position.lerpVectors(startPoint,endPoint,p);dot.position.y+=Math.sin(p*Math.PI)*.25;dot.scale.setScalar(.6+Math.sin(p*Math.PI)*.4);});}
    else trace.forEach(dot=>{dot.visible=false;});
    return changing||pulsing;
  }
  function dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  return {scene,root,width,depth,anchors,interactables,update,step,dispose};
}

export function frameRoomCamera(camera:THREE.OrthographicCamera,room:RoomId,aspect:number,view:ModelView="overview") {
  const target=new THREE.Vector3(view==="living"?-2.8:view==="dining"?3.05:0,1.1,room==="entrance"?.3:0);
  camera.position.copy(target).add(new THREE.Vector3(11,9.5,14));camera.lookAt(target);
  const width=room==="living-room"?12.2:8.8;
  camera.updateMatrixWorld(true);
  let maxX=0,maxY=0;
  for(const x of [-width/2-.22,width/2+.22])for(const y of [-.3,3.4])for(const z of [-4,4.05]){
    const point=new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse);maxX=Math.max(maxX,Math.abs(point.x));maxY=Math.max(maxY,Math.abs(point.y));
  }
  const halfWidth=view==="overview"?Math.max(maxX,maxY*aspect)*1.075:Math.max(4.25,3.25*aspect);
  camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth/aspect;camera.bottom=-halfWidth/aspect;camera.zoom=1;camera.updateProjectionMatrix();
  return target;
}
