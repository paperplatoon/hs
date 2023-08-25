let opponentGrowImp = {
    name: "opGrowImp",
    type: "water",
    baseCost: 1,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `At the end of your turn, this gains 1 HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(opponentGrowImp)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.monstersInPlay[index].currentHP += 1;
        player.monstersInPlay[index].maxHP += 1;
      })
      return stateObj;
    }
  };

  let restoreHealthToOwner = {
    name: "rest",
    type: "water",
    baseCost: 1,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `At the end of your turn, owner gains 1 HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(restoreHealthToOwner)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 1;
      })
      return stateObj;
    }
  };

  let restoreHealthToOwner2 = {
    name: "rest2",
    type: "water",
    baseCost: 2,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `At the end of your turn, owner gains 2 HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(restoreHealthToOwner2)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 2;
      })
      return stateObj;
    }
  };

  let restoreHealthToOwner2a = {
    name: "rest2a",
    type: "water",
    baseCost: 2,
    attack: 2,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `At the end of your turn, owner gains 1 HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(restoreHealthToOwner2a)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 2;
      })
      return stateObj;
    }
  };

  let restoreHealthToOwner3 = {
    name: "rest3",
    type: "water",
    baseCost: 3,
    attack: 2,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `At the end of your turn, owner gains 2 HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(restoreHealthToOwner3)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 2;
      })
      return stateObj;
    }
  };