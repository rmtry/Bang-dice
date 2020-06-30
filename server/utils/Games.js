let games=[]

class Games {
    constructor(){
        this.games = games
    }

    addGame(room, players) {
        let game = { room, players }
        this.games.push(game)
    }

    getGame(room) {
        return games.filter(game => game.room === room)
    }
}
module.exports = { Games };