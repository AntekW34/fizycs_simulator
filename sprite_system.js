
mathToolkit={
    distance: (x1,y1,x2,y2)=>((x1-x2)**2+(y1-y2)**2)**0.5,
    avg: (...args)=>(args.reduce((a,b)=>a+b)/args.length)
}


class ManagerOfSprites {
    constructor() {
        this.sprites = []
    }
    add_sprite(Sprite) {
        this.sprites.push(Sprite)
    }
    tick(name) {
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i][name]()
        }
    }
}

class Sprite {
    constructor(ManagerOfSprites) {
        ManagerOfSprites.add_sprite(this)
    }
    tick() { }
    draw() { }
}
class Rect {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
    collide(rect2) {
        rect1 = this
        return (
            rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.h + rect1.y > rect2.y
        )
    }
    collidePoint(x, y) {
        return (
            x < this.right &&
            x > this.left &&
            y < this.bottom &&
            y > this.top
        )
    }

    moveTo(x, y) {
        this.x = x
        this.y = y
        return [x, y]
    }
    moveRel(sx, sy) {
        this.x += sx
        this.y += sy
        return [x, y]
    }
    scale(s) {
        this.w *= s
        this.h *= s
        return [w, h]
    }
    collideList(list) {
        return list.map(a => this.collide(a))
    }
    get centerx() {
        return this.x + this.w / 2
    }
    get centery() {
        return this.y + this.h / 2
    }
    get center() {
        return [this.centerx, centery]
    }
    get left() {
        return this.x
    }
    get right() {
        return this.x + this.w
    }
    get top() {
        return this.y
    }
    get bottom() {
        return this.y + this.h
    }
    get righttop() {
        return [this.right, this.top]
    }
    get rightbottom() {
        return [this.right, this.bottom]
    }
    get lefttop() {
        return [this.left, this.top]
    }
    get leftbottom() {
        return [this.left, this.bottom]
    }
    get midbottom() {
        return [this.centerx, this.bottom]
    }
    get midright() {
        return [this.right, this.centery]
    }
    get midleft() {
        return [this.left, this.centery]
    }
    get midtop() {
        return [this.centerx, this.top]
    }
}

class MovablePoint {
    constructor(x, y, vx, vy, ax, ay) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.ax = ax
        this.ay = ay
    }
    tick() {
        this.vx += this.ax
        this.vy += this.ay
        this.x += this.vx
        this.y += this.vy
    }
    untick() {
        this.x -= this.vx
        this.y -= this.vy
        this.vx -= this.ax
        this.vy -= this.ay
    }
    setGravity(g) {
        this.ay = g
    }
    setWind(a) {
        this.ay = a
    }
    move(relX, relY) {
        this.x += relX
        this.y += relY
    }
    accelerate(ax, ay) {
        this.vx += ax
        this.vy += ay
    }
    addConstantForce(ax, ay) {
        this.ax += ax
        this.ay += ay
    }
    bounce(normal) {
        let dot_product = this.vx * normal[0] + this.vy * normal[1]
        this.vx -= 2 * dot_product * normal[0]
        this.vy -= 2 * dot_product * normal[1]
    }
}


//here are some usefull classes
class PlayerPlatformer extends Sprite {
    constructor(ManagerOfSprites, image, x, y, w, h, obstacleHitboxes, KeysPressed) {
        super(ManagerOfSprites)
        this.image = image
        this.KeysPressed = KeysPressed
        this.Rect = new Rect(x, y, w, h)
        this.keyBinds = { left: ['a', 'ArrowLeft'], right: ['d', 'ArrowRight'], up: ['w', 'ArrowUp'], down: ['s', 'ArrowDown'] }
        this.hitboxes = obstacleHitboxes
    }
    tick() {
        if (this.keyBinds.left.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.x--
        }
        if (this.keyBinds.right.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.x++
        }
        if (this.keyBinds.up.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.y--
        }
        if (this.keyBinds.down.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.y++
        }
    }
    draw() { }
} 

class Player extends Sprite {
    constructor(ManagerOfSprites, image, x, y, KeysPressed) {
        super(ManagerOfSprites)
        this.image = image
        this.KeysPressed = KeysPressed
        this.x = x
        this.y = y
        this.keyBinds = { left: ['a', 'ArrowLeft'], right: ['d', 'ArrowRight'], up: ['w', 'ArrowUp'], down: ['s', 'ArrowDown'] }
    }
    tick() {
        if (this.keyBinds.left.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.x--
        }
        if (this.keyBinds.right.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.x++
        }
        if (this.keyBinds.up.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.y--
        }
        if (this.keyBinds.down.map(a => this.KeysPressed.has(a)).some(_ => _)) {
            this.y++
        }
    }
    draw() { }
}

class StickWeb extends Sprite {
    constructor(ManagerOfSprites, points = new Float32Array([]), connections = new Uint16Array([]), distances = new Float32Array([]), locked = new Uint8Array([])) {
        super(ManagerOfSprites)
        this.points = points
        this.connections = connections
        this.distances = distances
        this.locked = locked
        this.lastpoints = new Float32Array([...points])
    }
    normalize_sticks() {
        for (let i = 0; i < this.distances.length; i++) {
            let point_1_id = this.connections[i * 2]
            let point_2_id = this.connections[i * 2 + 1]

            let point1 = { x: this.points[point_1_id * 2], y: this.points[point_1_id * 2 + 1] }
            let point2 = { x: this.points[point_2_id * 2], y: this.points[point_2_id * 2 + 1] }
            let distance = this.distances[i]

            let dir = Math.atan2((point2.y - point1.y), (point2.x - point1.x))
            let center = { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2 }
            let new_point1 = { x: center.x - Math.cos(dir) * distance / 2, y: center.y - Math.sin(dir) * distance / 2 }
            let new_point2 = { x: center.x + Math.cos(dir) * distance / 2, y: center.y + Math.sin(dir) * distance / 2 }

            if (!this.locked[point_1_id]) {
                this.points[point_1_id * 2] = new_point1.x
                this.points[point_1_id * 2 + 1] = new_point1.y
            }
            if (!this.locked[point_2_id]) {
                this.points[point_2_id * 2] = new_point2.x
                this.points[point_2_id * 2 + 1] = new_point2.y
            }
        }
    }

    move_same_amount_as_last_time() {
        let recorded_points = [...this.points]

        for (let i = 0; i < this.points.length; i++) {
            if (!this.locked[Math.floor(i / 2)]) {
                this.points[i] += this.points[i] - this.lastpoints[i]
                this.lastpoints[i] = recorded_points[i]
            }
        }
    }

    move_point(point_id,vx,vy){
        this.points[point_id*2]+=vx
        this.points[point_id*2+1]+=vy
    }

    move_all(vx, vy) {
        for (let i = 0; i < this.locked.length; i++) {
            if (!this.locked[i]) {
                this.points[i * 2] += vx
                this.points[i * 2 + 1] += vy
            }
        }
    }
    add_point(x, y, locked = 0) {
        this.points = new Float32Array([...this.points, x, y])
        this.locked = new Uint8Array([...this.locked, locked])
        this.lastpoints = new Float32Array([...this.points])
        return (this.points.length)/2-1
    }


    add_connection(point_1_id, point_2_id, distance='auto') {

        if(distance=='auto'){
            distance=mathToolkit.distance(...this.get_point(point_1_id),...this.get_point(point_2_id))
        }

        this.connections = new Uint16Array([...this.connections, point_1_id, point_2_id])
        this.distances = new Float32Array([...this.distances, distance])
        return this.connections.length-1
    }

    get_point(point_id) {
        return [this.points[point_id * 2], this.points[point_id * 2 + 1]]
    }

    get_connection(connection_id) {
        return [this.connections[connection_id * 2], this.connections[connection_id * 2 + 1]]
    }
    get_distance(connection_id) {
        return this.distances[connection_id]
    }

    modify_point(point_id, x, y, locked = undefined) {
        if (locked != undefined) {
            this.locked[point_id] = locked
        }
        this.points[point_id * 2] = x
        this.points[point_id * 2 + 1] = y
    }

    modify_connection(connection_id, distance) {
        this.distances[connection_id] = distance
    }

    tick() {
        const normalize_amount = 10
        const g=0

        this.move_all(0, g)
        this.move_same_amount_as_last_time()

        for (let i = 0; i < normalize_amount; i++) {
            this.normalize_sticks()
        }

    }
    draw() {
        for (let point_id = 0; point_id < this.locked.length; point_id++) {
            ctx.beginPath()
            ctx.arc(...this.get_point(point_id), 5, 0, Math.PI * 2)
            ctx.stroke()

        }
        for (let connection_id = 0; connection_id < this.distances.length; connection_id++) {
            let [point_1_id, point_2_id] = this.get_connection(connection_id)
            ctx.moveTo(...this.get_point(point_1_id))
            ctx.lineTo(...this.get_point(point_2_id))
        }
        ctx.stroke()
    }
}

class StickWebxCircles extends StickWeb {//and circles
    constructor(ManagerOfSprites, points = new Float32Array([]), connections = new Uint16Array([]), distances = new Float32Array([]), locked = new Uint8Array([]), radiuses = new Float32Array([])) {
        super(ManagerOfSprites,points,connections,distances,locked)
        this.radiuses = radiuses
    }
    add_point(x, y,radius=0, locked = 0) {
        this.points = new Float32Array([...this.points, x, y])
        this.locked = new Uint8Array([...this.locked, locked])
        this.radiuses = new Float32Array([...this.radiuses,radius])

        this.lastpoints = new Float32Array([...this.points])
        return (this.points.length)/2-1
    }
    get_circle(circleId){
        return {
            x:this.points[circleId*2],
            y:this.points[circleId*2+1],
            r:this.radiuses[circleId],
            id:circleId
        }
    }
    set_circle(circle){
        this.points[circle.id*2]=circle.x
        this.points[circle.id*2+1]=circle.y
        this.radiuses[circle.id]=circle.r
    }
    delta(circle1,circle2){
        return circle1.r+circle2.r-mathToolkit.distance(circle1.x,circle1.y,circle2.x,circle2.y)
    }
    adjust_circles(circleId1,circleId2){
        const damp=0.01
        if(circleId1==circleId2){
            return 0
        }
        if(this.locked[circleId1]&&this.locked[circleId2]){
            return 0
        }
        let circle1=this.get_circle(circleId1)
        let circle2=this.get_circle(circleId2)
        
        let d=this.delta(circle1,circle2)
        if(d<0){
            return 0
        }
        let dir=Math.atan2(circle1.y-circle2.y,circle1.x-circle2.x)
        
        let center={x:mathToolkit.avg(circle1.x,circle2.x),y:mathToolkit.avg(circle1.y,circle2.y)}
        
        if(this.locked[circle1.id]||this.locked[circle2.id]){
            if(this.locked[circle2.id]){
                circle1.x+=Math.cos(dir)*d*(1+damp)
                circle1.y+=Math.sin(dir)*d*(1+damp)
            }{
                circle2.x-=Math.cos(dir)*d*(1+damp)
                circle2.y-=Math.sin(dir)*d*(1+damp)
            }
        }else{
            circle1.x+=Math.cos(dir)*d*(0.5+damp)
            circle1.y+=Math.sin(dir)*d*(0.5+damp)
            circle2.x-=Math.cos(dir)*d*(0.5+damp)
            circle2.y-=Math.sin(dir)*d*(0.5+damp)
        }

        
        this.set_circle(circle1)
        this.set_circle(circle2)
    }
    adjust_all_circles(){
        for (let circleId1 = 0; circleId1 < this.radiuses.length; circleId1++) {
            for (let circleId2 = circleId1; circleId2 < this.radiuses.length; circleId2++) {
                this.adjust_circles(circleId1,circleId2)
            }
        }
    }
    move_same_amount_as_last_time(damp) {
        let recorded_points = [...this.points]

        for (let i = 0; i < this.points.length; i++) {
            if (!this.locked[Math.floor(i / 2)]) {
                this.points[i] += (this.points[i] - this.lastpoints[i])*damp
                this.lastpoints[i] = recorded_points[i]
            }
        }
    }
    tick() {
        const normalize_amount = 20
        const g=0
    
        this.move_all(0, g)
        this.move_same_amount_as_last_time(1)
    
        for (let i = 0; i < normalize_amount; i++) {
            this.normalize_sticks()
            this.adjust_all_circles()
        }
    
    }
    draw() {
        for (let point_id = 0; point_id < this.locked.length; point_id++) {
            ctx.beginPath()
            ctx.arc(...this.get_point(point_id), this.radiuses[point_id], 0, Math.PI * 2)
            ctx.stroke()
            
        }
        for (let connection_id = 0; connection_id < this.distances.length; connection_id++) {
            let [point_1_id, point_2_id] = this.get_connection(connection_id)
            ctx.moveTo(...this.get_point(point_1_id))
            ctx.lineTo(...this.get_point(point_2_id))
        }
        ctx.stroke()
    }
    get_circle_id_by_cords(x,y){
        for (let point_id = 0; point_id < this.locked.length; point_id++) {
            let circle=this.get_circle(point_id)
            if(mathToolkit.distance(circle.x,circle.y,x,y)<circle.r){
                return circle.id
            }
        }
        return -1
    }
    stop_all(){
        this.lastpoints = new Float32Array([...this.points])
    }
    delete_point(pointid){
        this.points=new Float32Array(this.points.filter((v,i)=>(pointid*2!=i&&pointid*2+1!=i)))
        this.lastpoints=new Float32Array([...this.points])

        this.locked=new Uint8Array(this.locked.filter((v,i)=>(i!=pointid)))
        this.radiuses=new Float32Array(this.radiuses.filter((v,i)=>(i!=pointid)))
        
        this.connections=new Uint16Array(this.connections.filter((v,i,a)=>{let o=(v!=pointid&&a[i+(i%2-0.5)*-2]!=pointid);if(!o){this.distances[Math.floor(i/2)]=-1};return o}).map(a=>((a>pointid)?(a-1):a)))
        this.distances=new Float32Array(this.distances.filter((v,i)=>(v!=-1)))

    }
}



class Circles extends Sprite{
    constructor(ManagerOfSprites,circles=[]){
        super(ManagerOfSprites)
        this.circles=circles
        this.lastcircles=[...this.circles]
    }
    add_circle(x,y,r){
        this.circles.push(x,y,r)
        this.lastcircles.push(x,y,r)
    }
    get_circle(circleId){
        return {
            x:this.circles[circleId*3],
            y:this.circles[circleId*3+1],
            r:this.circles[circleId*3+2],
            id:circleId
        }
    }
    set_circle(circle){
        this.circles[circle.id*3]=circle.x
        this.circles[circle.id*3+1]=circle.y
        this.circles[circle.id*3+2]=circle.r
    }
    move_circle(circleId,x,y){
        let circle=this.get_circle(circleId)
        circle.x+=x
        circle.y+=y
        this.set_circle(circle)
    }
    delta(circle1,circle2){
        return circle1.r+circle2.r-mathToolkit.distance(circle1.x,circle1.y,circle2.x,circle2.y)
    }
    adjust_circles(circleId1,circleId2){
        const damp=0.01
        if(circleId1==circleId2){
            return 0
        }
        let circle1=this.get_circle(circleId1)
        let circle2=this.get_circle(circleId2)

        let d=this.delta(circle1,circle2)
        if(d<0){
            return 0
        }
        let dir=Math.atan2(circle1.y-circle2.y,circle1.x-circle2.x)
        
        //let center={x:mathToolkit.avg(circle1.x,circle2.x),y:mathToolkit.avg(circle1.y,circle2.y)}
        //console.log(center,dir,d,circle1,circle2)
        circle1.x+=(Math.cos(dir)*d*(0.5+damp))
        circle1.y+=(Math.sin(dir)*d*(0.5+damp))
        circle2.x-=(Math.cos(dir)*d*(0.5+damp))
        circle2.y-=(Math.sin(dir)*d*(0.5+damp))

        this.set_circle(circle1)
        this.set_circle(circle2)
    }
    adjust_all_circles(){
        for (let circleId1 = 0; circleId1 < this.circles.length/3; circleId1++) {
            for (let circleId2 = circleId1; circleId2 < this.circles.length/3; circleId2++) {
                this.adjust_circles(circleId1,circleId2)
            }
        }
    }
    move_same_amount_as_last_time(){
        let saved=[...this.circles]
        let damp=0.93
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i]+=(this.circles[i]-this.lastcircles[i])*damp
        }
        this.lastcircles=saved
    }
    tick(){
        const normalize_amount = 10
        const g=0

        this.move_same_amount_as_last_time()

        for (let i = 0; i < normalize_amount; i++) {
            this.adjust_all_circles()
        }
    }
    draw(){
        for (let circleId = 0; circleId < this.circles.length/3; circleId++) {
            let circle=this.get_circle(circleId)
            ctx.beginPath()
            ctx.arc(circle.x,circle.y,circle.r, 0, Math.PI * 2)
            ctx.stroke()
        }
    }
 
}