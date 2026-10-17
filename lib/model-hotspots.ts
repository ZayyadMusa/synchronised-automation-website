type Point={x:number;y:number};

// Labels have a full touch target and two readable lines. If two projected
// devices are close, move the label while retaining its physical leader line.
export function arrangeHotspots<T extends string>(positions:Record<T,Point>,keys:T[],width:number,height:number):Record<T,Point>{
  if(width<=0||height<=0)return positions;
  const labelWidth=width<480?115:126,labelHeight=92;
  const marginX=labelWidth/2+7,minY=labelHeight/2+8,maxY=height-labelHeight/2-15;
  const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
  const placed:Point[]=[],result={...positions};let needsGrid=false;
  const overlaps=(a:Point,b:Point)=>Math.abs(a.x-b.x)<labelWidth+8&&Math.abs(a.y-b.y)<labelHeight;
  for(const key of keys){
    const original={x:clamp(positions[key].x*width/100,marginX,width-marginX),y:clamp(positions[key].y*height/100,minY,maxY)};
    const candidates:Point[]=[original];
    for(const dx of [0,-1,1,-2,2])for(const dy of [0,-1,1,-2,2,-3,3])candidates.push({x:clamp(original.x+dx*(labelWidth+10),marginX,width-marginX),y:clamp(original.y+dy*(labelHeight+3),minY,maxY)});
    // Dense positions near a corner can exhaust the local alternatives.
    for(let x=marginX;x<=width-marginX+1;x+=labelWidth+9)for(let y=minY;y<=maxY;y+=labelHeight+3)candidates.push({x,y});
    candidates.sort((a,b)=>Math.hypot(a.x-original.x,a.y-original.y)-Math.hypot(b.x-original.x,b.y-original.y));
    const next=candidates.find(candidate=>placed.every(point=>!overlaps(candidate,point)));
    if(!next){needsGrid=true;break;}
    placed.push(next);result[key]={x:next.x/width*100,y:next.y/height*100};
  }
  if(needsGrid){
    // A central label can block both columns on a small phone. Repack all
    // labels together rather than leaving the last device on top of another.
    const columns=Math.max(1,Math.floor((width-2*marginX)/(labelWidth+8))+1),rows=Math.max(1,Math.floor((maxY-minY)/labelHeight)+1);
    const slots:Point[]=[];
    for(let column=0;column<columns;column++)for(let row=0;row<rows;row++)slots.push({x:columns===1?width/2:marginX+column*(width-2*marginX)/(columns-1),y:rows===1?(minY+maxY)/2:minY+row*(maxY-minY)/(rows-1)});
    for(const key of keys){
      const x=positions[key].x*width/100,y=positions[key].y*height/100;
      slots.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
      const slot=slots.shift();if(slot)result[key]={x:slot.x/width*100,y:slot.y/height*100};
    }
  }
  return result;
}
