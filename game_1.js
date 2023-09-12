const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const w=512
const h=512

manager=new ManagerOfSprites()





/*
grid=new StickWeb(manager)

grid.add_point(w/2,h/2,1)
grid.add_point(w/2-100,h/2,0)
grid.add_point(w/2-10,h/2+50,0)
grid.add_point(w/2-10,h/2+50,0)

grid.add_connection(0,1,100)
grid.add_connection(1,2,60)
grid.add_connection(3,2,60)


circles=new Circles(manager)
circles.add_circle(w/2,h/2,30)
circles.add_circle(w/2,h/2+30,10)
circles.add_circle(w/2+50,h/2+50,15)
circles.adjust_all_circles()
*/

afterEffects=new Sprite(manager)
afterEffects.stick=[0,0,0,0]
afterEffects.circle=[0,0,0]
afterEffects.draw=function(){
    ctx.beginPath()
    ctx.arc(...this.circle,0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(this.stick[0],this.stick[1])
    ctx.lineTo(this.stick[2],this.stick[3])
    ctx.stroke()
}


circlegrid=new StickWebxCircles(manager)
circlegrid.add_point(w/2,h/2,30,1)
circlegrid.add_point(w/2,h/2+100,15,0)
circlegrid.add_point(w/2,h/2+200,15,0)
circlegrid.add_point(w/2,h/2-100,15,0)
circlegrid.add_point(w/2,h/2,15,0)

circlegrid.add_connection(0,1,100)
circlegrid.add_connection(1,2,100)
circlegrid.add_connection(0,4,100)
// circlegrid.add_point(w/2,h/2+10,20,0)
circlegrid.move_point(2,3,0)
function onclick(event){
    if(KeysPressed.has('a')){
        circlegrid.add_point(...onmousedownCoords,mathToolkit.distance(...onmousedownCoords,event.x,event.y),KeysPressed.has('l'))
    }else if(KeysPressed.has('c')){
        let pointId1=circlegrid.get_circle_id_by_cords(...onmousedownCoords)
        let pointId2=circlegrid.get_circle_id_by_cords(event.x,event.y)

        if(pointId1!=-1&&pointId2!=-1){
            circlegrid.add_connection(pointId1,pointId2)
        }
    }else if(KeysPressed.has('d')){
        let pointId=circlegrid.get_circle_id_by_cords(event.x,event.y)
        if(pointId!=-1){
            circlegrid.delete_point(pointId)
        }
    }
    afterEffects.stick=[0,0,0,0]
    afterEffects.circle=[0,0,0]
}
function onmousemove(event){
    if(mouseDown){
        if(KeysPressed.has('a')){
            afterEffects.circle[2]=mathToolkit.distance(...onmousedownCoords,event.x,event.y)
        }else if(KeysPressed.has('c')){
            afterEffects.stick[2]=event.x
            afterEffects.stick[3]=event.y
        }
    }
}
mouseDown=0;
function onmouseup(event){
    mouseDown=0;
}
onmousedownCoords=[0,0]
function onmousedown(event){
    mouseDown=1;
    
    onmousedownCoords=[event.x,event.y]

    circlegrid.stop_all()
    afterEffects.stick[0]=event.x
    afterEffects.stick[1]=event.y
    afterEffects.stick[2]=event.x
    afterEffects.stick[3]=event.y
    afterEffects.circle[0]=event.x
    afterEffects.circle[1]=event.y
}

const KeysPressed=new Set();
function onkeydown(event){
    KeysPressed.add(event.key);
}
function onkeyup(event){
    KeysPressed.delete(event.key);
    //console.log(KeysPressed)
}


function tick(){

manager.tick('tick')
ctx.clearRect(0,0,w,h)
manager.tick('draw')

}

const fps=60
mainLoop=setInterval(tick,1000/fps)

onClickEvent=canvas.addEventListener('click',onclick);
onMouseMoveEvent=canvas.addEventListener('mousemove',onmousemove);
onKeyDownEvent=document.addEventListener('keydown',onkeydown);
onKeyUpEvent=document.addEventListener('keyup',onkeyup);
onMouseDownEvent=document.addEventListener('mousedown',onmousedown);
onMouseUpEvent=document.addEventListener('mouseup',onmouseup);
