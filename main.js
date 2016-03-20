;(function() {
  var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height };

    this.bodies = createInvaders(this).concat(new Player(this, gameSize))

    var self = this;
    loadSound("pew.mp3", function(shootSound) {
      self.shootSound = shootSound;
      var tick = function() {
        self.update();
        self.draw(screen, gameSize);
        requestAnimationFrame(tick);
      };

    tick();
    })
  };

  Game.prototype = {
    update: function() {
      var bodies = this.bodies;
      var notCollidingWithAnything = function(b1) {
          return bodies.filter(function(b2) {
            return colliding(b1, b2);
          }).length === 0;
      }
      this.bodies = this.bodies.filter(notCollidingWithAnything);


      for (var i = 0; i < this.bodies.length; i ++){
        this.bodies[i].update();
      }
    },
    draw: function(screen, gameSize) {
      screen.clearRect(0, 0, gameSize.x, gameSize.y)
      for (var i = 0; i < this.bodies.length; i ++){
        drawRect(screen, this.bodies[i]);
      }
    },
    addBody: function(body) {
        this.bodies.push(body);
      },

    invadersBelow: function(invader) {
      return this.bodies.filter(function(b) {
        return b instanceof Invader &&
               b.center.y > invader.center.y &&
               b.center.x - invader.center.x < invader.size.x;
  }).length > 0;
}

    };

var Player = function(game, gameSize) {
  this.game = game;
  this.size = {x:15, y: 15 };
  this.center = { x : gameSize.x / 2, y: gameSize.y - this.size.x };
  this.keyboarder = new Keyboarder();
}

Player.prototype = {
  update: function() {
    if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
      this.center.x -= 4;
    }else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
      this.center.x += 4;
    }
    if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
      var bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.x/2},
      {x: 0, y: -8});
      this.game.addBody(bullet);
      this.game.shootSound.load();
      this.game.shootSound.play();
    }
  }
}


var Invader = function(game, center) {
  this.game = game;
  this.size = {x:15, y: 15};
  this.center = center;
  this.patrolX = 0;
  this.speedX = 2;
}

Invader.prototype = {
  update: function() {
    if (this.patrolX < 0 || this.patrolX > 500){
      this.speedX = -this.speedX
    }

    this.center.x += this.speedX;
    this.patrolX += this.speedX;

    if(Math.random() > 0.997 && !this.game.invadersBelow(this)) {
      var bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.x/2},
      {x: Math.random() - 0.5, y: 8});
      this.game.addBody(bullet);

    }

  }
};

var createInvaders = function(game) {
  var invaders = [];
  for (var i = 0; i < 24; i++){
    var x = 30 + (i % 8) * 30;
    var y = 30 + (i % 3) * 30;
    invaders.push(new Invader(game, { x: x, y: y}))
  }
  return invaders;
}


var Bullet = function(center, velocity) {

  this.size = {x: 2, y: 2};
  this.center = center;
  this.velocity = velocity;
}

Bullet.prototype = {
  update: function() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;


  }
};

var Keyboarder = function() {
  var keyState = {};

  window.onkeydown = function(e) {
    if(e.keyCode === 32 && keyState[32] !== true) {
        keyState[32] = true;
      console.log(count)

    }else if(e.keyCode === 39 || e.keyCode === 37) {
      keyState[e.keyCode] = true
    }
  }
  window.onkeyup = function(e) {
    keyState[e.keyCode] = false
  };



  this.isDown = function(keyCode) {

    return keyState[keyCode] === true;
  };

  this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32}
};

var colliding = function(b1, b2) {
  return !(b1 === b2 ||
          b1.center.x + b1.size.x/2 < b2.center.x - b2.size.x / 2 ||
          b1.center.y + b1.size.y/2 < b2.center.y - b2.size.y / 2 ||
          b1.center.x - b1.size.x/2 > b2.center.x + b2.size.x / 2 ||
          b1.center.y - b1.size.y/2 > b2.center.y + b2.size.y / 2);
};

var loadSound = function(url, callback) {
  var loaded = function() {
    callback(sound);
    sound.removeEventListener("canplaythrough", loaded);
  };

  var sound = new Audio(url);
  sound.addEventListener("canplaythrough", loaded);
  sound.load()
}


var drawRect = function(screen, body) {
  screen.fillRect(body.center.x - body.size.x/2,
                  body.center.y - body.size.y/2,
                  body.size.x, body.size.y);
}



  window.onload = function() {
    new Game("screen");
  };
})()
