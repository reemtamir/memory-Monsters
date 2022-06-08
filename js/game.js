const timer = document.getElementById('stop-watch');

var hr = 0;
var min = 0;
var sec = 0;
var stoptime = true;

function startTimer() {
  if (stoptime == true) {
    stoptime = false;
    timerCycle();
  }
}
function stopTimer() {
  if (stoptime == false) {
    stoptime = true;
  }
}

function timerCycle() {
  if (stoptime == false) {
    sec = parseInt(sec);
    min = parseInt(min);
    hr = parseInt(hr);

    sec = sec + 1;

    if (sec == 60) {
      min = min + 1;
      sec = 0;
    }
    if (min == 60) {
      hr = hr + 1;
      min = 0;
      sec = 0;
    }

    if (sec < 10 || sec == 0) {
      sec = '0' + sec;
    }
    if (min < 10 || min == 0) {
      min = '0' + min;
    }
    if (hr < 10 || hr == 0) {
      hr = '0' + hr;
    }

    timer.innerHTML = hr + ':' + min + ':' + sec;
    setTimeout('timerCycle()', 1000);
  }
}

function resetTimer() {
  timer.innerHTML = '00:00:00';
  hr = 0;
  min = 0;
  sec = 0;
  stoptime = true;
}

// Those are global variables, they stay alive and reflect the state of the game
var elPreviousCard = null;
var flippedCouplesCount = 0;
var isProcessing = false;
var start = 0;
var end = 0;
var time = 0;
var bestTime = 0;

function getStart() {
  if (!localStorage.getItem('playerName')) {
    var userInput = prompt('Enter youe name');
    var firstChar = userInput.slice(0, 1).toLocaleUpperCase();
    var others = userInput.slice(1).toLocaleLowerCase();
    userInput = firstChar + others;
    var elUserName = document.querySelector('.user-name');
    elUserName.innerText = 'Hello ' + userInput + '. Good luck!';
    localStorage.setItem('playerName', userInput);
  } else {
    var elUserName = document.querySelector('.user-name');
    elUserName.innerText =
      'Welcome back ' + localStorage.getItem('playerName') + '!';
  }
  resetGame();
}
// This is a constant that we dont change during the game (we mark those with CAPITAL letters)
var TOTAL_COUPLES_COUNT = 3;

// Load an audio file
var audioWin = new Audio('sound/win.mp3');
var audioRight = new Audio('sound/right.mp3');
var audioWrong = new Audio('sound/wrong.mp3');

// This function is called whenever the user click a card
function cardClicked(elCard) {
  if (!start) {
    start = Date.now();
    startTimer();
  }
  if (isProcessing) {
    return;
  }
  if (elCard.classList.contains('flipped')) {
    // If the user clicked an already flipped card - do nothing and return from the function
    return;
  }

  // Flip it

  elCard.classList.add('flipped');

  // This is a first card, only keep it in the global variable
  if (elPreviousCard === null) {
    elPreviousCard = elCard;
  } else {
    // get the data-card attribute's value from both cards
    var card1 = elPreviousCard.getAttribute('data-card');
    var card2 = elCard.getAttribute('data-card');

    // No match, schedule to flip them back in 1 second
    if (card1 !== card2) {
      isProcessing = true;
      setTimeout(function () {
        elCard.classList.remove('flipped');
        elPreviousCard.classList.remove('flipped');
        elPreviousCard = null;
        isProcessing = false;
      }, 1000);

      audioWrong.play();
      //WHEN I CLICK MORE THEN ONE TIME ON THE CARD, THE CLASS 'FLIPPED' IS BEEN ADD -TRY TO FIX THAT
    } else {
      // Yes! a match!

      flippedCouplesCount++;
      elPreviousCard = null;
      audioRight.play();

      // All cards flipped!
      if (TOTAL_COUPLES_COUNT === flippedCouplesCount) {
        audioWin.play();
        end = Date.now();
        time = Math.floor((end - start) / 1000);
        bestTime = Math.round(time);
        time = 0;
        stopTimer();
        var elTime = document.querySelector('.time');
        elTime.classList.add('time-when-win');
        var elGif = document.querySelector('.giphy-embed2');
        elGif.style.visibility = 'visible';

        setTimeout(function () {
          elTime.classList.remove('time-when-win');
          elGif.style.visibility = 'hidden';
        }, 5000);

        // if (localStorage.getItem('time') === null) {
        //   localStorage.setItem('time', bestTime);
        // }
        if (
          localStorage.getItem('time') === null ||
          bestTime < Number(localStorage.getItem('time'))
        ) {
          localStorage.setItem('time', bestTime);
          var elTime = document.querySelector('.time');
          elTime.innerText = ` Your best time is ${
            Number(localStorage.getItem('time')) + 1
          } seconds 🏆`;
        }

        setTimeout(function () {
          var resetGame = document.querySelector('#reset-btn');
          resetGame.style.display = 'block';
        }, 3000);
      }
    }
  }
}

function resetGame() {
  var resetGame = document.querySelector('#reset-btn');
  resetGame.style.display = 'none';
  var allCards = document.querySelectorAll(' div');
  for (var i = 0; i < allCards.length; i++) {
    allCards[i].classList.remove('flipped');
  }
  elPreviousCard = null;
  flippedCouplesCount = 0;
  isProcessing = false;
  start = 0;
  end = 0;
  dealCards();
  resetTimer();
}

// if (!userName) {
//   changeUser();
// }

function changeUser() {
  var elTime = document.querySelector('.time');
  elTime.innerText = 'TIME';
  localStorage.clear();
  getStart();
}

function dealCards() {
  var elCards = document.querySelector('.deal-cards');
  for (var i = elCards.children.length; i >= 0; i--) {
    elCards.appendChild(elCards.children[(Math.random() * i) | 0]);
  }
}
