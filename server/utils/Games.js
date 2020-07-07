let games=[]

[{
    room: '',
    players: [],
    currentTurnIndex: 0,
    winner: {},
    history: []
}]

class Games {
    constructor(){
        this.games = []
    }

    addGame(room, players, start = false, history = [], arrows = 9) {
        let game = { room, players, start, history, arrows }
        game.winner = undefined
        // find sherif to get the first player index
        let sherif = game.players.find(player => player.roleId === 'S')
        if (sherif) game.currentTurnIndex = sherif.index
        else game.currentTurnIndex = 0
        // console.log(this.games)
        this.games.push(game)
    }

    useEffect(room, action, amount, from, target) {
        let game = this.getGame(room)

        let fromIndex = game.players.findIndex(player => player.index === from)
        let targetIndex = game.players.findIndex(player => player.index === target)

        switch(action) {
            case 'heal':
                game.players[targetIndex].health += amount
                game.history.push(`Player ${game.players[fromIndex].name} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) healed ${game.players[targetIndex].name} (role ${game.players[targetIndex].roleId}, character ${game.players[targetIndex].characterId}) ${amount} hp`)
                break;
            case 'shoot':
                game.players[targetIndex].health -= amount
                game.history.push(`Player ${game.players[fromIndex].name} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) shot ${game.players[targetIndex].name} (role ${game.players[targetIndex].roleId}, character ${game.players[targetIndex].characterId}) ${amount} hp`)
                break;
            case 'dynamite':
                game.players[from].health -= 1
                game.history.push(`Player ${game.players[fromIndex].name} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) got Dynamite!`)
                break;
            case 'gatling':
                game.players.map(player => {
                    if (player.index !== from) player.health -= 1
                })
                game.history.push(`Player ${game.players[fromIndex].name} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) use Gatling Gun!`)
                break;
            case 'arrow':
                game.players[from].arrow += amount
                game.arrows = games.arrows - amount
                if(game.arrows <= 0) {
                    game.players.map(player => {
                        player.health = player.health - player.arrow
                        player.arrow = 0
                    })
                    game.arrows = 9
                }
                game.history.push(`Player ${game.players[fromIndex].name} (role ${game.players[fromIndex].roleId}, character ${game.players[fromIndex].characterId}) got ${amount} arrows!`)
                break;
            default:
                break;
        }
        this.changeGameData(room, game)
    }

    getGame(room) {
        return this.games.find(game => game.room === room)
    }

    changeGameData(room, data) {
        let index = this.games.findIndex(g => g.room === room)
        console.log(index, 'data will be overwriten: ', data)
        if(index !== -1) {
            this.games[index] = { ...this.games[index], ...data }
        }
        
    }

    checkGameContinue(room) {
        let game = this.getGame(room)
        console.log('Winner found?', game.winner)
        return game.winner ? false : true
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
            this.changeGameData(room, { 'winner': { roleId: 'O', players: outlaws } })
        }
        // Renegade wins if he eliminated the Sherif at the final
        if(sherif.length === 0 && outlaws.length === 0 && vices.length === 0 && renegades.length === 1) {
            console.log('The renegade wins')
            this.changeGameData(room, { 'winner': { roleId: 'R', players: renegades } })
        }
        // Sherif and the Vices win if they are alive
        if(sherif.length === 1 && outlaws.length === 0 && renegades.length === 0) {
            console.log('The Sherif wins')
            this.changeGameData(room, { 'winner': { roleId: 'R', players: vices.concat(sherif) } })
        }
        else {
            console.log('conditions passed!')
        }
    }
}
module.exports = { Games };