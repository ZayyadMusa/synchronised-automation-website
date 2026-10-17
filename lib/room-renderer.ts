import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGRenderer } from "three/addons/renderers/SVGRenderer.js";
import { createRoomModel, frameRoomCamera, type ModelTarget, type ModelView, type RoomState } from "./room-model";

export type { RoomState, ModelTarget, ModelView } from "./room-model";
export type SensorPositions = Partial<Record<ModelTarget,{x:number;y:number;visible:boolean}>>;
export type RoomRenderer = {
  kind:"webgl"|"vector";
  update:(state:RoomState)=>void;
  rotate:(direction:number)=>void;
  zoom:(direction:number)=>void;
  setView:(view:ModelView)=>void;
  resetView:()=>void;
  dispose:()=>void;
};

export function createRoomRenderer(host:HTMLElement,initial:RoomState,onFailure:()=>void,onPositions?:(positions:SensorPositions)=>void,onPick?:(key:ModelTarget)=>void):RoomRenderer {
  const surface=document.createElement("canvas");
  let renderer:THREE.WebGLRenderer|SVGRenderer;
  try {
    const context=surface.getContext("webgl2",{antialias:true,alpha:true,powerPreference:"low-power"});
    renderer=context?new THREE.WebGLRenderer({canvas:surface,context,antialias:true,alpha:true}):new SVGRenderer();
  } catch {renderer=new SVGRenderer();}
  const vector=renderer instanceof SVGRenderer;
  if(renderer instanceof THREE.WebGLRenderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.07;
  } else {renderer.setQuality("high");renderer.setPrecision(2);renderer.setClearColor(new THREE.Color("#e6ebed"),1);}
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute("aria-hidden","true");host.appendChild(renderer.domElement);
  const model=createRoomModel(initial,vector),camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100);
  const controls=new OrbitControls(camera,host);
  controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.dampingFactor=.14;
  controls.minAzimuthAngle=-.38;controls.maxAzimuthAngle=1.37;controls.minPolarAngle=.66;controls.maxPolarAngle=1.19;
  host.style.touchAction="pan-y";host.style.cursor="grab";
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");controls.enableDamping=!reduced.matches;
  let frame=0,last=0,visible=true,disposed=false,previousPositions="",view:ModelView="overview";
  let desiredTarget:THREE.Vector3|null=null,desiredEye:THREE.Vector3|null=null,desiredZoom=1;
  const down={x:0,y:0,id:-1},ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let lastHover=0;
  function interactionAtPointer():ModelTarget|undefined {
    const hit=ray.intersectObjects(model.root.children,true).find(({object})=>{
      const mesh=object as THREE.Mesh;if(!mesh.isMesh||object.userData.ignorePick)return false;
      let ancestor:THREE.Object3D|null=object;while(ancestor){if(!ancestor.visible)return false;ancestor=ancestor.parent;}
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];return materials.some(material=>!material.transparent||material.opacity>.25);
    });
    let object:THREE.Object3D|null=hit?.object??null;
    while(object){if(object.userData.interactionKey)return object.userData.interactionKey as ModelTarget;object=object.parent;}
    return undefined;
  }
  function request(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function draw(time:number) {
    frame=0;if(disposed)return;
    // A small tolerance avoids accidentally falling to 20fps when two 60Hz
    // frames add up to 33.2ms rather than exactly 33.333ms.
    if(vector&&time-last<1000/30-1){request();return;}
    const dt=Math.min((time-last)/1000||.016,.12);last=time;
    const changing=model.step(dt,reduced.matches);
    let cameraChanging=false;
    if(desiredTarget&&desiredEye) {
      const t=reduced.matches?1:1-Math.exp(-dt*6);
      controls.target.lerp(desiredTarget,t);camera.position.lerp(desiredEye,t);
      if(camera.position.distanceTo(desiredEye)<.002&&controls.target.distanceTo(desiredTarget)<.002){camera.position.copy(desiredEye);controls.target.copy(desiredTarget);desiredEye=desiredTarget=null;}
      else cameraChanging=true;
    }
    if(Math.abs(camera.zoom-desiredZoom)>.002){camera.zoom=reduced.matches?desiredZoom:THREE.MathUtils.damp(camera.zoom,desiredZoom,7,dt);camera.updateProjectionMatrix();cameraChanging=true;}
    const moved=controls.update();renderer.render(model.scene,camera);
    if(onPositions) {
      const positions:SensorPositions={};
      for(const [key,anchor] of Object.entries(model.anchors)) {
        const p=anchor.getWorldPosition(new THREE.Vector3()).project(camera);
        positions[key as ModelTarget]={x:Math.round((p.x+1)*500)/10,y:Math.round((1-p.y)*500)/10,visible:p.z>=-1&&p.z<=1&&p.x>-.95&&p.x<.95&&p.y>-.91&&p.y<.91};
      }
      const serialized=JSON.stringify(positions);if(serialized!==previousPositions){previousPositions=serialized;onPositions(positions);}
    }
    if(changing||cameraChanging||moved)request();
  }
  function resize() {
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h);
    const savedPosition=camera.position.clone(),savedTarget=controls.target.clone(),savedZoom=camera.zoom;
    const framedTarget=frameRoomCamera(camera,initial.room,w/h,"overview");
    if(last){camera.position.copy(savedPosition);controls.target.copy(savedTarget);camera.zoom=savedZoom;camera.updateProjectionMatrix();}
    else controls.target.copy(framedTarget);
    controls.update();request();
  }
  function setView(next:ModelView) {
    view=initial.room==="living-room"?next:"overview";
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    const temp=camera.clone(),target=frameRoomCamera(temp,initial.room,w/h,view);
    const overview=camera.clone();frameRoomCamera(overview,initial.room,w/h,"overview");const overviewWidth=overview.right;
    camera.left=-overviewWidth;camera.right=overviewWidth;camera.top=overviewWidth/(w/h);camera.bottom=-overviewWidth/(w/h);camera.updateProjectionMatrix();
    desiredTarget=target;desiredEye=temp.position;desiredZoom=view==="overview"?1:Math.min(1.9,overviewWidth/Math.max(4.25,3.25*w/h));request();
  }
  function pointerDown(event:PointerEvent){down.x=event.clientX;down.y=event.clientY;down.id=event.pointerId;desiredTarget=desiredEye=null;}
  function pointerUp(event:PointerEvent) {
    if(!onPick||event.pointerId!==down.id||Math.hypot(event.clientX-down.x,event.clientY-down.y)>6)return;
    const bounds=host.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
    ray.setFromCamera(pointer,camera);const key=interactionAtPointer();if(key)onPick(key);
  }
  function pointerMove(event:PointerEvent) {
    if(!onPick||event.buttons||performance.now()-lastHover<50)return;lastHover=performance.now();
    const bounds=host.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);ray.setFromCamera(pointer,camera);
    const cursor=interactionAtPointer()?"pointer":"grab";host.style.cursor=cursor;renderer.domElement.style.cursor=cursor;
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){request();}else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:"100px"});visibilityObserver.observe(host);
  const visibilityChange=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{request();}};
  const motionChange=()=>{controls.enableDamping=!reduced.matches;request();};
  const contextLost=(event:Event)=>{event.preventDefault();onFailure();};
  controls.addEventListener("change",request);document.addEventListener("visibilitychange",visibilityChange);reduced.addEventListener("change",motionChange);
  renderer.domElement.addEventListener("webglcontextlost",contextLost);host.addEventListener("pointerdown",pointerDown);host.addEventListener("pointerup",pointerUp);host.addEventListener("pointermove",pointerMove);
  resize();request();
  return {
    kind:vector?"vector":"webgl",
    update(state){model.update(state);request();},
    rotate(direction){desiredEye=desiredTarget=null;const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.theta=THREE.MathUtils.clamp(s.theta+direction*.18,-.38,1.37);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();request();},
    zoom(direction){desiredZoom=THREE.MathUtils.clamp(desiredZoom+direction*.2,.8,2.2);request();},
    setView,
    resetView(){setView("overview");},
    dispose(){disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();visibilityObserver.disconnect();controls.dispose();document.removeEventListener("visibilitychange",visibilityChange);reduced.removeEventListener("change",motionChange);renderer.domElement.removeEventListener("webglcontextlost",contextLost);host.removeEventListener("pointerdown",pointerDown);host.removeEventListener("pointerup",pointerUp);host.removeEventListener("pointermove",pointerMove);model.dispose();if(renderer instanceof THREE.WebGLRenderer)renderer.dispose();else renderer.clear();renderer.domElement.remove();},
  };
}
