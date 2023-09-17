'use strict'

var gMegaHintsPoss = []

function renderHints() {
    var elHintBtn = document.querySelector('.mine-hint span');
    elHintBtn.innerHTML =  `${HINT} <span style="color: #fff;">${gLevel.HINTS}</span>`;
    if (gLevel.HINTS === 0) elHintBtn.innerText = '🚫'
}

function getHint() {
    if (gIsFirstClick || !gGame.isOn) {
        displayModal();
        return;
    }
    if (gLevel.HINTS === 0) return
    var mine = getHintMine();
    var elMine = document.querySelector(`.cell-${mine.pos.i}-${mine.pos.j}`)
    gLevel.HINTS--;
    renderHints()
    displayHint(elMine);
}

function displayHint(elMine) {
    gIsProcessing = true;
    elMine.classList.add('hint');
    setTimeout(() => {
        elMine.classList.remove('hint');
        gIsProcessing = false
    }, 2000);
}

function getHintMine() {
    var randIdx = getRandomIntInclusive(0, gMines.length - 1);
    // if its a marked spot or a mine, keep searching for an index
    while (gMines[randIdx].isMarked || gMines[randIdx].isShown) {
        randIdx = getRandomIntInclusive(0, gMines.length - 1);
    }
    return gMines[randIdx]
}


function getSafeClick() {
    if (gLevel.SAFE_CLICKS === 0) return
    var safePos = getSafeClickPos();
    var elSafeClick = document.querySelector(`.cell-${safePos.i}-${safePos.j}`)
    gLevel.SAFE_CLICKS--;
    renderSafeClicks();
    displaySafeClick(elSafeClick);
}

function displaySafeClick(elSafeClick) {
    gIsProcessing = true
    elSafeClick.classList.add('safe');
    setTimeout(() => {
        elSafeClick.classList.remove('safe');
        gIsProcessing = false
    }, 2000);
}

function getSafeClickPos() {

    var randI = getRandomIntInclusive(0, gBoard.length - 1)
    var randJ = getRandomIntInclusive(0, gBoard.length - 1)
    while (gBoard[randI][randJ].isMine || gBoard[randI][randJ].isShown) {
        var randI = getRandomIntInclusive(0, gBoard.length - 1);
        var randJ = getRandomIntInclusive(0, gBoard.length - 1);
    }
    return { i: randI, j: randJ };
}

function renderSafeClicks() {
    var elSafeClick = document.querySelector('.safe-click span');
    elSafeClick.innerHTML = `${SAFE_CLICK} <span style="color: #fff;">${gLevel.SAFE_CLICKS}</span>`;
    if (gLevel.SAFE_CLICKS === 0) elSafeClick.innerText = '🚫'
}

function getMegaHint() {
    gIsMegaHint = true;
}

function setMegaHintPos(i, j) {
    gMegaHintsPoss.push({ i: i, j: j });
    if (gMegaHintsPoss.length === 2) {
        displayMegaHint()
        gIsMegaHint = false
        return;
    }
}

function displayMegaHint() {
    for (var i = gMegaHintsPoss[0].i; i <= gMegaHintsPoss[1].i; i++) {
        for (var j = gMegaHintsPoss[0].j; j <= gMegaHintsPoss[1].j; j++) {
            var cell = gBoard[i][j]
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            if (cell.isMine) elCell.classList.add('mine')
            if (!cell.isMine) elCell.classList.add('mega-hint')

        }
    }

    setTimeout(() => {
        for (var i = gMegaHintsPoss[0].i; i <= gMegaHintsPoss[1].i; i++) {
            for (var j = gMegaHintsPoss[0].j; j <= gMegaHintsPoss[1].j; j++) {
                var cell = gBoard[i][j]
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                if (cell.isMine && !cell.isShown) elCell.classList.remove('mine')
                if (!cell.isMine) elCell.classList.remove('mega-hint');
            }
        }
        gMegaHintsPoss = []
    }, 3000);



}
