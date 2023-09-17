'use strict'

const LIVES = 3
const LOST_IMG = '<img src="img/game-over.png">\n'
const START_IMG = '<img src="img/game-start.png">\n'
const WIN_IMG = '<img src="img/game-win.png">\n'
const MINE_IMG = '<img src="img/mine.png">\n'
const LIFE = '🔴'
const DEATH = '💀'
const SAFE_CLICK = '<i class="fa-solid fa-square-check" style="color: lightgreen;"></i>'
const EMPTY = ''
const HINT = '<i class="fa-solid fa-lightbulb" style="color: yellow;"></i>'
const MARK = '🤔'
const ALIEN = '👽'
const MOON = '🌙'

// Global Variables
var gLevel = getLevel();
var gGame
var gBoard
var gBoardSize
var gMines = []
var gIsFirstClick
var gBestTime = Infinity
var gCurrLevel = 'easy'
var gIsProcessing = false;
var gBoards // contains all moves
var gIsMegaHint = false
var gIsMineSet = false;
var gLives = []
var gIsBoardManual = false
var gCurrTime

// when page load start the game 
function onInit() {
    gIsFirstClick = true;
    gGame = getGameState()
    gBoard = buildBoard()
    gBoards = [];
    renderBoard(gBoard)
    renderHints();
    renderSafeClicks();
    updateScore()
    renderLife()
    createScoreBoard()
    renderScoreBoard();
    var copyBoard = copyCurrBoard(gBoard)
    gBoards.push(copyBoard);
    gLives.push(gLevel.LIVES);
}


// returns the board size and how many mines to set in the board
function getLevel() {
    var level = {
        SIZE: 7, // change to radio button pick
        MINES: 8,
        HINTS: 3,
        LIVES: 3,
        SAFE_CLICKS: 3,
    }
    return level
}

// returns the current gameState
function getGameState() {
    var gameState = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    }
    return gameState
}

// builds the game data model board 
function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = getCell(i, j);
        }
    }
    gBoardSize = gLevel.SIZE * gLevel.SIZE;
    return board
}


function getCell(cellI, cellJ) {
    var cell = {
        pos: {
            i: cellI,
            j: cellJ,
        },
        minesAroundCount: 0,
        isShown: false,
        isClicked: false,
        isMine: false,
        isMarked: false,
    }
    return cell
}


// renders the board in DOM
function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < gBoard.length; j++) {
            var cellClass = getClassName(i, j) + ' '
            strHTML += `<td class="cell ${cellClass}"  
            oncontextmenu="onCellMarked(this,${i},${j})" onclick="onCellClicked(this,${i},${j})">`
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board')
    const elResetBtn = document.querySelector('.smile')
    elResetBtn.innerHTML = START_IMG
    elBoard.innerHTML = strHTML
}


function renderPicture(strHTML) {
    const elResetBtn = document.querySelector('.smile')
    elResetBtn.innerHTML = strHTML
}

// return cell's position class 
function getClassName(i, j) {
    var cellClass = `cell-${i}-${j}`
    return cellClass
}


// when a cell is clicked function 
function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    currCell.isClicked = true
    if (gIsMegaHint) {
        setMegaHintPos(i, j);
        return;
    }
    if (gIsMineSet) {
        getWantedMineSpot(i, j)
        return;
    }
    if (gIsProcessing) return;
    if (gIsFirstClick) handleFirstClick(elCell, currCell)
    if (currCell.isMarked) return;
    if (currCell.isShown || !gGame.isOn) return;
    if (!currCell.isMine || currCell.isBlown) onEmptyClicked(elCell, currCell);
    else onMineClicked(currCell, i, j);
    updateScore();
    checkGameOver();
    var currBoardCopy = copyCurrBoard();
    gBoards.push(currBoardCopy)
    gLives.push(gLevel.LIVES);
}

// handles the game first click
function handleFirstClick(elCell, currCell) {
    gIsFirstClick = false;
    gGame.isOn = true;
    startTimer();
    // if board was not set, set random mines
    if (!gIsBoardManual) setBoardMines(currCell);
    onEmptyClicked(elCell, currCell);
    updateScore();
    var currBoardCopy = copyCurrBoard();
    gBoards.push(currBoardCopy)
    checkGameOver();
}

// when the user clicks on a regular cell expand his non mine negs
function onEmptyClicked(elCell, cell) {
    if (cell.isMine) {
        onMineClicked(cell)
        return;
    }
    cell.isShown = true
    elCell.classList.add('selected');
    expandShownAll(gBoard, cell);
}


function expandShownAll(board, cell) {
    for (var i = cell.pos.i - 1; i <= cell.pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cell.pos.j - 1; j <= cell.pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue
            var currCell = board[i][j]
            var currElCell = document.querySelector(`.cell-${currCell.pos.i}-${currCell.pos.j}`);
            if (currCell.isMine || currCell.isMarked) continue
            if (!currCell.isShown && currCell.minesAroundCount > 0 && !currCell.isMine) {
                currCell.isShown = true
                currElCell.classList.add('selected');
                currElCell.innerText = currCell.minesAroundCount;
                gGame.shownCount++;
            }
            else if (currCell.minesAroundCount === 0 && !currCell.isShown) {
                currCell.isShown = true
                currElCell.classList.add('selected');
                gGame.shownCount++;
                expandShownAll(board, currCell);
            }
        }
    }
}


// called when a cell is right clicked, adds a mark to the cell
function onCellMarked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (cell.isMine && cell.isShown) return;
    if (elCell.classList.contains('selected') || !gGame.isOn) return
    document.addEventListener('contextmenu', (event) => { event.preventDefault(); })
    elCell.classList.toggle('marked')
    checkMarked()
    renderMark(elCell, cell)
}

function renderMark(elCell, cell) {
    if (elCell.classList.contains('marked')) {
        cell.isMarked = true;
        elCell.innerText = MARK
    }
    else {
        cell.isMarked = false
        elCell.innerText = ''
    }
}

// sets the current marked counter
function checkMarked() {
    var elMarked = document.querySelectorAll('.marked');
    gGame.markedCount = 0;
    for (var i = 0; i < elMarked.length; i++) {
        gGame.markedCount++
    }
}

// if all non-mine spots are shown its a win  
function checkGameOver() {
    if (gBoardSize - gMines.length === gGame.shownCount) {
        gGame.isOn = false;
        renderPicture(WIN_IMG)
        stopTimer()
        setGameTime();
        createScoreBoard();
        renderScoreBoard();
    }
    else if (gLevel.LIVES === 0) {
        gGame.isOn = false
        DisplayAllMines();
        renderPicture(LOST_IMG)
        stopTimer()
    }
}

// resets the board for a new game
function cleanBoard() {
    var elMineTds = document.querySelectorAll('.mine')
    for (var i = 0; i < elMineTds.length; i++) {
        elMineTds[i].classList.remove('mine')
        gGame.shownCount--;
    }
    var elSelectedTds = document.querySelectorAll('.selected')
    for (var i = 0; i < elSelectedTds.length; i++) {
        elSelectedTds[i].classList.remove('selected')
        gGame.shownCount--;
    }
    updateScore()
}


function renderLife() {
    var elLives = document.querySelector('.lives span')
    elLives.innerText = LIFE.repeat(gLevel.LIVES)
    if (gLevel.LIVES === 0) elLives.innerText = DEATH
}

function updateScore() {
    gGame.shownCount = 0
    var scoreReduction = 0
    var elSelected = document.querySelectorAll('.selected')
    var elScore = document.querySelector('.score span')
    for (var i = 0; i < elSelected.length; i++) {
        // each mine will reduce one point
        if (elSelected[i].classList.contains('mine')) {
            scoreReduction++
            continue;
        }
        gGame.shownCount++
    }
    elScore.innerText = ' ' + (gGame.shownCount - scoreReduction)
}

function resetLevel() {
    switch (gCurrLevel) {
        case 'easy':
            gLevel.SIZE = 7
            gLevel.MINES = 8
            gLevel.HINTS = 3
            gLevel.LIVES = 3
            gLevel.SAFE_CLICKS = 3
            break
        case 'medium':
            gLevel.SIZE = 9
            gLevel.MINES = 24
            gLevel.HINTS = 5
            gLevel.LIVES = 4
            gLevel.SAFE_CLICKS = 4
            break
        case 'hard':
            gLevel.SIZE = 12
            gLevel.MINES = 40
            gLevel.HINTS = 7
            gLevel.LIVES = 5
            gLevel.SAFE_CLICKS = 5
            break;
    }
    gIsBoardManual = false;
    gIsFirstClick = true;
    gIsExterminateUsed = false;
}


function resetGame() {
    resetLevel()
    cleanBoard()
    stopTimer()
    resetTimer()
    onInit()
}

function setDifficulty(elDiffBtn) {
    gCurrLevel = elDiffBtn.value;
    resetLevel();
    resetGame();
}

function setDarkMode() {
    var elBody = document.querySelector('body');
    elBody.classList.toggle('dark-mode');
}

function undoMove() {
    if (gBoards.length === 1) return;
    gBoards.pop()
    gLives.pop()
    setPrevBoard(gBoards[gBoards.length - 1]);
    if (gLives.length === 0) return
    gLevel.LIVES = gLives[gLives.length - 1];
    updateScore()
    renderLife()
}

function setPrevBoard(prevBoard) {
    cleanBoard();
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = prevBoard[i][j];
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`);
            if (currCell.isShown) elCurrCell.classList.add('selected')
            if (!currCell.isShown) {
                elCurrCell.innerText = EMPTY
                gBoard[i][j].isShown = false
            }
            if (currCell.isShown && currCell.isMine) elCurrCell.classList.add('mine')
            if (currCell.isShown && currCell.minesAroundCount > 0 && !gBoard[i][j].isClicked) elCurrCell.innerText = currCell.minesAroundCount
            if (currCell.isShown && currCell.minesAroundCount === 0) elCurrCell.innerText = EMPTY
        }
    }

}

function copyCurrBoard() {
    var res = [];
    for (var i = 0; i < gBoard.length; i++) {
        res[i] = []
        for (var j = 0; j < gBoard.length; j++) {
            var copyCell = getCellCopy(gBoard[i][j])
            res[i][j] = copyCell;
        }
    }
    return res;
}

function getCellCopy(cell) {
    var res = {
        pos: {
            i: cell.pos.i,
            j: cell.pos.j,
        },
        minesAroundCount: cell.minesAroundCount,
        isShown: cell.isShown,
        isMine: cell.isMine,
        isMarked: cell.isMarked,
    }
    return res;
}

function displayModal() {
    var elModal = document.querySelector('.modal');
    var elMsg = document.querySelector('.modal h2')
    elModal.style.display = 'none';
    elMsg.innerText = 'Cant Use at This Stage of The Game 😔';
    setTimeout(() => {
        elModal.style.display = 'none';
    }, 2000);
}