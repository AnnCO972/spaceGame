class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] =[];
    }
    this.listeners[message].push(listener);
  }

  emit(message, payload = null) {
    if(this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload))
    }
  }
  
  clear(){
    this.listeners = {};
  }
}
class GameObject {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }
    rectFromGameObject() {
      return {
        top: this.y,
        left: this.x,
        bottom: this.y + this.height, 
        right: this.x + this.width
      }
    }

  draw(ctx)
  {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}
class Hero extends GameObject {
  constructor(x,y) {
    super(x,y);
    this.width = 99,
    this.height = 75,
    this.type = "Hero";
    this.speed = {x:0,y:0};
    this.cooldown =0;
    this.life = 3;
    this.points = 0;
    }
    fire(){
      gameObjects.push(new Laser(this.x+45, this.y -10));
      this.cooldown =500;

      let id = setInterval(() => {
        if(this.cooldown > 0){
          this.cooldown -=100;
        }else {
          clearInterval(id);
        }
      }, 200);
    }
    canFire(){
      return this.cooldown ===0;
    }
    addPoints(){
      this.points +=100;
    }
  updateLife(){
      this.life --;
      if(this.life === 0 )
      {
        this.dead = true;
      }
    }
}

class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 98), (this.height = 50);
    this.type = "Enemy";
    let id = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += 5;
      } else {
        console.log('Stopped at', this.y)
        clearInterval(id);
      }
    }, 400)  
  }
}
class Laser extends GameObject{
  constructor(x,y){
    super(x,y);
    this.width = 9;
    this.height = 33;
    this.type = "Laser";
    this.img = laserImg;
    let id = setInterval(() => {
      if (this.y > 0){
        this.y -=15;
      }else {
        this.dead = true;
        clearInterval(id)
      }
    }, 100);
  } 
}

class Explosion extends GameObject {
  constructor(x,y){
    super(x,y);
    this.width = 100;
    this.height=100;
    this.type = 'Explosion';
    this.img = explosionImg;
    let id = setTimeout(()=>{
      this.dead = true}, 100)
  }
}
function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = path
    img.onload = () => {
      resolve(img)
    }
  })
}
function intersectRect(r1,r2) {
  return !(r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top);
}
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN : "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT : "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT : "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE : "KEY_EVENT_SPACE",
  KEY_EVENT_ENTER : "KEY_EVENT_ENTER",
  COLLISION_ENEMY_LASER : "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_WIN : "GAME_END_WIN",
  GAME_END_LOSE : "GAME_END_LOSE",
};

let gameLoopId,
    heroImg, 
    enemyImg,
    laserImg,
    lifeImg,
    explosionImg,
    canvas, ctx,
    gameObjects = [],
    hero,
    eventEmitter = new EventEmitter();

let onKeyDown = function (e) {
  console.log(e.keyCode);
  switch (e.keyCode) {
    case 37: e.preventDefault(); eventEmitter.emit(Messages.KEY_EVENT_LEFT);break;            
    case 39: e.preventDefault(); eventEmitter.emit(Messages.KEY_EVENT_RIGHT); break;
    case 38: e.preventDefault(); eventEmitter.emit(Messages.KEY_EVENT_UP); break;
    case 40: e.preventDefault(); eventEmitter.emit(Messages.KEY_EVENT_DOWN); break;
    case 32: e.preventDefault(); eventEmitter.emit(Messages.KEY_EVENT_SPACE);break;
    case 13:e.preventDefault(); eventEmitter.emit(Messages.KEY_EVENT_ENTER); break;
    default:
      break; // do not block other keys
  }
};
window.addEventListener('keydown', onKeyDown);
//TODO

function createEnemies() {
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;

  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x,y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }
}
function createHero() {
  hero = new Hero(
    canvas.width / 2 - 45,
    canvas.height - canvas.height / 4
  );
  hero.img = heroImg;
  gameObjects.push(hero);
}
function drawGameObject(ctx){
  gameObjects.forEach(go => go.draw(ctx));
}
function drawLife(){
  const START_POS = canvas.width -180;
  for(let i=0; i< hero.life; i++){
    ctx.drawImage(lifeImg,START_POS +(45*(i+1)), canvas.height -37 )
  }

}
function isHeroDead(){
  return hero.life <=0;
}
function isEnnemiesDead(){
  const enemies = gameObjects.filter(go => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}
function displayMessage(message, color ='red'){
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
    ctx.fillText(message,canvas.width/2,canvas.height/2);
}
function updateGame(){
  drawLife();
  const enemies = gameObjects.filter(go => go.type ==='Enemy');
  const lasers = gameObjects.filter(go => go.type === 'Laser');

  lasers.forEach((l) => {
    enemies.forEach((m) =>{
      if(intersectRect(l.rectFromGameObject(),m.rectFromGameObject())){
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER,{
          first: l, 
          second: m,
        });
      }
    });
  });
  enemies.forEach((enemy) => {
    const heroRect = hero.rectFromGameObject();
      if(intersectRect(enemy.rectFromGameObject(),heroRect)){
        eventEmitter.emit(Messages.COLLISION_ENEMY_HERO,{enemy});
      }
    });

  gameObjects = gameObjects.filter(go => !go.dead);

}
function endGame(win)
{
  clearInterval(gameLoopId);
  //
  setTimeout(() => {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    if(win){
      displayMessage("Victory! You Won. Press [Enter] to start a new game ");
    }
    else{
      displayMessage("You Died ! Press [Enter] to start a new game!"); 
    }
  }, 200);
}
function restartGame(){
  if(gameLoopId){
    clearInterval(gameLoopId);
    eventEmitter.clear();
    initGame();
    gameLoopId = setInterval(() => {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      ctx.fillStyle= 'black';
      ctx.fillRect(0,0, canvas.width, canvas.height);
      ctx.font = "30px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "right";
      ctx.fillText(`Score: ${hero.points}`,170,746 );
      updateGame();
      drawGameObject(ctx);
      
    }, 100);
  }
}
function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();

  eventEmitter.on(Messages.KEY_EVENT_UP,() =>{
    hero.y -=5;
  });
  eventEmitter.on(Messages.KEY_EVENT_DOWN,() =>{
    hero.y +=5;
  });
  eventEmitter.on(Messages.KEY_EVENT_LEFT,() =>{
    hero.x -=5;
  });
  eventEmitter.on(Messages.KEY_EVENT_RIGHT,() =>{
    hero.x +=5;
  });
  eventEmitter.on(Messages.KEY_EVENT_SPACE,() =>{
    if(hero.canFire()) {
      hero.fire();
    }
  });
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER,(_,{first, second}) =>{
    gameObjects.push(new Explosion(second.x, second.y));
    first.dead = true;
    second.dead = true; 
    hero.addPoints();

    if(isEnnemiesDead()){
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });
  eventEmitter.on(Messages.COLLISION_ENEMY_HERO,(_,{enemy}) =>{
    gameObjects.push(new Explosion(hero.x, hero.y));
    enemy.dead = true;
    hero.updateLife();
    if(isHeroDead()){
      eventEmitter.emit(Messages.GAME_END_LOSE);
      return;
    }
    if(isEnnemiesDead()){
      eventEmitter.emit(Messages.GAME_END_WIN);
    }
  });
  eventEmitter.on(Messages.GAME_END_WIN,() =>{
    endGame(true);
  })
  eventEmitter.on(Messages.GAME_END_LOSE,() =>{
    endGame(false);
  })
  eventEmitter.on(Messages.KEY_EVENT_ENTER,() =>{
    restartGame();
  })
}

window.onload = async () => {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  // TODO load textures
  enemyImg = await loadTexture('./assets/enemy1.png');
  heroImg = await loadTexture('./assets/player1.png');
  laserImg = await loadTexture('./assets/laserRed.png');
  explosionImg = await loadTexture('./assets/explosion.png');
  lifeImg = await loadTexture('./assets/life1.png');
  // TODO draw black background
  
  initGame();
  gameLoopId = setInterval(() => {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle= 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${hero.points}`,170,746 );
    updateGame();
    drawGameObject(ctx);
    
  }, 100);
}


