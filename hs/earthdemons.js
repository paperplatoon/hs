//common - 5
//waverider - 1/1, +1HP eot
//oysterspirit - 1/1, +1 life
//tidepool lurker - 2 2/2, eot +1 hp
//kelp spirit - 1 1/2, eot give another +1
//great oyster spirit - 2 1/2, eot +2 Life

//rare - 4
//tiderider - 1/2, +1HP eot
// 4 mana - 4/4 Restore all minions to full health
//sacrificial sprite - 2 3/1, on death: +2 life
//healing spring - 3 3/3, on play: heal all minions to full

//epic - 2
//poseidon - 4 3/4, all minions end of turn +1
//deity of light - 4 4/5; on play: hael all friendly minions to full


//legendary - 2
//oyster god - 3 1/6, end of turn Summoner  gains 5 HP
//purifiedoverlord  - 6 5/8, end of turn heal all friendly minions to full 

let seedling = {
    name: "Seedling",
    elementType: "earth",
    cardType: "minion",
    tribe: "tree",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
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

  let woodfairy = {
    name: "Wood Fairy",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    lifeGain: 2,
    avatar: "img/waterpuddle.png",  
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Summoner gains ${array[index].lifeGain} Life` },
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
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
    hpGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Gain +${array[index].hpGain} HP`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHP", 1, false, "maxHP", 1)
        return stateObj;
    }
  };

  let nymphcultivator = {
    name: "Nymph Cultivator",
    elementType: "earth",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Give another friendly demon +1 HP`   },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        let randIndex = await pickRandomOtherIndex(array, index)
        stateObj = (randIndex !== false) ? await giveDemonStats(stateObj, playerObj, randIndex, "currentHP", 1, false, "maxHP", 1) : stateObj
        return stateObj
    },
  };

  let forestdeity = {
    name: "Forest Deity",
    elementType: "earth",
    cardType: "deity",
    baseCost: 4,
    attack: 3,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/waterpuddle.png",
    rarity: "rare",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: All friendly demons gain +1 HP`    },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        for (let i=0; i < array.length; i++) {
            stateObj = await giveDemonStats(stateObj, playerObj, i, "currentHP", 1)
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
    currentHP: 6,
    maxHP: 6,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    lifeGain: 5,
    text: (state, index, array) => { return `End of Turn: Summoner gains ${array[index].lifeGain} Life` },
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: true,
    lifeGain: 5,
    text: (state, index, array) => { return `Your "End of Turn" effects trigger twice"` },
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: true,
    lifeGain: 5,
    text: (state, index, array) => { return `Your "When Played" effects trigger twice"` },
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: true,
    lifeGain: 5,
    text: (state, index, array) => { return `Your "On Death" effects trigger twice"` },
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Heal ALL minions to full HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },     
    action: async (stateObj, index, array, playerObj) => {
      await executeAbility(playerObj.name, playerObj.monstersInPlay.length-1)
      for (let i = 0; i < stateObj.player.monstersInPlay.length; i++) {
        let missingHP = stateObj.player.monstersInPlay[i].maxHP - stateObj.player.monstersInPlay[i].currentHP
        missingHP = (missingHP >= 0) ? missingHP : 0
        stateObj = await healMinion(stateObj, stateObj.player, i, missingHP)
      }
      for (let i = 0; i < stateObj.opponent.monstersInPlay.length; i++) {
        let missingHP = stateObj.opponent.monstersInPlay[i].maxHP - stateObj.opponent.monstersInPlay[i].currentHP
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
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 2,
    text: (state, index, array) => { return `On Death: Summoner gains ${array[index].lifeGain} Life`  },
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
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 3,
    text: (state, index, array) => { return `When Played: Summoner gains ${array[index].lifeGain} Life`  },
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 1,
    text: (state, index, array) => { return `When Played: Summoner gains ${array[index].lifeGain} Life`  },
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
    currentHP: 1,
    maxHP: 1,
    avatar: "img/plant1.png",
    canAttack: false,
    lifeGain: 1,
    text: (state, index, array) => { return `On Death: Summoner gains ${array[index].lifeGain} Life`  },
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
    attack: 4,
    currentHP: 5,
    maxHP: 5,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `On Play: Heal all friendly minions to full HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => {
        let monsterArray = (playerObj.name === "player") ? stateObj.player.monstersInPlay : stateObj.opponent.monstersInPlay 
        await executeAbility(playerObj.name, playerObj.monstersInPlay.length)
        for (let i = 0; i < monsterArray.length; i++) {
          let missingHP = monsterArray[i].maxHP - monsterArray[i].currentHP
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
    currentHP: 8,
    maxHP: 8,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Heal all friendly minions to full HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    endOfTurn: async (stateObj, index, array, playerObj) => {
        await executeAbility(playerObj.name, playerObj.monstersInPlay.length)
        for (let i = 0; i < monsterArray.length; i++) {
          let missingHP = monsterArray[i].maxHP - monsterArray[i].currentHP
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
    currentHP: 8,
    maxHP: 8,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => {return `On Play: set friendly minions' attack to be equal to their HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },   
    action: async (stateObj, index, array, playerObj) => {
      for (let i = 0; i < playerObj.monstersInPlay.length; i++) {
        let attackToAdd = playerObj.monstersInPlay[i].currentHP - playerObj.monstersInPlay[i].attack
        stateObj = await giveDemonStats(stateObj, playerObj, i, "attack", attackToAdd)
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => {return `End of Turn: Deal damage to the opponent equal to this minion's HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },  
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
            let opponent = (playerObj.name === "player") ? newState.opponent : newState.player
            opponent.currentHP -= playerInside.monstersInPlay[index].currentHP // + stateObj.playerInside.earthDamage
        })
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
    currentHP: 4,
    maxHP: 4,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => {return `End of Turn: Deal damage to the opponent equal to this minion's HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },  
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
            let opponent = (playerObj.name === "player") ? newState.opponent : newState.player
            opponent.currentHP -= playerInside.monstersInPlay[index].currentHP // + stateObj.playerInside.earthDamage
        })
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
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => {return `End of Turn: Another friendly minion gains HP equal to this minion's HP ` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    endOfTurn: async (stateObj, index, array, playerObj) => {
        let randIndex = await pickRandomOtherIndex(array, index)
        stateObj = (randIndex !== false) ? await giveDemonStats(stateObj, playerObj, randIndex, "currentHP", ) : stateObj
        return stateObj
    }
  };

  let deepseasquid = {
    name: "Deep Sea Squid",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 2,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Double this minion's HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        let missingHP = array[index].maxHP - array[index].currentHP
        stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHP", array[index].currentHP, false, "maxHP", ((missingHP > array[index].currentHP) ? 0 : array[index].currentHP-missingHP))
        return stateObj;
    },
  };

  let bellcasterdeity = {
    name: "Bellcaster Deity",
    elementType: "earth",
    cardType: "minion",
    baseCost: 4,
    attack: 4,
    currentHP: 5,
    maxHP: 5,
    potCounter: 0,
    avatar: "img/plant1.png",
    anAttack: false,
    text: (state, index, array) => { return `When Played: Your other minions double their HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      let array2 = playerObj.monstersInPlay
      for (let i = 0; i < array.length; i++) {
        let lostHP = array[i].maxHP - array[i].currentHP
        stateObj = await giveDemonStats(stateObj, playerObj, i, "currentHP", array2[i].currentHP, false, "maxHP", ((lostHP > array2[i].currentHP) ? 0 : array2[i].currentHP-lostHP))
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
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Give a random friendly minion +2 HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },  
    action: async (stateObj, index, array, playerObj) => {
      let randIndex = await pickRandomOtherIndex(array, index)
      stateObj = (randIndex !== false) ? await giveDemonStats(stateObj, playerObj, randIndex, "currentHP", 2, false, "maxHP", 2) : stateObj
      return stateObj
    }
  };

  let kindspirit = {
    name: "Kind Spirit",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 4,
    currentHP: 6,
    maxHP: 6,
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
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If player's health is 30 or more, gain +3/+3` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await giveDemonStats(stateObj, playerObj, index, "currentHP", 3, false, "maxHP", 3, "attack", 3)
        return stateObj;
    },
  };

  let lifegiver = {
    name: "Life Giver",
    elementType: "earth",
    cardType: "minion",
    baseCost: 3,
    attack: 2,
    currentHP: 4,
    maxHP: 4,
    lifeGain: 4,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Both players gain 4 life`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await gainLife(stateObj, player, array[index].lifeGain)
        stateObj = await gainLife(stateObj, opponent, array[index].lifeGain)
        return stateObj;
    },
  };

  let hypedjinn = {
    name: "Hype Djinn",
    elementType: "earth",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Double the HP of your highest HP minion` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        let missingHP = 0
        if (player.monstersInPlay.length > 1) {
            let maxHPIndex = false;
            let maxHP = 0;
            for (let i=0; i < player.monstersInPlay.length-1; i++) {
                if (player.monstersInPlay[i].currentHP > maxHP) {
                    maxHP = player.monstersInPlay[i].currentHP
                    maxHPIndex = i
                    missingHP = player.monstersInPlay[i].maxHP - player.monstersInPlay[i].currentHP
                }
            }
            await giveDemonStats(stateObj, playerObj, maxHPIndex, "currentHP", maxHP, false, "maxHP", maxHP)
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 25 health, gain +2/+2` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentHP >= 25) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHP", 2, false, "maxHP", 2, "attack", 2)
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 25 health, gain +2/+2` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentHP >= 25) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHP", 2, false, "maxHP", 2, "attack", 2)
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
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 25 health, double this minion's HP` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentHP >= 25) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHP", array[index].currentHP, false, "maxHP", array[index].currentHP)
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
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 20 health, gain +1/+2` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].currentHP >= 20) {
            stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHP", 2, false, "maxHP", 2, "attack", 1)
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
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Gain +3 HP`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await giveDemonStats(stateObj, playerObj, index,  "currentHP", 3, false, "maxHP", 3)
      return stateObj;
    }
  };

  let europesspectre = {
    name: "Europe's Specture",
    elementType: "earth",
    cardType: "minion",
    baseCost: 5,
    attack: 4,
    currentHP: 7,
    maxHP: 7,
    avatar: "img/waterpuddle.png", 
    canAttack: false,
    text: (state, index, array) => { return `When Played: Set HP of all friendly minions to that of your highest HP minion`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },    
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        if (player.monstersInPlay.length > 1) {
            let maxHPIndex = false;
            let maxHP = 0;
            for (let i=0; i < player.monstersInPlay.length-1; i++) {
                if (player.monstersInPlay[i].currentHP > maxHP) {
                    maxHP = player.monstersInPlay[i].currentHP
                    maxHPIndex = i
                }
            }
            for (let i=0; i < player.monstersInPlay.length-1; i++) {
                if (i !== maxHPIndex) {
                    let amountToGain = maxHP - player.monstersInPlay[i].currentHP
                    stateObj = await giveDemonStats(stateObj, playerObj, i,  "currentHP", amountToGain, false, "maxHP", amountToGain)
                }   
            }
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };