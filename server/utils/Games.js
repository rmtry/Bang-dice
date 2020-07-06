let games=[]

[{
    room: '',
    players: [],
    currentTurnIndex: 0,
    winner: {}
}]

class Games {
    constructor(){
        this.games = []
    }

    addGame(room, players, start = false) {
        let game = { room, players, start }
        // find sherif to get the first player index
        let sherif = game.players.find(player => player.roleId === 'S')
        if (sherif) game.currentTurnIndex = sherif.index
        else game.currentTurnIndex = 0
        console.log(this.games)
        this.games.push(game)
    }

    getGame(room) {
        return this.games.find(game => game.room === room)
    }

    changeGameData(room, key, value) {
        let index = this.games.findIndex(g => g.room === room)

        if(index) {
            this.games[index] = { ...this.games[index], [key]: value }
        }
        
    }

    checkGameContinue(room) {
        let game = this.getGame(room)
        return game.winner ? false : true
    }
    

    checkGameStatus(room) {
        let game = this.games.filter(game => game.room === room)
        let sherif = undefined
        let vices, outlaws, renegades = [];

        game.players.map(player => {
            if (player.rollId === 'S' && player.health > 0) {
                sherif = player
            } 
            else if (player.rollId === 'V' && player.health > 0) {
                vices.push(player)
            } 
            else if (player.rollId === 'O' && player.health > 0) {
                outlaws.push(player)
            }
            else if (player.rollId === 'R' && player.health > 0) {
                renegades.push(player)
            }
        })
        // Outlaws win if Sherif dies before the Outlaws or when there are still at least 1 Vice and 1 Renegade
        if(!sherif && outlaws.length > 0 || (!sherif && renegades.length > 0 && vices.length > 0)) {
            this.changeGameData(room, 'winner', { roleId: 'O', players: outlaws })
        }
        // Renegade wins if he eliminated the Sherif at the final
        else if(!sherif && outlaws.length === 0 && vices.length === 0 || renegades.length === 1) {
            this.changeGameData(room, 'winner', { roleId: 'R', players: renegades })
        }
        // Sherif and the Vices win if they are alive
        else if(sherif && outlaws.length === 0 && vices.length === 0) {
            this.changeGameData(room, 'winner', { roleId: 'R', players: renegades })
        }
    }
}
module.exports = { Games };