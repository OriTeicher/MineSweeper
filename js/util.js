'use strict'

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min) // The maximum is inclusive and the minimum is inclusive
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location.i, location.j)
    var elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function toggleErrorModal() {
    var elModal = document.querySelector('.error-modal')
    console.log('elModal', elModal)
    elModal.classList.toggle('show')
    elModal.classList.toggle('hide')
    setTimeout(() => {
        elModal.classList.toggle('show')
        elModal.classList.toggle('hide')
    }, 1100)
}

function openScoreboardModal() {
    var elModal = document.querySelector('.score-modal')
    elModal.classList.add('show')
    elModal.classList.remove('hide')
}

function closeScoreboardModal() {
    var elModal = document.querySelector('.score-modal')
    elModal.classList.remove('show')
    elModal.classList.add('hide')

}


