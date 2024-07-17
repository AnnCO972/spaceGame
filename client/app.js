const apiUrl = process.env.APP_API_URL || '/api';
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
    this.speed =0;
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
  constructor(x,y,width,height) {
    super(x,y);
    this.type = "Hero";
    this.width= width;
    this.height = height;
    this.speed = 0
    this.cooldown =0;
    this.life = 3;
    this.points = 0;
    }
    fire(){
      gameObjects.push(new Laser(this.x+45, this.y -10));
      this.cooldown =heroSpec.cooldown;

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
    addPoints(enemy){
      if (enemy)
      {
        this.points +=100;
      }else{
        this.points +=50;
      }
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
  constructor(x, y,width,height) {
    super(x, y);
    this.width = width;
    this.height =height;
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
  powerUp(){
    gameObjects.push(new PowerUp(this.x - 40, this.y + 15));
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
class PowerUp extends GameObject {
  constructor(x,y) {
    super(x,y);
    this.width = 34;
    this.height = 33;
    this.type = "PowerUp";
    this.img = powerUpImg;
    let id = setInterval(() => {
      if(this.y < canvas.height - this.height) {
        this.y +=5;
      }else {
        clearInterval(id);
      }
    }, 150);
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
  COLLISION_HERO_POWERUP : "COLLISION_HERO_POWERUP",
  GAME_END_WIN : "GAME_END_WIN",
  GAME_END_LOSE : "GAME_END_LOSE",
};
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const enterBtn = document.getElementById('enterBtn');
const shootBtn = document.getElementById('shootBtn');
let gameLoopId,
    heroImg, 
    enemyImg,
    laserImg,
    lifeImg,
    powerUpImg,
    explosionImg,
    heroSpec,
    enemySpec,
    lifeSpec,
    PowerUpSpec,
    canvas, ctx,
    gameObjects = [],
    hero,
    level = 1,
    shot =0;
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
leftBtn.addEventListener( 'click', (e) => {
  eventEmitter.emit(Messages.KEY_EVENT_LEFT);
});
rightBtn.addEventListener('click',(e) => {
  eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
});
upBtn.addEventListener('click',(e) => {
  eventEmitter.emit(Messages.KEY_EVENT_UP);
});
downBtn.addEventListener('click', (e) => {
  eventEmitter.emit(Messages.KEY_EVENT_DOWN);
});
shootBtn.addEventListener('click',(e) => {
  eventEmitter.emit(Messages.KEY_EVENT_SPACE);
});
enterBtn.addEventListener('click', (e) => {
  eventEmitter.emit(Messages.KEY_EVENT_ENTER);
})
window.addEventListener('keydown', onKeyDown);
//TODO

function createEnemies() {
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL *enemySpec.width;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;

  for (let x = START_X; x < STOP_X; x += enemySpec.width) {
    for (let y = 0; y < enemySpec.height * 5; y += enemySpec.height) {
      const enemy = new Enemy(x,y, enemySpec.width ,enemySpec.height);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }
}
function createHero() {
  hero = new Hero(
    canvas.width / 2 - 45,
    canvas.height - canvas.height / 4,
    heroSpec.width, heroSpec.height
  );
  hero.img = heroImg;
  hero.speed = heroSpec.speed;
  gameObjects.push(hero);
}
function drawGameObject(ctx){
  gameObjects.forEach(go => go.draw(ctx));
}
function drawLife(){
  const START_POS = canvas.width -180;
  for(let i=0; i< hero.life; i++){
    ctx.drawImage(lifeImg,START_POS+(45*i), canvas.height -35 )
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
  const powerUps = gameObjects.filter(go => go.type === 'PowerUp');
  lasers.forEach((l) => {
    enemies.forEach((m) =>{
      if(intersectRect(l.rectFromGameObject(),m.rectFromGameObject())){
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER,{
          first: l, 
          second: m,
        });
        shot += 1;
      }
    });
  });
  enemies.forEach((enemy) => {
    const heroRect = hero.rectFromGameObject();
      if(intersectRect(enemy.rectFromGameObject(),heroRect)){
        eventEmitter.emit(Messages.COLLISION_ENEMY_HERO,{enemy});
      }
    });
    powerUps.forEach((powerUp) => {
      const heroRect = hero.rectFromGameObject();
      if(intersectRect(powerUp.rectFromGameObject(), heroRect)) {
        eventEmitter.emit(Messages.COLLISION_HERO_POWERUP,{powerUp});
      }
    })

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
      if(level <2)
      {
        displayMessage(`Victory! You Won level ${level}. Press [Enter] to start a new level `);
      }else{
        displayMessage("Victory! You Won. Press [Enter] to start a new game ");
      }
    }
    else{
      displayMessage("You Died ! Press [Enter] to start a new game!"); 
      level =0;
    }
  }, 200);
}
async function newLevel(){
  if(gameLoopId){
    clearInterval(gameLoopId);
    eventEmitter.on(Messages.COLLISION_HERO_POWERUP,(_,{powerUp}) => {
      powerUp.dead = true;
      hero.addPoints(false);
    })
    level +=1;
    shot =0;
    const lasers = gameObjects.filter(go => go.type === 'Laser');
    lasers.forEach((laser) => {laser.dead = true;});
    gameObjects = gameObjects.filter(go => go.type = 'Hero');
    await updateTexture();
    createEnemies();
    hero.width = heroSpec.width;
    hero.height = heroSpec.height;
    gameLoopId = setInterval(() => {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      ctx.fillStyle= 'black';
      ctx.fillRect(0,0, canvas.width, canvas.height);
      ctx.font = "30px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "right";
      ctx.fillText(`Score: ${hero.points}`,180, canvas.height - 10 );
      updateGame();
      drawGameObject(ctx);
    }, 100);

  }

}
function restartGame(){
  if(gameLoopId){
    clearInterval(gameLoopId);
    eventEmitter.clear();
    level = 1;
    initGame();
    gameLoopId = setInterval(() => {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      ctx.fillStyle= 'black';
      ctx.fillRect(0,0, canvas.width, canvas.height);
      ctx.font = "30px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "right";
      ctx.fillText(`Score: ${hero.points}`, 180, canvas.height - 10 );
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
    if(level >=2 & shot ===5){
      second.powerUp();
      shot = 0;
    }
    second.dead = true; 
    hero.addPoints(true);

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
    if(level != 0 ){
      newLevel();
    }
    else{ restartGame();}
  })
  
}
async function updateTexture(){
  try{
    const response = await fetch(`${apipUrl}/levels`);
    if(!response.ok){
      throw new Error('Network response was not ok'+ response.statusText);
    }

    const data = await response.json();
    heroSpec = data.levels[level].Hero;
    enemySpec = data.levels[level].Enemy;
    lifeSpec = data.levels[level].Life;

  enemyImg = await loadTexture(enemySpec.path);
  heroImg = await loadTexture(heroSpec.path);
  lifeImg = await loadTexture(lifeSpec.path);
  }catch(error){ console.error('error loading JSON',error);}
}

window.onload = async () => {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  //load textures
  
  laserImg = await loadTexture('./assets/laserRed.png');
  explosionImg = await loadTexture('./assets/explosion.png');
  powerUpImg = await loadTexture('./assets/powerUp.png');
  await updateTexture();
  initGame();
  //draw black background
  gameLoopId = setInterval(() => {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle= 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${hero.points}`,180, canvas.height - 10);
    updateGame();
    drawGameObject(ctx);
    
  }, 100);
}


