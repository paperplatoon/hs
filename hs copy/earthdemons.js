//1 - raise your own life total
//2 - grant other demons high HP; high HP demons
//3 - direct face damage HP cards
//4 - set attack to health (would be nice to be able to target all minions)


//water synergy - gain life if you have enough minions
//lifesteal?
//deal damage to both you and opponent? - fire
//4 - heal demons?
//5 - trade life?
//6 - sacrifice demons to gain life?
//7 - deal damage to opponent based on life totals? 

//synergies 
//water summons minions if health is high enough
//water summons copies of high-health minions


//fire deals damage to both players - earth helps stay alive
//fire deals damage 

//air - card that gains health based on hand size

let seedling = {
    name: "Seedling",
    elementType: "earth",
    cardType: "minion",
    tribe: "tree",
    baseCost: 1,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/waterpuddle.png",
    hpToGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: this gains +${array[index].hpToGain} Health` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHealth", 1, false, "maxHealth", 1)
      return stateObj;
    }
  };

  let woodfairy = {
    name: "Wood Fairy",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    lifeGain: 2,
    avatar: "img/waterpuddle.png",  
    canAttack: false,
    text: (state, index, array, playerObj) => { return `End of Turn: ` + playerObj.name + ` gains ${array[index].lifeGain} Life` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = await gainLife(stateObj, playerObj, array[index].lifeGain)
      return stateObj;
    }
  };

  let sapplingsprout = {
    name: "Sappling Sprout",
    elementType: "earth",
    cardType: "minion",
    tribe: "tree",
    baseCost: 2,
    attack: 2,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/waterpuddle.png",
    hpGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: this gains +${array[index].hpGain} Health`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHealth", 1, false, "maxHealth", 1)
        return stateObj;
    }
  };

  let nymphcultivator = {
    name: "Nymph Cultivator",
    elementType: "earth",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: a random friendly demon gains +1 Health`   },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        let randIndex = await pickRandomOtherIndex(array, index)
        stateObj = (randIndex !== false) ? await giveDemonStats(stateObj, playerObj, randIndex, "currentHealth", 1, false, "maxHealth", 1) : stateObj
        return stateObj
    },
  };

  let forestdeity = {
    name: "Forest Deity",
    elementType: "earth",
    cardType: "minion",
    tribe: "deity",
    baseCost: 4,
    attack: 3,
    currentHealth: 4,
    maxHealth: 4,
    avatar: "img/waterpuddle.png",
    rarity: "rare",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: All friendly demons gain +1 Health`    },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        for (let i=0; i < array.length; i++) {
            stateObj = await giveDemonStats(stateObj, playerObj, i, "currentHealth", 1)
        }
      return stateObj;
    }
  };

  let oystergod = {
    name: "Oyster God",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 1,
    currentHealth: 6,
    maxHealth: 6,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    lifeGain: 5,
    text: (state, index, array, playerObj) => { return `End of Turn: ` + playerObj.name + ` gains ${array[index].lifeGain} Life` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },    
    endOfTurn: async (stateObj, index, array, playerObj) => {
      stateObj = await gainLife(stateObj, playerObj, array[index].lifeGain)
      return stateObj;
    }
  };

  let naturedeity = {
    name: "Nature Deity",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png",
    canAttack: true,
    lifeGain: 5,
    text: (state, index, array, playerObj) => { return playerObj.name + `'s "End of Turn" effects trigger twice"` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            newState[playerObj.name].endofTurnMultiplier *= 2
        })
        console.log("mult nd " + stateObj[playerObj.name].endofTurnMultiplier)
        stateObj = await changeState(stateObj)
        return stateObj;
    },
    onDeath: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            newState[playerObj.name].endofTurnMultiplier -= (newState[playerObj.name].endofTurnMultiplier/2)
        })
        stateObj = await updateState(stateObj)
        return stateObj;
    },
  };

  let wpdeity = {
    name: "WP Deity",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png",
    canAttack: true,
    lifeGain: 5,
    text: (state, index, array, playerObj) => { return playerObj.name + `'s "When Played" effects trigger twice"` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            newState[playerObj.name].whenPlayedMultiplier *= 2
        })
        console.log("mult wp " + stateObj[playerObj.name].whenPlayedMultiplier)
        stateObj = await changeState(stateObj)
        return stateObj;
    },
    onDeath: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            newState[playerObj.name].whenPlayedMultiplier -= (newState[playerObj.name].whenPlayedMultiplier/2)
        })
        stateObj = await updateState(stateObj)
      return stateObj;
    },
  };

  let ODdeity = {
    name: "OD Deity",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png",
    canAttack: true,
    lifeGain: 5,
    text: (state, index, array, playerObj) => { return playerObj.name + `'s "On Death" effects trigger twice"` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            newState[playerObj.name].onDeathMultiplier *= 2
        })
        console.log("mult OD " + stateObj[playerObj.name].onDeathMultiplier)
        stateObj = await changeState(stateObj)
        return stateObj;
    },
    onDeath: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            newState[playerObj.name].onDeathMultiplier -= (newState[playerObj.name].onDeathMultiplier/2)
        })
        stateObj = await updateState(stateObj)
      return stateObj;
    },
  };

  let healingspring = {
    name: "Healing Spring",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 3,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `Play: fully heal ALL demons` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },     
    action: async (stateObj, index, array, playerObj) => {
      await executeAbility(playerObj.name, playerObj.monstersInPlay.length-1)
      for (let i = 0; i < stateObj.player.monstersInPlay.length; i++) {
        let missingHP = stateObj.player.monstersInPlay[i].maxHealth - stateObj.player.monstersInPlay[i].currentHealth
        missingHP = (missingHP >= 0) ? missingHP : 0
        stateObj = await healMinion(stateObj, stateObj.player, i, missingHP)
      }
      for (let i = 0; i < stateObj.opponent.monstersInPlay.length; i++) {
        let missingHP = stateObj.opponent.monstersInPlay[i].maxHealth - stateObj.opponent.monstersInPlay[i].currentHealth
        missingHP = (missingHP >= 0) ? missingHP : 0
        stateObj = await healMinion(stateObj, stateObj.opponent, i, missingHP)
      }
      return stateObj;
    },
  };

  let sacrificialsprite = {
    name: "Sacrificial Sprite",
    elementType: "earth",
    cardType: "minion",
    rarity: "rare",
    baseCost: 2,
    attack: 3,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 2,
    text: (state, index, array, playerObj) => { return `Die: ` + playerObj.name + ` gains ${array[index].lifeGain} Life`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },     
    onDeath: async (stateObj, index, array, playerObj) => {
        stateObj = await gainLife(stateObj, playerObj, array[index].lifeGain)
        return stateObj;
      }
  };

  let forestnymph = {
    name: "Forest Nymph",
    elementType: "earth",
    cardType: "minion",
    rarity: "rare",
    baseCost: 2,
    attack: 2,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 3,
    text: (state, index, array, playerObj) => { return `Play: ` + playerObj.name + ` gains ${array[index].lifeGain} Life`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => { 
      stateObj = await gainLife(stateObj, playerObj, array[index].lifeGain)
      return stateObj;
    },
  };

  let woodsprite = {
    name: "Wood Sprite",
    elementType: "earth",
    cardType: "minion",
    rarity: "common",
    baseCost: 1,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 1,
    text: (state, index, array, playerObj) => { return `Play: ` + playerObj.name + ` gains ${array[index].lifeGain} Life`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => { 
      stateObj = await gainLife(stateObj, playerObj, array[index].lifeGain)
      return stateObj;
    },
  };

  let lightspark = {
    name: "Lightspark",
    elementType: "earth",
    cardType: "minion",
    rarity: "common",
    baseCost: 1,
    attack: 2,
    currentHealth: 1,
    maxHealth: 1,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 1,
    text: (state, index, array, playerObj) => { return `Die: ` + playerObj.name + ` gains ${array[index].lifeGain} Life`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    onDeath: async (stateObj, index, array, playerObj) => {
        stateObj = await gainLife(stateObj, playerObj, array[index].lifeGain)
        return stateObj;
      }
  };

  let deityoflight = {
    name: "Deity of Light",
    elementType: "earth",
    cardType: "minion",
    baseCost: 4,
    attack: 20,
    currentHealth: 5,
    maxHealth: 5,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `Play: fully heal all friendly demons` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => {
        let monsterArray = (playerObj.name === "player") ? stateObj.player.monstersInPlay : stateObj.opponent.monstersInPlay 
        await executeAbility(playerObj.name, playerObj.monstersInPlay.length)
        for (let i = 0; i < monsterArray.length; i++) {
          let missingHP = monsterArray[i].maxHealth - monsterArray[i].currentHealth
          stateObj = await healMinion(stateObj, stateObj.player, i, missingHP)
        }
      return stateObj;
    },
  };

  let purifiedoverlord = {
    name: "Purified Overlord",
    elementType: "earth",
    cardType: "minion",
    baseCost: 6,
    attack: 4,
    currentHealth: 8,
    maxHealth: 8,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `End Turn: fully heal friendly demons` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    endOfTurn: async (stateObj, index, array, playerObj) => {
        await executeAbility(playerObj.name, playerObj.monstersInPlay.length)
        for (let i = 0; i < monsterArray.length; i++) {
          let missingHP = monsterArray[i].maxHealth - monsterArray[i].currentHealth
          stateObj = await healMinion(stateObj, stateObj.player, i, missingHP)
        }
        return stateObj;
      },
  };

  let corruptingspirit = {
    name: "Corrupting Spirit",
    elementType: "earth",
    cardType: "minion",
    baseCost: 6,
    attack: 5,
    currentHealth: 8,
    maxHealth: 8,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => {return `Play: set friendly demons' Attack equal to their Health` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },   
    action: async (stateObj, index, array, playerObj) => {
      for (let i = 0; i < playerObj.monstersInPlay.length; i++) {
        if (i !== index) {
            let attackToAdd = playerObj.monstersInPlay[i].currentHealth - playerObj.monstersInPlay[i].attack
            stateObj = await giveDemonStats(stateObj, playerObj, i, "attack", attackToAdd)
        }
      }
      return stateObj;
    },
  };

  let toxicvapors = {
    name: "Toxic Vapors",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array, playerObj) => {
      let playerText = (playerObj.name === "player") ? "opponent" : "You"
      return `End Turn: ` + playerText +  ` loses Life equal to this minion's Health`},
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },  
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await dealFaceDamage(stateObj, stateObj[playerObj.name], attackerIndex, array[index].currentHealth)
        stateObj = await changeState(stateObj)
        return stateObj;
      },
  };

  let poisonousswamp = {
    name: "Poisonous Swamp",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 1,
    currentHealth: 4,
    maxHealth: 4,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array, playerObj) => {
      let playerText = (playerObj.name === "player") ? "opponent" : "You"
      return `End Turn: ` + playerText +  ` loses Life equal to this minion's Health`},
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },  
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await dealFaceDamage(stateObj, stateObj[playerObj.name], attackerIndex, array[index].currentHealth)
        stateObj = await changeState(stateObj)
        return stateObj;
      },
  };

  let spreadingblessing = {
    name: "Spreading Blessing",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 2,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => {return `End of Turn: Another friendly demon gains +2 Health ` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    endOfTurn: async (stateObj, index, array, playerObj) => {
        let randIndex = await pickRandomOtherIndex(array, index)
        stateObj = (randIndex !== false) ? await giveDemonStats(stateObj, playerObj, randIndex, "currentHealth", 2, "maxHealth", 2) : stateObj
        return stateObj
    }
  };

  let deepseasquid = {
    name: "Deep Sea Squid",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 2,
    currentHealth: 1,
    maxHealth: 1,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Double this minion's Health` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        let missingHP = array[index].maxHealth - array[index].currentHealth
        stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHealth", array[index].currentHealth, false, "maxHealth", ((missingHP > array[index].currentHealth) ? 0 : array[index].currentHealth-missingHP))
        return stateObj;
    },
  };

  let bellcasterdeity = {
    name: "Bellcaster Deity",
    elementType: "earth",
    cardType: "minion",
    baseCost: 4,
    attack: 4,
    currentHealth: 5,
    maxHealth: 5,
    potCounter: 0,
    avatar: "img/plant1.png",
    anAttack: false,
    text: (state, index, array) => { return `Play: Double the Health of all other friendly demons` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      let array2 = playerObj.monstersInPlay
      for (let i = 0; i < array.length; i++) {
        let lostHP = array[i].maxHealth - array[i].currentHealth
        stateObj = await giveDemonStats(stateObj, playerObj, i, "currentHealth", array2[i].currentHealth, false, "maxHealth", ((lostHP > array2[i].currentHealth) ? 0 : array2[i].currentHealth-lostHP))
      }
      return stateObj
    },
  };

  let healerimp = {
    name: "Healer Imp",
    elementType: "earth",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Give a random friendly minion +2 HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },  
    action: async (stateObj, index, array, playerObj) => {
      let randIndex = await pickRandomOtherIndex(array, index)
      stateObj = (randIndex !== false) ? await giveDemonStats(stateObj, playerObj, randIndex, "currentHealth", 2, false, "maxHealth", 2) : stateObj
      return stateObj
    }
  };

  let kindspirit = {
    name: "Kind Spirit",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 4,
    currentHealth: 6,
    maxHealth: 6,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    lifeGain: 4,
    text: (state, index, array) => { return `When Played: give opponent +${array[index].lifeGain} Life`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => {
        let opponent = (playerObj.name === "player") ? stateObj.opponent : stateObj.player
        stateObj = await gainLife(stateObj, opponent, array[index].lifeGain)
        return stateObj;
    },
  };

  let empoweredspirit = {
    name: "Empowered Spirit",
    elementType: "earth",
    cardType: "minion",
    baseCost: 4,
    attack: 4,
    currentHealth: 5,
    maxHealth: 5,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If player's health is 30 or more, gain +3/+3` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHealth", 3, false, "maxHealth", 3, "attack", 3)
        return stateObj;
    },
  };

  let lifegiver = {
    name: "Life Giver",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 2,
    currentHealth: 4,
    maxHealth: 4,
    lifeGain: 4,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Both players gain 4 life`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await gainLife(stateObj, stateObj.player, array[index].lifeGain)
        stateObj = await gainLife(stateObj, stateObj.opponent, array[index].lifeGain)
        return stateObj;
    },
  };

  let hypedjinn = {
    name: "Hype Djinn",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Double the HP of your highest HP minion` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        let missingHP = 0
        if (player.monstersInPlay.length > 1) {
            let maxHealthIndex = false;
            let maxHealth = 0;
            for (let i=0; i < player.monstersInPlay.length-1; i++) {
                if (player.monstersInPlay[i].currentHealth > maxHealth) {
                    maxHealth = player.monstersInPlay[i].currentHealth
                    maxHealthIndex = i
                    missingHP = player.monstersInPlay[i].maxHealth - player.monstersInPlay[i].currentHealth
                }
            }
            await giveDemonStats(stateObj, playerObj, maxHealthIndex, "currentHealth", maxHealth, false, "maxHealth", maxHealth)
        }
        return stateObj;
    },
  };

  let lightbornimp = {
    name: "Lightborn Imp",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 2,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 25 health, gain +2/+2` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentLife >= 25) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHealth", 2, false, "maxHealth", 2, "attack", 2)
        }
        return stateObj;
    },
  };

  let sicklyifrit = {
    name: "Sickly Ifrit",
    elementType: "earth",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 25 health, gain +2/+2` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentLife >= 25) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHealth", 2, false, "maxHealth", 2, "attack", 2)
        }
        return stateObj;
    },
  };

  let fragilespirit= {
    name: "Fragile Spirit",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 4,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 25 health, double this minion's HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentLife >= 25) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHealth", array[index].currentHealth, false, "maxHealth", array[index].currentHealth)
        }
        return stateObj;
    },
  };


  let cowardlyspirit = {
    name: "Cowardly Spirit",
    elementType: "earth",
    cardType: "minion",
    baseCost: 4,
    attack: 4,
    currentHealth: 5,
    maxHealth: 5,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 20 health, gain +1/+2` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentLife >= 20) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHealth", 2, false, "maxHealth", 2, "attack", 1)
        }
        return stateObj;
    },
  };

  let risingtsunami = {
    name: "Rising Tsunami",
    elementType: "earth",
    cardType: "minion",
    rarity: "legendary",
    baseCost: 5,
    attack: 5,
    currentHealth: 5,
    maxHealth: 5,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Gain +3 HP`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHealth", 3, false, "maxHealth", 3)
      return stateObj;
    }
  };

  let europesspectre = {
    name: "Europe's Specture",
    elementType: "earth",
    cardType: "minion",
    baseCost: 5,
    attack: 4,
    currentHealth: 7,
    maxHealth: 7,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: Set HP of all friendly minions to that of your highest HP minion`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },    
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        if (player.monstersInPlay.length > 1) {
            let maxHealthIndex = false;
            let maxHealth = 0;
            for (let i=0; i < player.monstersInPlay.length-1; i++) {
                if (player.monstersInPlay[i].currentHealth > maxHealth) {
                    maxHealth = player.monstersInPlay[i].currentHealth
                    maxHealthIndex = i
                }
            }
            for (let i=0; i < player.monstersInPlay.length-1; i++) {
                if (i !== maxHealthIndex) {
                    let amountToGain = maxHealth - player.monstersInPlay[i].currentHealth
                    stateObj = await giveDemonStats(stateObj, playerObj, i,  "currentHealth", amountToGain, false, "maxHealth", amountToGain)
                }   
            }
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };