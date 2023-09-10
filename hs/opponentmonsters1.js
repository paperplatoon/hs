let quests = [
  {
    title: "Draw Cards",
    targetCards: 7,
    conditionMet: false,
    text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
      `Draw ${playerObj.quest.targetCards} cards` : `Draw 7 cards` },
    action: async (stateObj, playerObj) => {
      for (let c=0; c < stateObj[playerObj.name].encounterHand.length; c++) {
        stateObj = immer.produce(stateObj, (newState) => {
          let costReduction = (newState[playerObj.name].encounterHand[c].baseCost > 0) ? 1 : 0
          newState[playerObj.name].encounterHand[c].baseCost -= costReduction
        })
      }
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  },
]

let heroPowers = [
  //1
  {
    cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
    baseCost: 2,
    title: "Gain Life",
    lifeGain: 2,
    priority: 0,
    buffText: (numberParameter) => { `Your Conjurer Trick gains ${numberParameter} extra life` },
    text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
      `Gain ${playerObj.heroPower.lifeGain} Life` : `Gain 2 Life` },
    action: async (stateObj, playerObj) => {
      stateObj = await gainLife(stateObj, stateObj[playerObj.name], stateObj[playerObj.name].heroPower.lifeGain)
      stateObj = immer.produce(stateObj, (newState) => {
        newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
      })
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  },
//2
  {
    cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
    baseCost: 1,
    title: "Brief Shield",
    HPBuff: 1,
    priority: 0,
    text: (stateObj, playerObj) => {  return (stateObj.status === Status.inFight) ? 
      `Give a random friendly pet +${stateObj[playerObj.name].heroPower.HPBuff} Defense`: `Give a random friendly pet +1 Defense`},
    action: async (stateObj, playerObj) => {
      if (stateObj[playerObj.name].monstersInPlay.length > 0) {
        let t = Math.floor(Math.random() * stateObj[playerObj.name].monstersInPlay.length)
        stateObj = await giveDemonStats(stateObj, playerObj, t, "currentHP", stateObj[playerObj.name].heroPower.HPBuff, false, "maxHP", stateObj[playerObj.name].heroPower.HPBuff)
      }
      stateObj = immer.produce(stateObj, (newState) => {
        newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
      })
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  },
//3
  {
    cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
    baseCost: 3,
    title: "Summon Growth",
    counter: 1,
    priority: 1,
    text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
      `Summon a ${stateObj[playerObj.name].heroPower.counter}/${stateObj[playerObj.name].heroPower.counter} demon. Improve` : `Summon a 1/1 demon. Improve` },
    action: async (stateObj, playerObj) => {
      let c = playerObj.heroPower.counter
      stateObj = await createNewMinion(stateObj, playerObj, c, c, c, c, name="Personal Growth", minion=potgrowth)
      stateObj = immer.produce(stateObj, (newState) => {
        newState[playerObj.name].currentEnergy -= newState[playerObj.name].heroPower.cost(stateObj, playerObj)
        newState[playerObj.name].heroPower.counter += 1;
      })
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  },
//4
  {
    cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
    baseCost: 1,
    title: "Gain Attack",
    HPBuff: 1,
    priority: 0,
    text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
      `Give a random friendly minion +${stateObj[playerObj.name].heroPower.HPBuff} Attack` : `Give a random friendly minion +1 Attack` },
    action: async (stateObj, playerObj) => {
      if (stateObj[playerObj.name].monstersInPlay.length > 0) {
        let t = Math.floor(Math.random() * stateObj[playerObj.name].monstersInPlay.length)
        stateObj = await giveDemonStats(stateObj, playerObj, t, "attack", stateObj[playerObj.name].heroPower.HPBuff)
      }
      stateObj = immer.produce(stateObj, (newState) => {
        newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
      })
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  },
//5
  {
    cost: (stateObj, playerObj) => { return stateObj[playerObj.name].heroPower.baseCost },
    baseCost: 1,
    title: "Sting",
    HPBuff: 1,
    priority: 0,
    text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
      `Deal ${stateObj[playerObj.name].heroPower.HPBuff} damage directly to your opponent` : `Deal 1 damage directly to your opponent` },
    increaseText: (stateObj, playerObj, buffNumber) => { 
      return `Your hero power deals ${1*buffNumber} more damage` 
    },
    action: async (stateObj, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let opponent = (playerObj.name === "player") ? newState.opponent : newState.player
        opponent.currentHP -= stateObj[playerObj.name].heroPower.HPBuff
      })
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  },
//6
  {
    cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost + (stateObj[playerObj.name].heroPower.HPBuff*2)) },
    baseCost: 4,
    title: "Erase",
    HPBuff: 0,
    priority: 0,
    text: (stateObj, playerObj) => { 
      let textString = ``
      textString = (stateObj[playerObj.name].heroPower.HPBuff === 0 || stateObj.status !== Status.inFight) ? `Destroy a random enemy minion` : `Destroy ${stateObj[playerObj.name].heroPower.HPBuff+1} random enemy minions` 
      return textString
    },
    increaseText: (stateObj, playerObj, buffNumber) => { 
        return `Your hero power costs ${2*buffNumber} more and destroys ${buffNumber*1} more minion` 
      },
    action: async (stateObj, playerObj) => {
      for (i =0; i < stateObj[playerObj.name].heroPower.HPBuff+1; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
          console.log(playerObj.name)
          let mArray = (playerObj.name === "player") ? newState.opponent.monstersInPlay : newState.player.monstersInPlay
          if (mArray.length > 0) {
            let t = Math.floor(Math.random() * mArray.length)
            mArray[t].currentHP = 0;
          }
          newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
        })
        stateObj = await changeState(stateObj)
      }
        return stateObj;
    },
  },
  //7 2 mana - draw a card
]

let tiderider = {
  name: "Tide Rider",
  elementType: "earth",
  cardType: "minion",
  tribe: "none",
  baseCost: 1,
  attack: 1,
  currentHP: 1,
  maxHP: 1,
  avatar: "img/waterpuddle.png",
  hpToGain: 1,
  canAttack: false,
  text: (state, index, array) => { return `End of Turn: Gain +${array[index].hpToGain} HP` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  endOfTurn: async (stateObj, index, array, playerObj) => {
    stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHP", 1, false, "maxHP", 1)
    return stateObj;
  }
};

let oysterspirit = {
  name: "Oyster Spirit",
  elementType: "earth",
  cardType: "minion",
  tribe: "none",
  baseCost: 1,
  attack: 1,
  currentHP: 1,
  maxHP: 1,
  avatar: "img/waterpuddle.png",
  hpToGain: 1,
  canAttack: false,
  text: (state, index, array, playerObj) => { return `End of Turn: ${playerObj.name} gain +${array[index].hpToGain} HP` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
  endOfTurn: async (stateObj, index, array, playerObj) => {
    stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHP", 1, false, "maxHP", 1)
    return stateObj;
  }
};


let elementalI = {
  name: "Elemental II",
  elementType: "neutral",
  cardType: "minion",
  tribe: "elemental",
  baseCost: 1,
  attack: 1,
  currentHP: 2,
  maxHP: 2,
  avatar: "img/waterpuddle.png",
  canAttack: false,
  text: (state, index, array) => { return `` },
  minReq: (state, index, array) => { return array[index].baseCost; },
  cost:  (state, index, array) => { return array[index].baseCost; },
}
  let elementalII = {
    name: "Elemental II",
    elementType: "neutral",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 2,
    attack: 2,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }


  let elementalIII = {
    name: "Elemental III",
    elementType: "neutral",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 3,
    attack: 3,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let elementalIV = {
    name: "Elemental IV",
    elementType: "neutral",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 4,
    attack: 3,
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let elementalV = {
    name: "Elemental V",
    elementType: "neutral",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 5,
    attack: 5,
    currentHP: 6,
    maxHP: 6,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let earthelementalI = {
    name: "Elemental I",
    elementType: "earth",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 1,
    attack: 1,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let earthelementalII = {
    name: "Elemental II",
    elementType: "earth",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 2,
    attack: 2,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let earthelementalIII = {
    name: "Elemental III",
    elementType: "earth",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 3,
    attack: 2,
    currentHP: 6,
    maxHP: 6,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let earthelementalIV = {
    name: "Elemental IV",
    elementType: "earth",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 4,
    attack: 3,
    currentHP: 6,
    maxHP: 6,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let earthelementalV = {
    name: "Elemental V",
    elementType: "earth",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 5,
    attack: 3,
    currentHP: 8,
    maxHP: 8,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let waterelementalI = {
    name: "Elemental I",
    elementType: "water",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 1,
    attack: 2,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let waterelementalII = {
    name: "Elemental II",
    elementType: "water",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 2,
    attack: 3,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let waterelementalIII = {
    name: "Elemental III",
    elementType: "water",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 3,
    attack: 4,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let waterelementalIV = {
    name: "Elemental IV",
    elementType: "water",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 4,
    attack: 5,
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let waterelementalV = {
    name: "Elemental V",
    elementType: "water",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 5,
    attack: 6,
    currentHP: 6,
    maxHP: 6,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let fireelementalI = {
    name: "Elemental I",
    elementType: "fire",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 1,
    attack: 3,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let fireelementalII = {
    name: "Elemental II",
    elementType: "fire",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 2,
    attack: 4,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let fireelementalIII = {
    name: "Elemental III",
    elementType: "fire",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 3,
    attack: 6,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let fireelementalIV = {
    name: "Elemental IV",
    elementType: "fire",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 4,
    attack: 6,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let fireelementalV = {
    name: "Elemental V",
    elementType: "fire",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 5,
    attack: 7,
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let testKiller = {
    name: "Elemental V",
    elementType: "fire",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 0,
    attack: 50,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/waterpuddle.png",
    canAttack: true,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }



  let airelementalI = {
    name: "Elemental I",
    type: "air",
    rarity: "common",
    baseCost: 1,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let airelementalIplus = {
    name: "Elemental I+",
    type: "air",
    rarity: "common",
    baseCost: 1,
    attack: 2,
    currentHP: 3,
    maxHP: 3,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelementalcommon = {
    name: "Elemental",
    type: "water",
    rarity: "common",
    baseCost: 1,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  


  let eartheelementalrare = {
    name: "Water Elemental",
    type: "water",
    rarity: "rare",
    baseCost: 1,
    attack: 1,
    currentHP: 4,
    maxHP: 4,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelementalepic = {
    name: "Water Elemental",
    type: "water",
    rarity: "epic",
    baseCost: 1,
    attack: 1,
    currentHP: 5,
    maxHP: 5,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };


  let eartheelemental2common = {
    name: "Water Elemental+",
    type: "water",
    rarity: "common",
    baseCost: 2,
    attack: 2,
    currentHP: 3,
    maxHP: 3,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental2rare = {
    name: "Water Elemental+",
    type: "water",
    rarity: "rare",
    baseCost: 2,
    attack: 2,
    currentHP: 4,
    maxHP: 4,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental2epic = {
    name: "Water Elemental+",
    type: "water",
    rarity: "epic",
    baseCost: 2,
    attack: 2,
    currentHP: 5,
    maxHP: 5,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental2epicB = {
    name: "Water Elemental+",
    type: "water",
    rarity: "epic",
    baseCost: 2,
    attack: 1,
    currentHP: 7,
    maxHP: 7,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental3common = {
    name: "Water Elemental++",
    type: "water",
    rarity: "common",
    baseCost: 3,
    attack: 3,
    currentHP: 4,
    maxHP: 4,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental3rare = {
    name: "Water Elemental++",
    type: "water",
    rarity: "rare",
    baseCost: 3,
    attack: 3,
    currentHP: 5,
    maxHP: 5,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental3rareB = {
    name: "Water Elemental++",
    type: "water",
    rarity: "rare",
    baseCost: 3,
    attack: 2,
    currentHP: 7,
    maxHP: 7,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental3epic = {
    name: "Water Elemental++",
    type: "water",
    rarity: "epic",
    baseCost: 3,
    attack: 3,
    currentHP: 6,
    maxHP: 6,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental3epicB = {
    name: "Water Elemental++",
    type: "water",
    rarity: "epic",
    baseCost: 3,
    attack: 2,
    currentHP: 8,
    maxHP: 8,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4common = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "common",
    baseCost: 4,
    attack: 4,
    currentHP: 5,
    maxHP: 5,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4rare = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "rare",
    baseCost: 4,
    attack: 4,
    currentHP: 6,
    maxHP: 6,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4rareB = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "rare",
    baseCost: 4,
    attack: 3,
    currentHP: 8,
    maxHP: 8,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4rareC = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "rare",
    baseCost: 4,
    attack: 2,
    currentHP: 10,
    maxHP: 10,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4epic = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "epic",
    baseCost: 4,
    attack: 4,
    currentHP: 7,
    maxHP: 7,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4epicB = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "epic",
    baseCost: 4,
    attack: 3,
    currentHP: 9,
    maxHP: 9,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4epicC = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "epic",
    baseCost: 4,
    attack: 2,
    currentHP: 11,
    maxHP: 11,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let eartheelemental4legendary = {
    name: "Water Elemental+++",
    type: "water",
    rarity: "legendary",
    baseCost: 4,
    attack: 4,
    currentHP: 9,
    maxHP: 9,
    elemental: true,
    avatar: "img/waterpuddle.png",
  
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
      return stateObj;
    },
  };