function getRandomNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


const generateRow = (horizontalCount) => {
    return Array(horizontalCount).fill(getRandomNum(0))
}

const hookCreateElement = (classList, customStyle, id = '') => {
    const customElement = document.createElement('div')
    customElement.classList.add(...classList)
    if (id.length !== 0) {
        customElement.id = id
    }
    customStyle.forEach(([style, key]) => {
        customElement.style[style] = key
    })
    return customElement
}
//Дает айдишники начиная со стартового на основе длинны и высоты, отдает айди 'прямоугольника'
const getRoomId = (startId, height, weight) => {
    const weightIds = []
    for (let i = 0; i < weight; i++) {
        weightIds.push(startId + i * 40)
    }
    const heightIds = weightIds.flatMap((id) => {
        const heightRowIds = []
        for (let i = 0; i < height; i++) {
            heightRowIds.push(id + i)
        }
        return heightRowIds
    })

    return [...heightIds]
}
// Изменяет существующий массив айдишников , а так же всегда удаляет стенку с выбранных клеток
const setSomething = (roomsId, set = '', remove = '') => {
    roomsId.forEach((id) => {
        const elementToChange = document.getElementById(`${id}`)
        if (elementToChange) {
            elementToChange.classList.remove('tileW')
        }
        if (set.length !== 0) {
            elementToChange.classList.add(set)
        }
        if (remove.length !== 0) {
            elementToChange.classList.remove(remove)
        }
    })
}
// Возвращает массив незанятых клеток
const getFreeCell = () => {
    const nodeList = document.querySelectorAll('.tile')
    return Array.prototype.filter.call(nodeList, (list) => list.classList.length === 1)
}
// Возвращает игроков и врагов вокруг игрока в форме крестика
const getNearbyObj = (id) => {
    const nearbyObj = [1, -1, 40, -40].map((e) => {
        try {
            const nearObj = document.getElementById(id + e)
            if (nearObj.classList.contains('tileE')) {
                return ['tileE', id + e]
            } else if (nearObj.classList.contains('tileP')) {
                return ['tileP', id + e]
            }
        } catch (e) {
            return undefined
        }
    })
    return nearbyObj.filter((e) => e)
}

const getPlayerID = () => Number(document.querySelector('.tileP').id)
const getEnemyID = () => document.querySelectorAll('.tileE')

// Самая сложная логика, делает шаг и высчитывает остальные действия в зависимости от типа player || enemy
const doStep = (oldID, newID, globalSettings, type = 'player') => {
    if (type === 'player') {
        setSomething([oldID], '', 'tileP') // Удаляет игрока с прошлой клетки
        const healthBar = document.getElementById(oldID).firstChild //Сохраняет его div hp для дальнейшей вставки
        const hpNow = Number(healthBar.style.width.split('%')[0]) // Конктретно здоровье
        const nearEnemy = getNearbyObj(newID).filter(([key]) => key === 'tileE') // Ближайщие враги
        const nextElementClasses = document.getElementById(newID).classList // Элемент куда передвигается игрок
        document.getElementById(oldID).firstChild.remove()
        setSomething([newID], 'tileP')
        if(nextElementClasses.contains('tileHP') && hpNow !== 100){ // Проверка полное хп
            nextElementClasses.remove('tileHP')
            const newHP = hpNow + globalSettings.healthPoisonUp > 100 ? 100 : hpNow + globalSettings.healthPoisonUp * 10 // Проверяет чтобы не было более 100 % хп
            healthBar.style.width = `${newHP}%`
        }
        if(nextElementClasses.contains('tileSW')){
            nextElementClasses.remove('tileSW')
            globalSettings.playerDamage += globalSettings.swordBuff
        }
        if (nearEnemy.length !== 0) {
            const enemyDamageInPercent = globalSettings.enemyDamage / globalSettings.playerHP * 100
            const newHP = hpNow - enemyDamageInPercent * nearEnemy.length
            healthBar.style.width = `${newHP}%`
            if (newHP <= 0) {
                document.getElementById(newID).classList.remove('tileP') // Убивает врага
            }
        }

        document.getElementById(newID).appendChild(healthBar)
    } else if('enemy') {
        setSomething([oldID], '', 'tileE')
        const healthBar = document.getElementById(oldID).firstChild
        document.getElementById(oldID).firstChild.remove()
        setSomething([newID], 'tileE')
        const nearEnemy = getNearbyObj(newID).filter(([key]) => key === 'tileP')
        if (nearEnemy.length !== 0) {
            console.log('attack')
            const player = document.getElementById(`${getPlayerID()}`)

            const hpNow = Number(player.firstChild.style.width.split('%')[0])
            const enemyDamageInPercent = globalSettings.enemyDamage / globalSettings.playerHP * 100
            const newHP = hpNow - enemyDamageInPercent * nearEnemy.length
            healthBar.style.width = `${newHP}%`
            if (newHP <= 0) {
                document.getElementById(getPlayerID()).classList.remove('tileP') // Убивает игрока
            }
        }

        document.getElementById(newID).appendChild(healthBar)
    }

}

const checkToGo = (oldID, newID, {horizontalCount}) => {
    const status = []
    if (newID - oldID === 1) {
        status.push(!(newID % horizontalCount === 0))
    } else if (newID - oldID === -1) {
        status.push(!(newID % horizontalCount === 39))
    } else {
        status.push(true)
    }

    try {
        status.push(!document.getElementById(newID).classList.contains('tileW') && !document.getElementById(newID).classList.contains('tileE'))
    } catch (e) {
        status.push(false)
    }
    return status[0] && status[1]
}


const toGo = (who, key = 'default', globalSettings) => {
    if (who === "player") {

        const playerState = {
            id: getPlayerID(),
            newID: null,
            status: null
        }

        switch (key) {
            case 87:
                playerState.newID = playerState.id - globalSettings.horizontalCount
                if (checkToGo(playerState.id, playerState.newID, globalSettings)) {
                    doStep(playerState.id, playerState.newID, globalSettings)
                }
                break
            case 68:
                playerState.newID = playerState.id + 1
                if (checkToGo(playerState.id, playerState.newID, globalSettings)) {
                    doStep(playerState.id, playerState.newID, globalSettings)
                }
                break
            case 65:
                playerState.newID = playerState.id - 1
                if (checkToGo(playerState.id, playerState.newID, globalSettings)) {
                    doStep(playerState.id, playerState.newID, globalSettings)
                }
                break
            case 83:
                playerState.newID = playerState.id + globalSettings.horizontalCount
                if (checkToGo(playerState.id, playerState.newID, globalSettings)) {
                    doStep(playerState.id, playerState.newID, globalSettings)
                }
                break
            case 32:
                const nearEnemy = getNearbyObj(playerState.id).filter(([key]) => key === 'tileE')
                nearEnemy.forEach(([, id]) => {
                    const enemy = document.getElementById(id).firstChild

                    const enemyNewHP = Number(...enemy.style.width.split('%')) - globalSettings.playerDamage / globalSettings.enemyHP * 100
                    if (enemyNewHP < 0) {
                        enemy.parentElement.firstChild.remove()
                        setSomething([id], '', 'tileE')
                    } else {
                        enemy.style.width = `${enemyNewHP}%`
                    }
                })
                break
        }
    }
}
const enemyAI = (globalSettings) => {
    const enemyies = getEnemyID()
    enemyies.forEach(({id}) => {
        const steps = [id + 1, id - 1, id + globalSettings.horizontalCount, id - globalSettings.horizontalCount]
        const correctStep = steps[getRandomNum(0, steps.length)]
        if (checkToGo(id, correctStep, globalSettings)) {
            doStep(id, correctStep, globalSettings, 'enemy')
        } else if (checkToGo(id, correctStep + 2, globalSettings)) {
            doStep(id, correctStep + 2, globalSettings, 'enemy')
        }
    })
}


export {generateRow, getRandomNum, hookCreateElement, getRoomId, setSomething, getFreeCell, toGo, enemyAI}
