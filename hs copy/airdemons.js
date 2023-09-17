//skill costs less 6 - ritualimp, ritualdjinn, ritualifrit, ritualifrit2, ritualmarid, ritualmarid2
//advance quest 6 - questimp, questdjinn, questifrit, questifrit2, questmarid, questmarid2
//new quest 2 - newquestmarid, newquestmarid2,
//buff HP 6 - darkritualimp, darkritualimp2, darkritualdjinn, darkritualifrit, darkritualifrit2, darkritualmarid, 

//DISCOVER A NEW QUEST MINION HOLY SHIT OMG 
let newquestmarid = {
  name: "Quest Test",
  elementType: "air",
  cardType: "minion",
  rarity: "legendary",
  baseCost: 2,
  attack: 1,
  currentHealth: 2,
  maxHealth: 2,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: Choose a new quest` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState.status = Status.chooseOpeningQuest
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let newquestmarid2 = {
  name: "Quest Test",
  elementType: "air",
  cardType: "minion",
  rarity: "legendary",
  baseCost: 3,
  attack: 1,
  currentHealth: 1,
  maxHealth: 1,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: Choose a new quest. Add a copy of this to your hand` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = await addCardToHand(stateObj, playerObj, array[index])
    stateObj = immer.produce(stateObj, (newState) => {
      newState.status = Status.chooseOpeningQuest
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}


let ritualimp = {
  name: "Ritual Imp",
  elementType: "air",
  cardType: "minion",
  rarity: "common",
  baseCost: 2,
  attack: 0,
  currentHealth: 2,
  maxHealth: 2,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: Your skill costs 1 less`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      let reduceVal = (newState[playerObj.name].heroPower.baseCost > 0) ? 1 : 0
      newState[playerObj.name].heroPower.baseCost -= reduceVal;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let ritualdjinn = {
  name: "Ritual Djinn",
  elementType: "air",
  cardType: "minion",
  rarity: "rare",
  baseCost: 3,
  attack: 1,
  currentHealth: 3,
  maxHealth: 3,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: Your skill costs 1 less`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      let reduceVal = (newState[playerObj.name].heroPower.baseCost > 0) ? 1 : 0
      newState[playerObj.name].heroPower.baseCost -= reduceVal;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let ritualifrit2 = {
  name: "Ritual Djinn",
  elementType: "air",
  cardType: "minion",
  rarity: "rare",
  baseCost: 5,
  attack: 5,
  currentHealth: 6,
  maxHealth: 6,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: Your skill costs 1 less`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      let reduceVal = (newState[playerObj.name].heroPower.baseCost > 0) ? 1 : 0
      newState[playerObj.name].heroPower.baseCost -= reduceVal;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let ritualifrit = {
  name: "Ritual Ifrit",
  elementType: "air",
  cardType: "minion",
  rarity: "rare",
  baseCost: 5,
  attack: 3,
  currentHealth: 4,
  maxHealth: 4,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: Your skill costs 2 less`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      let reduceVal = (newState[playerObj.name].heroPower.baseCost > 1) ? 2 : newState[playerObj.name].heroPower.baseCost
      newState[playerObj.name].heroPower.baseCost -= reduceVal;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let ritualmarid = {
  name: "Ritual Marid",
  elementType: "air",
  cardType: "minion",
  rarity: "legendary",
  baseCost: 4,
  attack: 4,
  currentHealth: 4,
  maxHealth: 4,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: Your hero power costs 0`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState[playerObj.name].heroPower.baseCost = 0;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let ritualmarid2 = {
  name: "Ritual Marid2",
  elementType: "air",
  cardType: "minion",
  rarity: "legendary",
  baseCost: 2,
  attack: 2,
  currentHealth: 2,
  maxHealth: 2,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: Your hero power costs 2 less`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      let reduceVal = (newState[playerObj.name].heroPower.baseCost > 1) ? 2 : newState[playerObj.name].heroPower.baseCost
      newState[playerObj.name].heroPower.baseCost -= reduceVal;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let questimp = {
  name: "Quest Imp",
  elementType: "air",
  cardType: "minion",
  rarity: "common",
  baseCost: 1,
  attack: 1,
  currentHealth: 1,
  maxHealth: 1,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: advance your quest by 1`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    if (stateObj[playerObj.name].quest) {
      stateObj = await updateQuest(stateObj, stateObj[playerObj.name])
    }
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let questdjinn = {
  name: "Quest Djinn",
  elementType: "air",
  cardType: "minion",
  rarity: "common",
  baseCost: 2,
  attack: 2,
  currentHealth: 3,
  maxHealth: 3,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: advance your quest by 1`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    if (stateObj[playerObj.name].quest) {
      stateObj = await updateQuest(stateObj, stateObj[playerObj.name])
    }
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let questifrit = {
  name: "Quest Ifrit",
  elementType: "air",
  cardType: "minion",
  rarity: "rare",
  baseCost: 3,
  attack: 5,
  currentHealth: 3,
  maxHealth: 3,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: advance your quest by 1`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    if (stateObj[playerObj.name].quest) {
      stateObj = await updateQuest(stateObj, stateObj[playerObj.name])
    }
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let questifrit2 = {
  name: "Quest Ifrit",
  elementType: "air",
  cardType: "minion",
  rarity: "rare",
  baseCost: 3,
  attack: 1,
  currentHealth: 4,
  maxHealth: 4,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: advance your quest by 2`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    if (stateObj[playerObj.name].quest) {
      stateObj = await updateQuest(stateObj, stateObj[playerObj.name], 2)
    }
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let questmarid = {
  name: "Quest Ifrit 2",
  elementType: "air",
  cardType: "minion",
  rarity: "legendary",
  baseCost: 4,
  attack: 3,
  currentHealth: 5,
  maxHealth: 5,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: advance your quest by 3`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    if (stateObj[playerObj.name].quest) {
      stateObj = await updateQuest(stateObj, stateObj[playerObj.name], 3)
    }
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let questmarid2 = {
  name: "Quest Ifrit 2",
  elementType: "air",
  cardType: "minion",
  rarity: "legendary",
  baseCost: 5,
  attack: 2,
  currentHealth: 7,
  maxHealth: 7,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array) => { return `When Played: Complete your quest`  },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    if (stateObj[playerObj.name].quest) {
      stateObj = await updateQuest(stateObj, stateObj[playerObj.name], 10000)
    }
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}



let darkritualimp = {
  name: "Dark Ritual Imp",
  elementType: "air",
  cardType: "minion",
  baseCost: 2,
  attack: 1,
  currentHealth: 1,
  maxHealth: 1,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: ${playerObj.heroPower.buffText(1)}` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState[playerObj.name].heroPower.HPBuff += 1;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let darkritualimp2 = {
  name: "Dark Ritual Imp",
  elementType: "air",
  cardType: "minion",
  baseCost: 2,
  attack: 0,
  currentHealth: 2,
  maxHealth: 2,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: ${playerObj.heroPower.buffText(1)}` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState[playerObj.name].heroPower.HPBuff += 1;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let darkritualdjinn = {
  name: "Dark Ritual Djinn",
  elementType: "air",
  cardType: "minion",
  baseCost: 3,
  attack: 3,
  currentHealth: 2,
  maxHealth: 2,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: ${playerObj.heroPower.buffText(1)}` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState[playerObj.name].heroPower.HPBuff += 1;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let darkritualifrit = {
  name: "Dark Ritual Ifrit",
  elementType: "air",
  cardType: "minion",
  baseCost: 4,
  attack: 3,
  currentHealth: 5,
  maxHealth: 5,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: ${playerObj.heroPower.buffText(1)}` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState[playerObj.name].heroPower.HPBuff += 1;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let darkritualifrit2 = {
  name: "Dark Ritual Ifrit",
  elementType: "air",
  cardType: "minion",
  baseCost: 4,
  attack: 2,
  currentHealth: 4,
  maxHealth: 4,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: ${playerObj.heroPower.buffText(2)}` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState[playerObj.name].heroPower.HPBuff += 2;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}

let darkritualmarid = {
  name: "Dark Ritual Marid",
  elementType: "air",
  cardType: "minion",
  baseCost: 5,
  attack: 2,
  currentHealth: 6,
  maxHealth: 6,
  avatar: "img/fireMonster.png",
  canAttack: false,
  text: (state, index, array, playerObj) => { return `When Played: ${playerObj.heroPower.buffText(3)}` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  action: async (stateObj, index, array, playerObj) => {
    stateObj = immer.produce(stateObj, (newState) => {
      newState[playerObj.name].heroPower.HPBuff += 1;
    })
    stateObj = await changeState(stateObj);
    return stateObj;
  }
}
