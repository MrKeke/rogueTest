import {
    enemyAI,
    generateRow,
    getFreeCell,
    getRandomNum,
    getRoomId,
    hookCreateElement,
    setSomething,
    toGo
} from "./utils.js";

// Глобальные значения игры для расширяемости
const globalSettings = {
    verticalCount: 24, // Количество вертикалных клеток
    horizontalCount: 40, // Количество горизонтальных клеток
    roomCountMin: 10, // Минимальное количество
    roomCountMax: 20,
    hallwaysCountMin: 5,
    hallwaysCountMax: 8,
    swordCount: 2,
    healthUpCount: 10,
    enemyCount: 10,
    enemyHP: 5,
    playerDamage: 1,
    enemyDamage: 1,
    playerHP: 10,
    enemyInterval: 1,
    healthPoisonUp: 2,
    swordBuff:1,
}


const field = Array(globalSettings.verticalCount).fill(generateRow(globalSettings.horizontalCount))

const fieldInDocument = document.querySelector('.field')

// Заливаем всю карту стеной
function fillMap() {
    let id = 0
    field.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            // размеры пришлось пофиксить под тз, вариант с 50px не отобразить; 1024 / 40; 640 / 24
            const field =
                hookCreateElement(['tile', 'tileW'],
                    [['left', `${cellIndex * 25.6}px`], ['top', `${rowIndex * 26.6}px`]],
                    id)
            id++
            fieldInDocument.appendChild(field)
        })
    })
}


// Создание комнат
function createRooms() {
    const lastId = fieldInDocument.lastChild.id
    const roomCount = getRandomNum(globalSettings.roomCountMin, globalSettings.roomCountMax)
    for (let i = 0; i < roomCount; i++) {
        const height = getRandomNum(3, 8)
        const weight = getRandomNum(3, 8)
        const startId = getRandomNum(0, lastId)
        const roomsId = getRoomId(startId, height, weight)
        setSomething(roomsId)
    }
}

// Создание коридоров
function fillHallways() {
    const hallwaysCount = getRandomNum(globalSettings.hallwaysCountMin, globalSettings.hallwaysCountMax)
    // Количество изменено под карту для большего интереса default = 3,5
    const verticalStep = Math.floor(globalSettings.horizontalCount / hallwaysCount)
    const horizontalStep = Math.floor(globalSettings.verticalCount / hallwaysCount) * 40
    const toRemoveIDs = []
    // Подсчет вертикальных ID
    for (let i = verticalStep; i < globalSettings.horizontalCount; i += verticalStep) {
        const verticalStepIDs = getRoomId(i, 1, globalSettings.verticalCount)
        toRemoveIDs.push(...verticalStepIDs)
    }
    // Посчет горизонтальных ID
    for (let i = 0; i / 40 < globalSettings.verticalCount; i += horizontalStep) {
        const horizontalStepIDs = getRoomId(i, globalSettings.horizontalCount, 1)
        toRemoveIDs.push(...horizontalStepIDs)
    }
    setSomething(toRemoveIDs)
}

// Размещение мечей и здоровья
function placeSwordAndHealth() {
    let freeCells = getFreeCell()
    for (let i = 0; i < globalSettings.swordCount; i++) {
        const swordID = freeCells[getRandomNum(0, freeCells.length)].id
        setSomething([swordID], 'tileSW')
    }
    freeCells = getFreeCell()
    for (let i = 0; i < globalSettings.healthUpCount; i++) {
        const healthID = freeCells[getRandomNum(0, freeCells.length)].id
        setSomething([healthID], 'tileHP')
    }
}

// Поставновка врагов и игрока вместе со здоровьем
function placeHeroAndEnemy() {
    const healBar = hookCreateElement(['health'], [['width', '100%']])
    let freeCells = getFreeCell()
    const heroID = freeCells[getRandomNum(0, freeCells.length)].id
    document.getElementById(heroID).append(healBar)
    setSomething([heroID], 'tileP')
    freeCells = getFreeCell()
    for (let i = 0; i < 10; i++) {
        const enemyHealBar = hookCreateElement(['health'], [['width', '100%']])
        const enemyID = freeCells[getRandomNum(0, freeCells.length)].id
        document.getElementById(enemyID).append(enemyHealBar)
        setSomething([enemyID], 'tileE')
    }
}

// Логика движений персонажа
function playerInterface() {
    document.addEventListener('keyup', ({keyCode}) => {
        toGo('player', keyCode, globalSettings)
    })
}

// Логика передвижения врагов
    const intervalCallback = () => enemyAI(globalSettings)
    const itnervalAI = setInterval(intervalCallback, globalSettings.enemyInterval * 1000)



fillMap()
createRooms()
fillHallways()
placeSwordAndHealth()
placeHeroAndEnemy()
playerInterface()
// enemyActiveAI()
