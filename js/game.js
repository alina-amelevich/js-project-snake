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

const cell = {
  size: 32, //размер ячейки
  amount: { //кол-во ячеек
    x: fieldSize.x / 32,
    y: fieldSize.y / 32
  },
  center: { // центральная ячейка на поле, округл в меньшую сторону
    x: Math.floor(fieldSize.x / 2 / 32),
    y: Math.floor(fieldSize.y / 2 / 32)
  }
};
console.log('Кол-во ячеек: ', cell.amount.x, cell.amount.y);
console.log('Центральная ячейка: ', cell.center.x, cell.center.y);

const scoreSpan = document.querySelector('#score_value');
let score = 0; //счет

let reachWall = {}; //инфа до какой стены дошла змея

const foodImg = new Image(); //еда
foodImg.src = 'img/food1.png';
let food = { //рандомная генерация еды
  x: Math.floor(Math.random() * cell.amount.x) * cell.size,
  y: Math.floor(Math.random() * cell.amount.y) * cell.size
};
console.log('Еда сейчас по оси X: ', food.x);
console.log('Еда сейчас по оси Y: ', food.y);

let snake = [];

//Первоначальные координаты змеи
snake[0] = {
  x: cell.center.x * cell.size,
  y: cell.center.y * cell.size
};

document.addEventListener('keydown', changeDirection);

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
      clearInterval(game);
    }
  }
}

function draw() {
  console.log('рисование запущено');
  context.clearRect(0, 0, fieldSize.x, fieldSize.y);
  context.drawImage(foodImg, food.x, food.y);

  let snakeX = snake[0].x; //Первоначальные координаты змеи для расчетов
  let snakeY = snake[0].y;
  
  
  //Движение змеи
  if (dir == 'left') { 
    snakeX -= cell.size;
  }
  if (dir == 'up') {
    snakeY -= cell.size;
  }
  if (dir == 'right') {
    snakeX += cell.size;
  }
  if (dir == 'down') {
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
    context.fillStyle = (i == 0) ? 'darkgreen' : 'yellow';
    context.strokeStyle = (i == 0) ? 'red' : 'pink'
    context.fillRect(snake[i].x, snake[i].y, cell.size, cell.size);
    context.strokeRect(snake[i].x, snake[i].y, cell.size, cell.size);
    console.log('нарисован 1 квадратик змейки');
  }

  //Как змея кушает
  if (snakeX == food.x && snakeY == food.y) {
    score++;
    scoreSpan.textContent = score;
    food = { //рандомная генерация еды
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