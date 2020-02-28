'use strict'
const backCanvas = document.querySelector('#background_controller');
const backContext = backCanvas.getContext('2d');

const canvas = document.querySelector('#game_field');
const context = canvas.getContext('2d');
//Размер поля
const fieldSize = { //параметры должны делиться на размер ячейки без остатка
  x: parseInt(canvas.offsetWidth), 
  y: parseInt(canvas.offsetHeight)
};
console.log('Размер поля: ', fieldSize.x, fieldSize.y);

const cellSize = 24;
const cell = {
  size: cellSize, //размер ячейки
  quarter: cellSize / 4, //четвертинка ячейки
  amount: { //кол-во ячеек
    x: fieldSize.x / cellSize,
    y: fieldSize.y / cellSize
  },
  center: { // центральная ячейка на поле, округл в меньшую сторону
    x: Math.floor(fieldSize.x / 2 / cellSize),
    y: Math.floor(fieldSize.y / 2 / cellSize)
  }
};
console.log('Кол-во ячеек: ', cell.amount.x, cell.amount.y);
console.log('Центральная ячейка: ', cell.center.x, cell.center.y);

let gameover = false;
const scoreSpan = document.querySelector('#score_value');
let score = 0; //счет

// let reachWall = {}; //инфа до какой стены дошла змея

//еда
const foodArray = [ //массив со всеми картинками еды
  '',
  'img/food1.png',
  'img/food2.png',
  'img/food3.png',
  'img/food4.png',
  'img/food5.png',
  'img/food6.png',
  'img/food7.png',
  'img/food8.png',
  'img/food9.png',
  'img/food10.png',
  'img/food11.png',
  'img/food12.png',
  'img/food13.png',
  'img/food14.png',
  'img/food15.png',
  'img/food16.png',
  'img/food17.png',
];

let foodImg = new Image(); 
foodImg.src = foodArray[randomizer(1, foodArray.length)]; //рандомная еда

let food = { //рандомная генерация еды
  x: Math.floor(Math.random() * cell.amount.x) * cell.size,
  y: Math.floor(Math.random() * cell.amount.y) * cell.size
};
console.log('Еда сейчас по оси X: ', food.x);
console.log('Еда сейчас по оси Y: ', food.y);

let isFoodChange = false; //указывается, если еда требует перегенерации

let snake = [];

//Первоначальные координаты змеи
snake[0] = {
  x: cell.center.x * cell.size,
  y: cell.center.y * cell.size
};

document.addEventListener('keydown', changeDirection);

function randomizer (a, b) { //a:нижняя граница диапазона, b:верхняя
  return Math.floor(
    Math.random() * (b - a + 1)
  ) + a;
}

let dir; //Направление движения
//Ф-ция кладет в переменную напр. движения в завис. от нажатой клавиши
function changeDirection(EO) { 
  EO = EO || window.event;
  EO.preventDefault();
  
  if (EO.keyCode === 37 && dir !== 'right') {
    dir = 'left';
    console.log('нажата стрелка вправо');
  } 
  else if (EO.keyCode === 38 && dir !== 'down') {
    dir = 'up';
  console.log('нажата стрелка вниз');
  } 
  else if (EO.keyCode === 39 && dir !== 'left') {
    dir = 'right';
    console.log('нажата стрелка влево');
  } 
  else if (EO.keyCode === 40 && dir !== 'up') {
    dir = 'down';
    console.log('нажата стрелка вверх');
  }
}

//Ф-ция прохождения через стены
function throughWall(snakeX, snakeY) {
  if (snakeX < 0) {
    console.log('дошла до стенки');
    snakeX = fieldSize.x - cell.size;
    console.log('прошла через стенку');
  } 
  else if (snakeX > (fieldSize.x - cell.size)) {
    console.log('дошла до стенки');
    snakeX = 0;
    console.log('прошла через стенку');
  } 
  if (snakeY < 0) {
    console.log('дошла до стенки');
    snakeY = fieldSize.y - cell.size;
    console.log('прошла через стенку');
  } 
  else if (snakeY > (fieldSize.y - cell.size)) {
    console.log('дошла до стенки');
    snakeY = 0;
    console.log('прошла через стенку');
  }

   return {
    x: snakeX, 
    y: snakeY
  };
}

function biteTail(head, snakeBody) {
  console.log('запущена ф-ция съедания хвоста');
  for(let i = 0; i < snakeBody.length; i++) {
    if (head.x === snakeBody[i].x && head.y === snakeBody[i].y ) {
      console.log('хвост съеден');
      gameover = true;
      alert("GAME OVER");
      document.location.reload();
      clearInterval(game);
    }
  }
}

function draw() {
  console.log('рисование запущено');
  context.clearRect(0, 0, fieldSize.x, fieldSize.y);

  //Если происходит ошибка при генерации еды, она ловится и генерация запускается снова.
  try {
    if (isFoodChange) {
      isFoodChange = false; //рандомная еда
      foodImg.src = foodArray[randomizer(1, foodArray.length)];
    }
    context.shadowBlur = 20;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 2;
    context.shadowColor = '#be6c6a'; 
    context.drawImage(foodImg, food.x, food.y); //рисование еды
  }
  catch (ex) {
    console.error('возникло исключение типа: ' + ex.name);
    isFoodChange = true;
    if (isFoodChange) {
      isFoodChange = false; //рандомная еда
      foodImg.src = foodArray[randomizer(1, foodArray.length)];
    }
    context.shadowBlur = 20;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 2;
    context.shadowColor = '#be6c6a'; 
    context.drawImage(foodImg, food.x, food.y); //рисование еды
  }

  let snakeX = snake[0].x; //Первоначальные координаты змеи для расчетов
  let snakeY = snake[0].y;
  
  //Движение змеи
  
  if (dir == 'left') { 
    snakeX -= cell.size;
  }
  else if (dir == 'up') {
    snakeY -= cell.size;
  }
  else if (dir == 'right') {
    snakeX += cell.size;
  }
  else if (dir == 'down') {
    snakeY += cell.size;
  }
  
  //Переменная для хрананения позиции змейки после прохождения через стену
  let afterWallPos = {};

  //Если змея достигла стены, вызывается ф-ция прохождения через стену
  if (snakeX < 0 || snakeX > (fieldSize.x - cell.size)
  || snakeY < 0 || snakeY > (fieldSize.y - cell.size)) 
  {
    console.log('было snakeX: ', snakeX, '\n было snakeY: ', snakeY);
    afterWallPos = throughWall(snakeX, snakeY);
    snakeX = afterWallPos.x;
    snakeY = afterWallPos.y;
    console.log('стало snakeX: ', snakeX, '\n стало snakeY: ', snakeY);
  }

  //Рисуем змею
  for(let i = 0; i < snake.length; i++) {
    context.beginPath();
    context.fillStyle = (i == 0) ? '#52638b' : '#7189bf';
    context.shadowBlur = 5;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 1; // #778cbd83 
    context.shadowColor = '#48577894'; 
    context.moveTo(snake[i].x + cell.quarter, snake[i].y);
    context.lineTo(snake[i].x + cell.quarter * 3, snake[i].y);
    context.lineTo(snake[i].x + cell.size, snake[i].y + cell.quarter);
    context.lineTo(snake[i].x + cell.size, snake[i].y + cell.quarter * 3);
    context.lineTo(snake[i].x + cell.quarter * 3, snake[i].y + cell.size);
    context.lineTo(snake[i].x + cell.quarter, snake[i].y + cell.size);
    context.lineTo(snake[i].x, snake[i].y + cell.quarter * 3);
    context.lineTo(snake[i].x, snake[i].y + cell.quarter);
    context.fill();
    console.log('нарисован 1 сегмент змейки');
  }

  //Как змея кушает
  if (snakeX == food.x && snakeY == food.y) {
    score++;
    scoreSpan.textContent = score;
    setTimeout(changeFood, 0);
    function changeFood() {
      isFoodChange = true;
    }
    food = { //рандомная генерация позиции еды
      x: Math.floor(Math.random() * cell.amount.x) * cell.size,
      y: Math.floor(Math.random() * cell.amount.y) * cell.size
    };
  } else {
    snake.pop(); //Удаляем последний эл-т массива змеи
  }

  //Создаем новую голову змеи
  let newHead = {
    x: snakeX,
    y: snakeY
  };
  
  biteTail(newHead, snake);
  
  //Добавляем элемент 'голова' в массив змеи
  snake.unshift(newHead); 
}

let game = setInterval(draw, 110); //запускаем таймер, который будет рисовать игру


if (gameover == true) {
  console.log('проигрыш')
  alert('Game over');
}


class Snake {
  constructor() {
    this.color = 'yellow';
    this.lgth = 200; //нач. длина хвоста змеи (width)
    this.fat = 20; //толщина змеи (heigth)
    this.speed = 4; //скорость движения змеи
    this.head = {}; //голова змеи
    this.dir = 3; //Направл-е движ. змеи: 1-влево, 2-вверх 3-вправо, 4-вниз
  }
  // animate() {
    // }
}