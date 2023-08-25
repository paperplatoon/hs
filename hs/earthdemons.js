let hydraweed = {
    name: "Hydra Weed",
    type: "earth",
    baseCost: 1,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    deathCounter: 0,
    avatar: "img/plant1.png",
  
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
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.monstersInPlay.push(hydraweed)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    onDeath: async (stateObj, index, array, playerObj) => {
      let newDeathrattleImp = {...array[index]};
      newDeathrattleImp.deathCounter += 1
      newDeathrattleImp.attack = 1 + newDeathrattleImp.deathCounter
      newDeathrattleImp.currentHP = 1 + newDeathrattleImp.deathCounter
      newDeathrattleImp.maxHP = 1 + newDeathrattleImp.deathCounter
      
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.monstersInPlay.push(newDeathrattleImp)
      })
      return stateObj;
    }
  };

  

  let birthingpot = {
    name: "Birthing Pot",
    type: "earth",
    baseCost: 1,
    attack: 0,
    currentHP: 1,
    maxHP: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Summon a ${1+array[index].potCounter}/${1+array[index].potCounter} Pot Growth`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = await playDemonFromHand(stateObj, index, playerObj)
      return stateObj;
    },

    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
          let player = (playerObj.name === "player") ? newState.player : newState.opponent
          player.monstersInPlay.push(potgrowth)
        })
        return stateObj;
      }
  };

  let GnomeTwins = {
    name: "Gnome Twins",
    type: "earth",
    baseCost: 1,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `On Play: Summon another Gnome Twin`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)
      //await pause(250)
      stateObj = await summonDemon(stateObj, array[index], playerObj, 500)
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let potgrowth = {
    name: "Pot Growth",
    type: "earth",
    baseCost: 1,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return ``
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.monstersInPlay.push(potgrowth)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
  };