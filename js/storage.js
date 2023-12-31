'use strict'

const MINE_SWEEPER_DB = 'MinesweeperDB'

var gDemoData = [
    { name: "Player1", score: 30 },
    { name: "Player2", score: 45 },
    { name: "Player3", score: 25 }
]

var gPromptInterval
var gScores = []

// sets the best game time on screen and updates it in storage.
function setGameTime(name) {
    var elBestTime = document.querySelector('.best-time span')
    var bestTime = Math.min(gBestTime, gGame.secsPassed)
    gBestTime = bestTime
    setLocalStorage(MINE_SWEEPER_DB, (name.length > 8) ? name.slice(0, 8) + '..' : name, gGame.secsPassed)
    elBestTime.innerText = ' ' + bestTime + 's'
}

// enters the score to local storage
function setLocalStorage(storageName, name, score) {
    var data = JSON.parse(localStorage.getItem(storageName)) || []
    data.push({ name: name, score: score })
    localStorage.setItem(storageName, JSON.stringify(data))
}

function createScoreBoard() {
    gScores = JSON.parse(localStorage.getItem(MINE_SWEEPER_DB)) || []
}

function renderScoreBoard() {
    var strHTML = ''
    gScores.sort((a, b) => a.score - b.score)
    for (var i = 0; i < gScores.length; i++) {
        if (i === gScores.length - 1) strHTML += "<tr class='last-score'></tr>"
        else strHTML += '<tr>\n'
        for (var j = 0; j < 1; j++) {
            strHTML += `<td class="scoreboard-pos ${j === 0 ? 'gold' : j === 1 ? 'silver' : j === 2 ? 'bronze' : ''}">${i + 1}</td><td class="scoreboard-cell name">${gScores[i].name}\n</td>
            <td class="scoreboard-cell time">${gScores[i].score}s</td>\n`
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }

    var elScoreBoard = document.querySelector('.scoreboard-table')
    elScoreBoard.innerHTML = strHTML
}


function setDemoData() {
    if (!localStorage.getItem(MINE_SWEEPER_DB)) {
        var demoData = [
            { name: "Tomer", score: 35 },
            { name: "Bruno G.", score: 124 },
            { name: "Messi", score: 102 },
            { name: "Ronaldo", score: 57 },
            { name: "Harry", score: 66 },
        ];
        localStorage.setItem(MINE_SWEEPER_DB, JSON.stringify(demoData))
    }
    createScoreBoard()
}

function onSubmitScore(event) {
    event.preventDefault();
    var nameInput = document.querySelector('.name-input');
    var playerName = nameInput.value;
    if (playerName.trim() === "") {
        alert("Please enter a name.");
        return;
    }
    setGameTime(playerName);
    nameInput.value = "";
    createScoreBoard();
    renderScoreBoard();
    closeScoreboardModal()
}