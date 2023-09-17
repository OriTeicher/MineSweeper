'use strict'

const timeEl = document.querySelector('.timer');

var seconds = 0;
var interval = null;

// update timer
function timer() {
    seconds++;
    var hours = Math.floor(seconds / 3600);
    var mins = Math.floor((seconds - (hours * 3600)) / 60);
    var sec = seconds % 60;
    if (sec < 10) {
        sec = '0' + sec;
    }
    if (mins < 10) {
        mins = '0' + mins;
    }
    if (hours < 10) {
        hours = '0' + hours;
    }
    timeEl.innerText = hours + ":" + mins + ":" + sec;
    gGame.secsPassed++
}

function startTimer() {
    gGame.secsPassed = 0;
    if (interval) {
        return;
    }
    interval = setInterval(timer, 1000); 
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    timeEl.innerText = "00:00:00"
}