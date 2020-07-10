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
        this.health = (roleId === 'S') ? 10 : 8
        this.arrow = 0
    }
}
let players = []
class Players {
    constructor(){
        this.players = players
    }
}
module.exports = {Player};