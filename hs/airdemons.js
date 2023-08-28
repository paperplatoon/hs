let minorefrit = {
    name: "Minor Efrit",
    type: "air",
    baseCost: 2,
    attack: 1,
    currentHP: 4,
    maxHP: 3,
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
    currentHP: 1,
    maxHP: 1,
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
    currentHP: 3,
    maxHP: 1,
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