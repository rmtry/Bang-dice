// Dice info:
// 0: Dynamite
// 1: Shoot nearby Player once
// 2: Shoot one-place-further Player once
// 3: Beer
// 4: Arrow
// 5: Part
class Player {
    constructor(userId, room, roleId, characterId, index){
        this.userId = userId;
        this.room = room
        this.roleId = roleId;
        this.characterId = characterId;
        this.index = index
        this.health = this.roleId === 'S' ? 10 : 8
    }

    rollDice(amount) {
        let results = []
        if(amount > 0 || amount <= 5) {
            for (let i = 0; i < amount; i++) {
                results.push(Math.floor(Math.random() * 6))
            }
        } else {
            throw new Error('Cannot have more than 5 dices and there should be minimum 1 dice')
        }
        return results
    }

}
let players = []
class Players {
    constructor(){
        this.players = players
    }
}
module.exports = {Player};