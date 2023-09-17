'use strict'

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location.i, location.j)
    var elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

