//high health not always giving to simple imp 

let simpleImp = {
    name: "simple imp",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/fireMonster.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `Battlecry: Deal 1 damage to a random enemy` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        let opponent = (playerObj.name === "player") ? newState.opponent : newState.player

        let targetIndex = Math.floor(Math.random() * (opponent.monstersInPlay.length+1));
        console.log('target index for simpleImp is ' + targetIndex)

        if (targetIndex >= opponent.monstersInPlay.length || opponent.monstersInPlay.length === 0) {
            console.log(array[index].name + " battlecries 1 damage to " + opponent.name )
            opponent.currentHP -= 1;
        } else {
            console.log(array[index].name + " battlecries 1 damage to " + opponent.monstersInPlay[targetIndex].name)
            opponent.monstersInPlay[targetIndex].currentHP -=1;
            
        }
        player.monstersInPlay.push(simpleImp)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    }

    
  }
  
  let simpleDeathrattleImp = {
    name: "dying imp",
    baseCost: 1,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/fireMonster.png",
  
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

        player.monstersInPlay.push(simpleDeathrattleImp)
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
  }
  
  let scalingDeathrattleImp = {
    name: "scaling imp",
    baseCost: 1,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    deathCounter: 0,
    avatar: "img/fireMonster.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `On Death: Summon a ${2+array[index].deathCounter}/${2+array[index].deathCounter} copy of this minion`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        newState.player.monstersInPlay.push(scalingDeathrattleImp)
        newState.player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    onDeath: async (stateObj, index, array) => {
      let newDeathrattleImp = {...array[index]};
      newDeathrattleImp.deathCounter += 1
      newDeathrattleImp.attack = 1 + newDeathrattleImp.deathCounter
      newDeathrattleImp.currentHP = 1 + newDeathrattleImp.deathCounter
      newDeathrattleImp.maxHP = 1 + newDeathrattleImp.deathCounter
      
      stateObj = immer.produce(stateObj, (newState) => {
        newState.player.monstersInPlay.push(newDeathrattleImp)
      })
      return stateObj;
    }
  }
  
  let growingDjinn = {
    name: "Grow",
    baseCost: 2,
    attack: 5,
    currentHP: 6,
    maxHP: 6,
    avatar: "img/flamingbaby.png",
  
    growProperty: 1,
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `Gain +1/+1 whenever you play a card` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
  
  
    action: async (stateObj, index, array) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        newState.player.monstersInPlay.push(array[index])
        newState.player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    }
  }
  
  let highHealthImp = {
    name: "high health",
    baseCost: 1,
    attack: 1,
    currentHP: 7,
    maxHP: 3,
    avatar: "img/fireMonster.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `Battlecry: Give a random friendly minion +1 attack`
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        newState.player.currentEnergy -=array[index].baseCost;
        let arrayObj = (array === stateObj.player.monstersInPlay || array === stateObj.player.encounterHand) ? newState.player.monstersInPlay : newState.opponent.monstersInPlay
        if (arrayObj.length > 0) {
            let targetIndex = Math.floor(Math.random() * (arrayObj.length));
            arrayObj[targetIndex].attack +=1;
        }
        arrayObj.push(highHealthImp)
      })
      return stateObj;
    }
  }
  
  let destroyer = {
    name: "Destroyer",
    baseCost: 7,
    attack: 5,
    currentHP: 12,
    maxHP: 12,
    avatar: "img/fireMonster.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `Battlecry: Give a random friendly minion +1 attack`
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        newState.player.currentEnergy -=array[index].baseCost;
        let arrayObj = (array === stateObj.player.monstersInPlay || array === stateObj.player.encounterHand) ? newState.player.monstersInPlay : newState.opponent.monstersInPlay
        arrayObj.push(destroyer)
      })
      return stateObj;
    }
  }