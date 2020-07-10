let games=[]

[{
    room: '',
    players: [],
    currentTurnIndex: 0,
    winner: {},
    history: []
}]

const defaultDices = [
    {
        index: 0,
        face: undefined,
        rolled: false,
        targetIndex: undefined,
        used: false
    },
    {
        index: 1,
        face: undefined,
        rolled: false,
        targetIndex: undefined,
        used: false
    },
    {
        index: 2,
        face: undefined,
        rolled: false,
        targetIndex: undefined,
        used: false
    },
    {
        index: 3,
        face: undefined,
        rolled: false,
        targetIndex: undefined,
        used: false
    },
    {
        index: 4,
        face: undefined,
        rolled: false,
        targetIndex: undefined,
        used: false
    },
]

class Games {
    constructor(){
        this.games = []
    }

    addGame(room, players, start = false, history = [], arrows = 9) {
        let game = { room, players, start, history, arrows }
        game.winner = undefined
        game.dices = defaultDices
        game.turnRoll = 0
        // find sherif to get the first player index
        let sherif = game.players.find(player => player.roleId === 'S')
        if (sherif) game.currentTurnIndex = sherif.index
        else game.currentTurnIndex = 0
        // console.log(this.games)
        this.games.push(game)
    }

    // general idea of applying effect to the data
    useEffect(room, action, amount, from, target) {
        let game = this.getGame(room)

        let fromIndex = game.players.findIndex(player => player.index === from)
        let targetIndex = game.players.findIndex(player => player.index === target)

        switch(action) {
            case 'heal':
                game.players[targetIndex].health += amount
                game.history.push(`Player ${game.players[fromIndex].index} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) healed ${game.players[targetIndex].index} (role ${game.players[targetIndex].roleId}, character ${game.players[targetIndex].characterId}) ${amount} hp`)
                break;
            case 'shoot':
                game.players[targetIndex].health -= amount
                game.history.push(`Player ${game.players[fromIndex].index} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) shot ${game.players[targetIndex].index} (role ${game.players[targetIndex].roleId}, character ${game.players[targetIndex].characterId}) ${amount} hp`)
                break;
            case 'dynamite':
                game.players[from].health -= 1
                game.history.push(`Player ${game.players[fromIndex].index} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) got Dynamite!`)
                break;
            case 'gatling':
                game.players.map(player => {
                    if (player.index !== from) player.health -= 1
                })
                game.history.push(`Player ${game.players[fromIndex].index} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) use Gatling Gun!`)
                break;
            case 'arrow':
                game.players[from].arrow += amount
                game.arrows = game.arrows - amount
                if(game.arrows <= 0) {
                    game.players.map(player => {
                        player.health = player.health - player.arrow
                        player.arrow = 0
                    })
                    game.arrows = 9
                }
                game.history.push(`Player ${game.players[fromIndex].index} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) got ${amount} arrows!`)
                break;
            default:
                break;
        }
        this.changeGameData(room, game)
    }

    getGame(room) {
        return this.games.find(game => game.room === room)
    }

    getGameData(room, socketId) {
        let game = this.getGame(room)
        let players = game.players.map(player => {
            if(socketId !== player.userId) return { ...player, roleId: undefined }
            return player
        })

        return { ...game, players: players }
    }

    changeGameData(room, data) {
        let index = this.games.findIndex(g => g.room === room)
        // console.log(index, 'data will be overwriten: ', data)
        if(index !== -1) {
            this.games[index] = { ...this.games[index], ...data }
        }
        
    }

    checkGameContinue(room) {
        let game = this.getGame(room)
        console.log('Winner found?', game.winner)
        return game.winner ? false : true
    }
    
    checkTurn(room, socketId) {
        let game = this.getGame(room)
        console.log('socket id', socketId)
        let currentPlayer = game.players.find(player => player.index === game.currentTurnIndex)
        console.log('turn player id', currentPlayer.userId)
        if (socketId === currentPlayer.userId) {
            return true
        } else {
            return false
        }
    }

    checkGameStatus(room) {
        let game = this.games.find(game => game.room === room)
        console.log('Game status of: ', game)
        let sherif = []
        let vices = [], outlaws = [], renegades = [];

        game.players.map(player => {
            if (player.roleId === 'S' && player.health > 0) {
                sherif.push(player)
            } 
            else if (player.roleId === 'V' && player.health > 0) {
                vices.push(player)
            } 
            else if (player.roleId === 'O' && player.health > 0) {
                outlaws.push(player)
            }
            else if (player.roleId === 'R' && player.health > 0) {
                renegades.push(player)
            }
        })

        console.log('The current number of Sherif, Outlaws and Renegade', [sherif.length, vices.length, outlaws.length, renegades.length])
        // Outlaws win if Sherif dies before the Outlaws or when there are still at least 1 Vice and 1 Renegade
        if((sherif.length === 0 && outlaws.length > 0) || (sherif.length === 0 && renegades.length > 0 && vices.length > 0)) {
            console.log('The outlaws win')
            this.changeGameData(room, { 'winner': { roleId: 'O', players: game.players.filter(player => player.roleId === 'O') } })
        }
        // Renegade wins if he eliminated the Sherif at the final
        if(sherif.length === 0 && outlaws.length === 0 && vices.length === 0 && renegades.length === 1) {
            console.log('The renegade wins')
            this.changeGameData(room, { 'winner': { roleId: 'R', players: renegades } })
        }
        // Sherif and the Vices win if they are alive
        if(sherif.length === 1 && outlaws.length === 0 && renegades.length === 0) {
            console.log('The Sherif wins')
            this.changeGameData(room, { 'winner': { roleId: 'S', players: game.players.filter(player => player.roleId === 'V' || player.roleId === 'S') } })
        }
        else {
            console.log('conditions passed!')
        }
    }

    // for the dices
    getFace(face) {
        switch(face) {
            case 1:
                return "shoot1";
            case 2:
                return "shoot2";
            case 3:
                return "beer";
            case 4:
                return "dynamite";
            case 5:
                return "arrow";
            case 0:
                return "part";
            default:
                return ''
        }
    }

    getDices(room) {
        let game = this.getGame(room)
        return game.dices
    }

    rollDices(room, playerIndex) {
        let game = this.getGame(room)
        let dices = game.dices.map(dice => {
            if(!dice.rolled && game.turnRoll < 3) {
                dice.face = this.getFace(Math.floor(Math.random() * 6))
                if (dice.face === 'dynamite') dice.rolled = true
                else if (dice.face === 'arrow') this.useEffect(room, 'arrow', 1, playerIndex)
            }
            return dice
        })
        console.log('Rolled!, ', dices.map(dice => dice.face).join('-'))
        let turnRoll = game.turnRoll += 1
        this.changeGameData(room, { dices, turnRoll })
    }

    keepDices(room, diceIndexes) {
        let game = this.getGame(room)
        diceIndexes.map(i => {
            game.dices[i].rolled = true
            return ''
        })
    }

    useDices(room, targetIndexes) {
        let game = this.getGame(room)
        let dices = game.dices.map((dice, index) => {
            dice.targetIndex = targetIndexes[index]
            // define conditions
            return dice
        })
        this.changeGameData(room, { dices })
    }

    finishDice(diceIndexes){
        let game = this.getGame(room)

        let dices = game.dices.map((dice, index) => {
            dice.used = diceIndexes[index]
            return dice
        })
        this.changeGameData(room, { dices })
    }

    resetDices() {
        let dices  = defaultDices
        this.changeGameData(room, { dices })
    }

    executeDices(room, playerIndex) {
        let game = this.getGame(room)
        let dices = game.dices
        let parts = 0
        for(let i = 0; i< dices.length; i++) {
            if(dices[i].rolled = true && dices[i].targetIndex) {
                switch(dices[i].face) {
                    case 'shoot1':
                        this.useEffect(room, 'shoot', 1, playerIndex, dices[i].targetIndex)
                        break;
                    case 'shoot2':
                        this.useEffect(room, 'shoot', 1, playerIndex, dices[i].targetIndex)
                        break;
                    case 'beer':
                        this.useEffect(room, 'heal', 1, playerIndex, dices[i].targetIndex)
                        break;  
                    case 'part':
                        // check ability first
                        parts++
                        if(parts >= 3) {
                            this.useEffect(room, 'gatling', 1, playerIndex)
                            parts = 0
                        }
                        break;
                    default: 
                        break;                
                }
            }
        }
        this.changeGameData(room, { turnRoll: 0 })
    }
}
module.exports = { Games };