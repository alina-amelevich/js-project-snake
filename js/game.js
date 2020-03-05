'use strict'

//Получаем кнопки изменения направления из svg 
//и кладем их в переменные
const upSvg = document.querySelector('#up');
const rightSvg = document.querySelector('#right');
const downSvg = document.querySelector('#down');
const leftSvg = document.querySelector('#left');


const buttStart = document.querySelector('#butt_start');
buttStart.addEventListener('click', newGame);

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

let isGameOver = false;
const scoreSpan = document.querySelector('#score_value');
let score = 0; //счет

// let reachWall = {}; //инфа до какой стены дошла змея

//еда
const foodArray = [ //массив со всеми картинками еды
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
foodImg.src = foodArray[randomizer(0, foodArray.length - 1)]; //рандомная еда

let food = { //рандомная генерация еды
  x: Math.floor(Math.random() * cell.amount.x) * cell.size,
  y: Math.floor(Math.random() * cell.amount.y) * cell.size
};
// console.log('Еда сейчас по оси X: ', food.x);
// console.log('Еда сейчас по оси Y: ', food.y);

let isFoodChange = false; //указывается, если еда требует перегенерации

let snake = [];
let segmentCount = 16; //


//Скорость змейки (на столько пикселей она сдвигается за один кадр)
const speed = cell.size / 6;

//Первоначальные координаты змеи
snake[0] = {
  x: cell.center.x * cell.size,
  y: cell.center.y * cell.size
};

// let partyMode = false; 
//режим вечеринки
const partyCheckBox = document.querySelector('#party-checkbox');

// function party() {
//   partyMode = true;
// }

let isAudioinit = false;
//Создаем объекты Audio
const audioGameOver = new Audio('sound/gameover.mp3');
const audioEat = new Audio('sound/eat.mp3');
const audioBump = new Audio('sound/pop.mp3');
function soundInit() {
  isAudioinit = true;
  audioGameOver.play();
  audioGameOver.pause(); 
  audioEat.play();
  audioEat.pause(); 
  audioBump.play();
  audioBump.pause(); 
}

function soundEat() {
  audioEat.currentTime=0.5;
  audioEat.play();
}
function soundBump() {
  audioBump.currentTime=0.5;
  audioBump.play();
}
function soundGameOver() {
  audioGameOver.currentTime=0;
  audioGameOver.play();
}

function randomizer (a, b) { //a:нижняя граница диапазона, b:верхняя
  return Math.floor(
    Math.random() * (b - a + 1)
    ) + a;
  }

  function randomColor() {
    return '#' + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16));
  }

  let dir; //Направление движения
  //когда кликнута svg-стрелка вверх
function mouseDirUp(EO) {
  EO = EO || window.event;
  EO.preventDefault();
  if (dir != 'down') {
    nextDir = 'up';
  }
  // console.log('EO.target: ', EO.target);
  return;
}
//когда кликнута svg-стрелка вправо
function mouseDirRight(EO) {
  EO = EO || window.event;
  EO.preventDefault();
  if (dir != 'left') {
    nextDir = 'right';
  }
  // console.log('EO.target: ', EO.target);
  return;
}
//когда кликнута svg-стрелка вниз
function mouseDirDown(EO) {
  EO = EO || window.event;
  EO.preventDefault();
  if (dir != 'up') {
    nextDir = 'down';
  }
  // console.log('EO.target: ', EO.target);
  return;
}
//когда кликнута svg-стрелка влево
function mouseDirLeft(EO) {
  EO = EO || window.event;
  EO.preventDefault();
  if (dir != 'right') {
    nextDir = 'left';
  }
  // console.log('EO.target: ', EO.target);
  return;
  
}

let nextDir;
  //Ф-ция кладет в переменную напр. движения в завис. от нажатой клавиши
  function changeDirection(EO) { 
    EO = EO || window.event;
    // EO.preventDefault();
    if (isAudioinit === false) {
      soundInit();
    }
  
    if (EO.keyCode === 37 && dir !== 'right') {
      nextDir = 'left';
      console.log('нажата стрелка вправо');
    } 
    else if (EO.keyCode === 38 && dir !== 'down') {
      nextDir = 'up';
      console.log('нажата стрелка вниз');
    } 
    else if (EO.keyCode === 39 && dir !== 'left') {
      nextDir = 'right';
      console.log('нажата стрелка влево');
    } 
    else if (EO.keyCode === 40 && dir !== 'up') {
      nextDir = 'down';
      console.log('нажата стрелка вверх');
    }
  }
  
  //Ф-ция прохождения через стены
  function throughWall(snakeX, snakeY) {
    if (snakeX < 0) {
      console.log('дошла до стенки');
      snakeX = fieldSize.x - (cell.size);
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

  //Рисование змеи
  function drawSnake() {
    for (let i = snake.length -1; i >= 0; i--) {
      context.beginPath();
      if (partyCheckBox.checked) {
        context.fillStyle = (i == 0) ? '#52638b' : randomColor();
      } else {
        context.fillStyle = (i == 0) ? '#52638b' : '#7189bf';
      }
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0; 
      context.arc(snake[i].x + cell.quarter * 2, snake[i].y + cell.quarter * 2, cell.quarter * 2, 0, Math.PI*2, false);
      context.fill();
      // console.log('нарисован 1 сегмент змейки');
    }
  }

  document.addEventListener('keydown', changeDirection);
  upSvg.addEventListener('click', mouseDirUp);
  rightSvg.addEventListener('click', mouseDirRight);
  downSvg.addEventListener('click', mouseDirDown);
  leftSvg.addEventListener('click', mouseDirLeft);

  function newGame() {
    isGameOver = false;
    document.location.reload();
  }
// Проигрыш
function gameOver() {
  context.clearRect(0, 0, fieldSize.x, fieldSize.y);
  // document.location.reload();
  isGameOver = true;
  //if (score > ..)
  showHiddenRecord();
  //else showHiddenLose() прописать ф-цию и сделать dom-елемент
}

//Показывает текст и кнопки после game over
function showHiddenRecord() {
  const recordText = document.querySelector('.hidden');
  recordText.style.display = "block";
  const finalScore = document.querySelector('#final_score');
  finalScore.textContent = score;
  soundGameOver();
}


function draw() {
  // console.log('рисование запущено');
  context.clearRect(0, 0, fieldSize.x, fieldSize.y);


  //Если происходит ошибка при генерации еды, она ловится и генерация запускается снова.
  try {
    if (isFoodChange) {
      isFoodChange = false; //рандомная еда
      foodImg.src = foodArray[randomizer(0, foodArray.length - 1)];
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
      isFoodChange = false;
      foodImg.src = foodArray[randomizer(0, foodArray.length - 1)];
    }
    context.shadowBlur = 20;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 2;
    context.shadowColor = '#be6c6a'; 
    context.drawImage(foodImg, food.x, food.y);
  }

  let snakeX = snake[0].x; //Первоначальные координаты змеи для расчетов
  let snakeY = snake[0].y;
  
  //Движение змеи
  if (snakeX % cell.size === 0 && (nextDir == 'up' || nextDir == 'down')) {
    dir = nextDir;
    nextDir = '';
  } else if (snakeY % cell.size === 0 && (nextDir == 'right' || nextDir == 'left')) {
    dir = nextDir;
    nextDir = '';
  }


  if (dir == 'left') { 
    snakeX -= speed;
  }
  else if (dir == 'up') {
    snakeY -= speed;
  }
  else if (dir == 'right') {
    snakeX += speed;
  }
  else if (dir == 'down') {
    snakeY += speed;
  }
  
  //Переменная для хрананения позиции змейки после прохождения через стену
  let afterWallPos = {};

  //Если змея достигла стены, вызывается ф-ция прохождения через стену
  if (snakeX < 0 || snakeX > (fieldSize.x - cell.size)
  || snakeY < 0 || snakeY > (fieldSize.y - cell.size)) 
  {
    // console.log('было snakeX: ', snakeX, '\n было snakeY: ', snakeY);
    afterWallPos = throughWall(snakeX, snakeY);
    snakeX = afterWallPos.x;
    snakeY = afterWallPos.y;
    // console.log('стало snakeX: ', snakeX, '\n стало snakeY: ', snakeY);
  }

  //Запуск рисования змеи
  drawSnake();

  //Как змея кушает
  if (snakeX == food.x && snakeY == food.y) {
    score++;
    soundEat();
    scoreSpan.textContent = score;
    setTimeout(changeFood, 0);
    function changeFood() {
      isFoodChange = true;
    }
    food = { //рандомная генерация позиции еды
      x: Math.floor(Math.random() * cell.amount.x) * cell.size,
      y: Math.floor(Math.random() * cell.amount.y) * cell.size
    };
    segmentCount += 8;
  } else if (!dir || snake.length > segmentCount) {
    snake.pop(); //Удаляем последний эл-т массива змеи
  }

  //Создаем новую голову змеи
  let newHead = {
    x: snakeX,
    y: snakeY
  };
  
    for(let i = 0; i < snake.length; i++) {
      if (newHead.x === snake[i].x && newHead.y === snake[i].y ) {
        // console.log('хвост съеден');
        setTimeout(gameOver, 100);
      }
    }
  
  //Добавляем элемент 'голова' в массив змеи
  snake.unshift(newHead); 

  if (!isGameOver) {
    requestAnimationFrame(draw);
  }
}

requestAnimationFrame(draw); //запускаем таймер, который будет рисовать игру

//Вывлывающиее правила
const rules = document.querySelector('#rules')
let isRulesShow = false;
function showRules() {
  if (!isRulesShow) {
    rules.style.visibility = 'visible';
    rules.style.height = '532px';
    isRulesShow = true;
    return;
  }
  if (isRulesShow) {
    rules.style.visibility = 'hidden';
    rules.style.height = '0px';
    isRulesShow = false;
    return;
  }

}