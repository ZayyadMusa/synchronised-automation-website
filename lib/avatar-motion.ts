export type WalkPoint={x:number;z:number};
export type WalkPose=WalkPoint&{yaw:number;speed:number;phase:number;blend:number};
const TAU=Math.PI*2,cruise=.92,acceleration=2.4;
const distance=(a:WalkPoint,b:WalkPoint)=>Math.hypot(a.x-b.x,a.z-b.z);
const angle=(value:number)=>Math.atan2(Math.sin(value),Math.cos(value));

// Position, momentum and stride survive a new destination. Walking speed is
// measured in model units/second; gait phase follows distance, not frame rate.
export function createAvatarWalker(start:WalkPoint,facing=Math.PI) {
  const pose:WalkPose={...start,yaw:facing,speed:0,phase:0,blend:0};
  let velocity={x:0,z:0},route:WalkPoint[]=[],finalYaw=facing;
  function setRoute(points:WalkPoint[],heading?:number){
    route=points.map(point=>({...point}));if(heading!==undefined)finalYaw=heading;
  }
  function relocateHidden(point:WalkPoint,heading=Math.PI){
    pose.x=point.x;pose.z=point.z;pose.yaw=heading;pose.speed=pose.blend=0;pose.phase=0;
    velocity={x:0,z:0};route=[];finalYaw=heading;
  }
  function step(seconds:number,reduced=false,blocked=false) {
    const dt=Math.max(0,Math.min(seconds,.12));
    if(reduced){
      if(!blocked&&route.length){const end=route[route.length-1];pose.x=end.x;pose.z=end.z;route=[];pose.yaw=finalYaw;}
      pose.speed=pose.blend=0;velocity={x:0,z:0};return false;
    }
    let active=false;
    // Substeps keep starts, turns and footwork consistent at 30, 60 or 120fps.
    const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
    for(let i=0;i<steps;i++){
      while(route.length>1&&distance(pose,route[0])<.1)route.shift();
      const destination=route[0]??pose,dx=destination.x-pose.x,dz=destination.z-pose.z,d=Math.hypot(dx,dz);
      const desiredYaw=!blocked&&d>.012?Math.atan2(dx,dz):pose.speed<.025?finalYaw:pose.yaw;
      const turn=angle(desiredYaw-pose.yaw);
      const turnStep=turn*(1-Math.exp(-h*7));pose.yaw+=turnStep;
      // A reversal first turns the body; it cannot instantly skate backwards.
      const alignment=Math.max(0,Math.cos(turn));
      const speed=blocked?0:Math.min(cruise,route.length===1?d*3.2:cruise)*alignment*alignment;
      const desiredVelocity={x:d>.001?dx/d*speed:0,z:d>.001?dz/d*speed:0};
      const vx=desiredVelocity.x-velocity.x,vz=desiredVelocity.z-velocity.z,change=Math.hypot(vx,vz);
      const mix=change?Math.min(1,acceleration*h/change):0;
      velocity.x+=vx*mix;velocity.z+=vz*mix;
      const next={x:pose.x+velocity.x*h,z:pose.z+velocity.z*h};
      if(route.length===1&&d<.009&&Math.hypot(velocity.x,velocity.z)<.04&&!blocked){
        pose.x=destination.x;pose.z=destination.z;velocity={x:0,z:0};route=[];
      }else{
        const travelled=distance(pose,next);pose.x=next.x;pose.z=next.z;pose.phase=(pose.phase+travelled/.8*TAU)%TAU;
      }
      pose.speed=Math.hypot(velocity.x,velocity.z);
      pose.blend+=(Math.min(1,pose.speed/.48)-pose.blend)*(1-Math.exp(-h*8));
      if(pose.blend<.001&&pose.speed===0)pose.blend=0;
      if(Math.abs(angle(finalYaw-pose.yaw))<.001&&route.length===0)pose.yaw=finalYaw;
      active=active||pose.speed>.001||pose.blend>.001||Math.abs(turn)>.002||(!blocked&&route.length>0);
    }
    return active;
  }
  return {pose,setRoute,relocateHidden,step,get travelling(){return route.length>0;}};
}

export function walkingLeg(phase:number,blend:number,hipHeight:number) {
  const t=((phase%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/Math.PI;
  const swing=t>=1,s=t-1,smooth=s*s*(3-2*s);
  const forward=(swing?-.195+.39*smooth:.195-.39*t)*blend;
  const lift=swing?Math.sin(s*Math.PI)*.073*blend:0;
  const down=hipHeight-(.05+lift),length=.29;
  const reach=Math.min(length*2-.00001,Math.hypot(down,forward));
  const offset=Math.acos(Math.max(-1,Math.min(1,reach/(length*2))));
  const hip=-(Math.atan2(forward,down)+offset);
  const knee=2*offset;
  return {hip,knee,ankle:-hip-knee-(swing?Math.sin(s*Math.PI)*.1*blend:0)};
}
