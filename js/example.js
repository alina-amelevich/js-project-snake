window.onload = function() {
    document.addEventListener('keydown', changeDirection);
    setInterval(loop, 1000/60); // 60 FPS
  }
  
  var
    canvas 				= document.getElementById('mc'), // canvas
    context					= canvas.getContext('2d'), // 2d context
    isGameStart = fkp			= false, // game started && first key pressed (initialization states)
    speed = baseSpeed 	= 3, // snake movement speed
    xv = yv				= 0, // velocity (x & y)
    posX 					= ~~(canvas.width) / 2, // player X position
    posY 					= ~~(canvas.height) / 2, // player Y position
    pw = ph				= 20, // ШИРИНА И ВЫСОТА ФРАГМЕНТА ЗМЕЙКИ player size
    aw = ah				= 20, // РАЗМЕР ЯБЛОКА apple size
    apples				= [], // apples list
    trail				= [], // tail elements list (aka trail)
    tailSize 				= 100, // tail size (1 for 10)
    tailSafeZone		= 20, // self eating protection for head zone (aka safeZone)
    cooldown			= false, // is key in cooldown mode
    score				= 0; // current score
  
  // game main loop ПЕТЛЯ
  function loop() 
  {
    // logic
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    // force speed
    posX += xv;
    posY += yv;
  
    // teleports
    if( posX > canvas.width )
      {posX = 0;}
  
    if( posX + pw < 0 )
      {posX = canvas.width;}
  
    if( posY + ph < 0 )
      {posY = canvas.height;}
  
    if( posY > canvas.height )
      {posY = 0;}
  
    // paint the snake itself with the tail elements
    context.fillStyle = 'lime';
    for( var i = 0; i < trail.length; i++ )
    {
      context.fillStyle = trail[i].color || 'lime';
      context.fillRect(trail[i].x, trail[i].y, pw, ph);
    }
  
    trail.push({x: posX, y: posY, color: rc()});
  
    // limiter
    if( trail.length > tailSize )
    {
      trail.shift();
    }
  
    // eaten
    if( trail.length > tailSize )
    {
      trail.shift();
    }
  
    // self collisions Столкновения с собой
    if( trail.length >= tailSize && isGameStart )
    {
      for( var i = trail.length - tailSafeZone; i >= 0; i-- )
      {
        if(
          posX < (trail[i].x + pw)
          && posX + pw > trail[i].x
          && posY < (trail[i].y + ph)
          && posY + ph > trail[i].y
        )
        {
          // got collision
          tailSize = 10; // cut the tail
          speed = baseSpeed; // cut the speed (flash nomore lol xD)
  
          for( var t = 0; t < trail.length; t++ )
          {
            // highlight lossed area
            trail[t].color = 'red';
  
            if( t >= trail.length - tailSize )
              {break;}
          }
        }
      }
    }
  
    // paint apples
    for( var a = 0; a < apples.length; a++ )
    {
      context.fillStyle = apples[a].color;
      context.fillRect(apples[a].x, apples[a].y, aw, ah);
    }
  
    // check for snake head collisions with apples Проверка столкновения головы змейки с яблоком
    for( var a = 0; a < apples.length; a++ )
    {
      if(
        posX < (apples[a].x + pw)
        && posX + pw > apples[a].x
        && posY < (apples[a].y + ph)
        && posY + ph > apples[a].y
      )
      {
        // got collision with apple Осуществление поедания яблока
        apples.splice(a, 1); // remove this apple from the apples list
        tailSize += 10; // add tail length
        speed += .1; // add some speed
        spawnApple(); // spawn another apple(-s)
        break;
      }
    }
  }
  
  // apples spawner
  function spawnApple()
  {
    var
      newApple = {
        x: ~~(Math.random() * canvas.width),
        y: ~~(Math.random() * canvas.height),
        color: 'red'
      };
  
    // forbid to spawn near the edges
    if(
      (newApple.x < aw || newApple.x > canvas.width - aw)
      ||
      (newApple.y < ah || newApple.y > canvas.height - ah)
    )
    {
      spawnApple();
      return;
    }
  
    // check for collisions with tail element, so no apple will be spawned in it
    for( var i = 0; i < tailSize.length; i++ )
    {
      if(
        newApple.x < (trail[i].x + pw)
        && newApple.x + aw > trail[i].x
        && newApple.y < (trail[i].y + ph)
        && newApple.y + ah > trail[i].y
      )
      {
        // got collision
        spawnApple();
        return;
      }
    }
  
    apples.push(newApple);
  
    if( apples.length < 3 && ~~(Math.random() * 1000) > 700 )
    {
      // 30% chance to spawn one more apple
      spawnApple();
    }
  }
  
  // random color generator (for debugging purpose or just 4fun)
  function rc()
  {
    return '#' + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16));
  }
  
  // velocity changer (controls)
  function changeDirection(evt)
  {
    if( !fkp && [37,38,39,40].indexOf(evt.keyCode) > -1 )
    {
      setTimeout(function() {isGameStart = true;}, 1000);
      fkp = true;
      spawnApple();
    }
  
    if( cooldown )
      {return false;}
  
    /*
      4 directional movement.
     */
    if( evt.keyCode == 37 && !(xv > 0) ) // left arrow
      {xv = -speed; yv = 0;}
  
    if( evt.keyCode == 38 && !(yv > 0) ) // top arrow
      {xv = 0; yv = -speed;}
  
    if( evt.keyCode == 39 && !(xv < 0) ) // right arrow
      {xv = speed; yv = 0;}
  
    if( evt.keyCode == 40 && !(yv < 0) ) // down arrow
      {xv = 0; yv = speed;}
  
    cooldown = true;
    setTimeout(function() {cooldown = false;}, 100);
  }