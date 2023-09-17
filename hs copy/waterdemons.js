//1 - summon on death
//2 - add cards to hand
//3 - summon 1/1 flood, 2/2 flood, etc
//4 - gain effects when board has lots of minions
//

//gain attack/health for each other minion (for earth and fire)

//earth-water synergies:
//water summons minions if health is high enough
//water summons copies of high-health minions

//earth has cards that gain health for each minion
//earth has cards that gain health when other minions are summoned

//fire has cards that gain attack for each minion
//fire has cards that gain attack when other minions are summoned
//fire has cards that deal damage when minions are sacrificed

let beaverspirit = {
    name: "Beaver Spirit",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you control another Beaver Spirit, summon a 4/4 Dam Spirit`},
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (stateObj[playerObj.name].monstersInPlay.filter(monster => (monster.name === "Beaver Spirit")).length > 1) {
            stateObj = await createNewMinion(stateObj, playerObj, 4, 4, 4, 4, name="Dam Spirit", minion=potgrowth)
        }
        return stateObj;
    },
  };

  let treespirit = {
    name: "Tree Spirit",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    deathCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at 25 Life, summon a 2/2 Sappling Spirit` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (playerObj.currentLife >= (25 - playerObj.lifeRequirementReduction)) {
            stateObj = await createNewMinion(stateObj, playerObj, 2, 2, 2, 2, name="Sappling Spirit", minion=potgrowth)
        }
        return stateObj;
    },
  };

  let attunednaturalist = {
    name: "Attuned Naturalist",
    elementType: "water",
    cardType: "minion",
    baseCost: 3,
    attack: 2,
    currentHealth: 4,
    maxHealth: 4,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at 30 Life, summon a 6/6 Sappling Spirit` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (playerObj.currentLife >= (25 - playerObj.lifeRequirementReduction)) {
            stateObj = await createNewMinion(stateObj, playerObj, 6, 6, 6, 6, name="Sappling Spirit", minion=potgrowth)
        }
        return stateObj;
    },
  };

let tinyhydra = {
    name: "Tiny Hydra",
    elementType: "water",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 1,
    maxHealth: 1,
    deathCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `On Death: Summon a ${2+array[index].deathCounter}/${2+array[index].deathCounter} copy of this minion`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    onDeath: async (stateObj, index, array, playerObj) => {
        let newDeathCounter = (array[index].deathCounter + 1)
        let increaseVal = newDeathCounter + 1
        newDemon = await createNewMinion(stateObj, playerObj, increaseVal, increaseVal, increaseVal, increaseVal, name=array[index].name, minion=array[index], 500, "deathCounter", newDeathCounter, stateChange=false)
        stateObj = immer.produce(stateObj, (newState) => {
            let player = (playerObj.name === "player") ? newState.player : newState.opponent
            player.monstersInPlay.push(newDemon)
          })
        return stateObj;
    }
  };

  let imprecruiter = {
    name: "Imp Recruiter",
    elementType: "water",
    cardType: "minion",
    baseCost: 3,
    attack: 1,
    currentHealth: 6,
    maxHealth: 6,
    impCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Summon a ${1+array[index].impCounter}/${1+array[index].impCounter} Imp`    },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        newDemon = await createNewMinion(stateObj, playerObj, 1, 1, 1, 1, name="Imp", potgrowth, 500, false, 1, false)
        stateObj = await summonDemon(stateObj, newDemon, playerObj)
        return stateObj;
      }
  };

  let birthingpot = {
    name: "Birthing Pot",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 0,
    currentHealth: 1,
    maxHealth: 1,
    potCounter: 0,
    avatar: "img/plant1.png",  
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: Summon a ${1+array[index].potCounter}/${1+array[index].potCounter} Pot Growth`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        newDemon = await createNewMinion(stateObj, playerObj, 1, 1, 1, 1, name="Pot Growth", potgrowth, 500, false, 1, false)
        stateObj = await summonDemon(stateObj, newDemon, playerObj)
        return stateObj;
    }
  };

  let gnometwins = {
    name: "Twin Eels",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 1,
    maxHealth: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: summon another Twin Eel`   },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      stateObj = await summonDemon(stateObj, array[index], playerObj, 500)
      return stateObj;
    },
  };

  let schoolleader = {
    name: "School Leader",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 3,
    maxHealth: 3,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: If you have at least 2 other minions, summon a 1/1 fish` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        if (playerObj.monstersInPlay.length >= 3) {
            stateObj = await createNewMinion(stateObj, playerObj, 1, 1, 1, 1, name="Fish")
        }
        return stateObj;
    },
  };

  let golemmaker = {
    name: "Golem Maker",
    elementType: "water",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/waterpuddle.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: Summon a 1/1 pot growth. It gets +1/+1 for each other minion.`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        let val = playerObj.monstersInPlay.length-1
        stateObj = await createNewMinion(stateObj, playerObj, val, val, val, val, name="Pot Growth")
        return stateObj;
    },
  };

  let bluefish = {
    name: "Blue Fish",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return ``  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  };
  
  let redfish = {
    name: "Red Fish",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: add a Blue Fish to your hand`   },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      stateObj = await addCardToHand(stateObj, playerObj, bluefish)
      return stateObj;
    },
  };

  let randomfish = {
    name: "Random Fish",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: add a random water minion to your hand`   },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      stateObj = await addCardToHand(stateObj, playerObj, waterMinionsTemp[Math.floor(Math.random() * waterMinionsTemp.length)])
      return stateObj;
    },
  };

  let spreadingfungi = {
    name: "Spreading Fungi",
    elementType: "water",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 1,
    maxHealth: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `End of Turn: summon a copy of this`    },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await summonDemon(stateObj, array[index], playerObj, 500, false)
        stateObj = await changeState(stateObj)
        return stateObj;
      }

  };

  let proudmama = {
    name: "Proud Mama",
    elementType: "water",
    cardType: "minion",
    baseCost: 4,
    attack: 1,
    currentHealth: 2,
    maxHealth: 2,
    potCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: summon a copy of your highest HP minion`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, arrayObj, playerObj) => {        
        let array = (playerObj.name === "player") ? stateObj.player.monstersInPlay : stateObj.opponent.monstersInPlay
        if (array.length > 1) {
            let maxHealthIndex = false;
            let maxHealth = 0;
            for (let i=0; i < array.length-1; i++) {
                if (array[i].currentHealth > maxHealth) {
                    maxHealth = array[i].currentHealth
                    maxHealthIndex = i
                }
            }
            stateObj = await summonDemon(stateObj, array[maxHealthIndex], playerObj, 500)
        }
        return stateObj;
    },
  };

  let ashamedmama = {
    name: "Ashamed Mama",
    elementType: "water",
    cardType: "minion",
    baseCost: 4,
    attack: 3,
    currentHealth: 2,
    maxHealth: 2,
    potCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: summon a copy of your lowest HP minion`  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; }, 
    action: async (stateObj, index, arrayObj, playerObj) => {        
        let array = (playerObj.name === "player") ? stateObj.player.monstersInPlay : stateObj.opponent.monstersInPlay
        if (array.length > 1) {
            let maxHealthIndex = false;
            let maxHealth = 1000000;
            for (let i=0; i < array.length-1; i++) {
                if (array[i].currentHealth < maxHealth) {
                    maxHealth = array[i].currentHealth
                    maxHealthIndex = i
                }
            }
            stateObj = await summonDemon(stateObj, array[maxHealthIndex], playerObj, 500)
        }
        return stateObj;
    },
  };

  let potgrowth = {
    name: "Pot Growth",
    elementType: "water",
    cardType: "minion",
    baseCost: 1,
    attack: 1,
    currentHealth: 1,
    maxHealth: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return ``  },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
  };

  let herbalistimp = {
    name: "Herbalist Imp",
    elementType: "water",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 1,
    maxHealth: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: summon two 1/1 Pot Growths`    },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      stateObj = await summonDemon(stateObj, potgrowth, playerObj, 500)
      stateObj = await summonDemon(stateObj, potgrowth, playerObj, 500)
      return stateObj;
    },
  };

  let impcub = {
    name: "Imp Cub",
    elementType: "water",
    cardType: "minion",
    baseCost: 2,
    attack: 1,
    currentHealth: 1,
    maxHealth: 1,
    avatar: "img/plant1.png",
    canAttack: false,
    text: (state, index, array) => { return `When Played: summon a 2/2 Pot Growths`   },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await createNewMinion(stateObj, playerObj, 2, 2, 2, 2, name="Pot Growth")
      return stateObj;
    },
  };

  let waterMinionsTemp = [
    //5 - 1 mana - 
    gnometwins, birthingpot, beaverspirit, redfish, schoolleader, randomfish,
    //5 - 2 mana - 
    tinyhydra, spreadingfungi, impcub, herbalistimp, golemmaker,
    //3 mana - 
    attunednaturalist, imprecruiter, 
    //4 mana - 
    proudmama, ashamedmama,
]