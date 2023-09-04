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
    name: "Earth Elemental I",
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
    name: "Earth Elemental II",
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
    name: "Earth Elemental III",
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
    name: "Earth Elemental IV",
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
    name: "Earth Elemental V",
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
    name: "Water Elemental I",
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
    name: "Water Elemental II",
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
    name: "Water Elemental III",
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
    name: "Water Elemental IV",
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
    name: "Water Elemental V",
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
    name: "Fire Elemental I",
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
    name: "Fire Elemental II",
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
    name: "Fire Elemental III",
    elementType: "fire",
    cardType: "minion",
    tribe: "elemental",
    baseCost: 3,
    attack: 5,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  }

  let fireelementalIV = {
    name: "Fire Elemental IV",
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
    name: "Fire Elemental V",
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



  let airelementalI = {
    name: "Air Elemental I",
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
    name: "Air Elemental I+",
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
    name: "Water Elemental",
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