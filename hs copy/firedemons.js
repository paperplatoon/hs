

let sparkingimp = {
    name: "Sparking Imp",
    type: "fire",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/flamingbaby.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: deal 1 damage to a random enemy` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        let opponent = (playerObj.name === "player") ? newState.opponent : newState.player

        let targetIndex = Math.floor(Math.random() * (opponent.monstersInPlay.length+1));

        if (targetIndex >= opponent.monstersInPlay.length || opponent.monstersInPlay.length === 0) {
            opponent.currentHP -= 1;
        } else {
            opponent.monstersInPlay[targetIndex].currentHP -=1;
            
        }
        player.monstersInPlay.push(sparkingimp)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    }
  };
  
  let explosiveimp = {
    name: "Explosive Imp",
    baseCost: 1,
    type: "fire",
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/firebaby.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `On Death: Deal 2 damage to a random enemy minion` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(explosiveimp)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    onDeath: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let opponent = (playerObj.name === "player") ? newState.opponent : newState.player

        if (opponent.monstersInPlay.length > 0) {
          let targetIndex = Math.floor(Math.random() * (opponent.monstersInPlay.length));
          opponent.monstersInPlay[targetIndex].currentHP -=2;
        }
      })
      return stateObj;
    }
  };


let minorefrit = {
  name: "Minor Efrit",
  type: "air",
  baseCost: 2,
  attack: 1,
  currentHealth: 4,
  maxHealth: 4,
  avatar: "img/fireMonster.png",

  canAttack: false,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `WHen Played: give another random friendly minion +1 attack`
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array, playerObj) => {
  let randIndex = -10;
    stateObj = immer.produce(stateObj, (newState) => {
      let player = (playerObj.name === "player") ? newState.player : newState.opponent
      player.currentEnergy -=array[index].baseCost;
      if (player.monstersInPlay.length > 0) {
          let targetIndex = Math.floor(Math.random() * (player.monstersInPlay.length));
          randIndex = targetIndex
          player.monstersInPlay[targetIndex].attack +=1;
      }
      player.monstersInPlay.push(minorefrit)
    })
    if (randIndex >= 0) {
      await executeAbility(playerObj.name, randIndex)
    }
    return stateObj;
  }
}

let airmote = {
  name: "Air Mote Elemental",
  type: "air",
  baseCost: 1,
  attack: 0,
  currentHealth: 1,
  maxHealth: 1,
  avatar: "img/fireMonster.png",

  canAttack: false,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `End of Turn: Give a random friendly demon +2 attack`
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array, playerObj) => {
      stateObj = await playDemonFromHand(stateObj, index, playerObj)
      return stateObj;
  }, 

  endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        let targetIndex = Math.floor(Math.random() * (player.monstersInPlay.length));
        player.monstersInPlay[targetIndex].attack += 2;
      })
      return stateObj;
    }
}

let zeus = {
  name: "Zeus",
  type: "water",
  baseCost: 0,
  attack: 3,
  currentHealth: 3,
  maxHealth: 3,
  avatar: "img/waterpuddle.png",
  rarity: "rare",
  canAttack: false,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `End of Turn: All other friendly demons gain +2 attack` 
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array, playerObj) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      let player = (playerObj.name === "player") ? newState.player : newState.opponent

      player.monstersInPlay.push(zeus)
      player.currentEnergy -=array[index].baseCost;
    })
    return stateObj;
  },
  endOfTurn: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      let player = (playerObj.name === "player") ? newState.player : newState.opponent
      for (let i=0; i < player.monstersInPlay.length; i++) {
          if (i !== index) {
              player.monstersInPlay[i].attack +=1
          }
      }
    })
    return stateObj;
  }
};

