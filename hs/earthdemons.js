


let beaverspirit = {
    name: "Beaver Spirit",
    type: "Water",
    baseCost: 1,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    deathCounter: 0,
    avatar: "img/plant1.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If you have at 25 Life, summon a 2/2 Dam`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        if (playerObj.currentHP >= 25) {
            stateObj = await createPot(stateObj, playerObj, attack=1, currentHP=1, baseCost=1, maxHP=1, name="River Dam", pauseTime=500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let attunedNaturalist = {
    name: "Attuned Naturalist",
    type: "Water",
    baseCost: 3,
    attack: 2,
    currentHP: 4,
    maxHP: 4,
    avatar: "img/plant1.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If you have at 30 Life, summon a 6/6 Pot Growth`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        if (playerObj.currentHP >= 30) {
            let newpot = {...potgrowth}
            newpot.attack += 5
            newpot.currentHP += 5
            newpot.baseCost += 5
            newpot.maxHP += 5
            stateObj = await summonDemon(stateObj, newpot, playerObj, 500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };



let tinyhydra = {
    name: "Tiny Hydra",
    type: "Water",
    baseCost: 2,
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

  let imprecruiter = {
    name: "Imp Recruiter",
    type: "earth",
    baseCost: 3,
    attack: 1,
    currentHP: 6,
    maxHP: 6,
    impCounter: 0,
    avatar: "img/plant1.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Summon a ${1+array[index].impCounter}/${1+array[index].impCounter} Imp`  
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
        let newpot = {...potgrowth}
        newpot.name = "Imp"

        stateObj = await summonDemon(stateObj, newpot, playerObj)
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

  let gnometwins = {
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
      return `When Played: summon another Gnome Twin`  
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

  let schoolleader = {
    name: "School Leader",
    type: "water",
    baseCost: 1,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If you have at least 2 other minions, summon a 1/1 fish` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        if (playerObj.monstersInPlay.length >= 2) {
            let newDemon = {...potgrowth}
            newDemon.name = "Fish"
            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                player.currentEnergy -= array[index].baseCost
            })
            stateObj = await summonDemon(stateObj, newDemon, playerObj)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let golemmaker = {
    name: "Golem Maker",
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
      return `When Played: Summon a 1/1 pot growth. It gets +1/+1 for each other minion.` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        let newDemon = {...potgrowth}
        console.log("mip quals " + player.monstersInPlay.length)
        newDemon.attack += player.monstersInPlay.length-1
        newDemon.currentHP += player.monstersInPlay.length-1
        newDemon.maxHP += player.monstersInPlay.length-1

        stateObj = await summonDemon(stateObj, newDemon, playerObj)
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };


  let bluefish = {
    name: "Blue Fish",
    type: "water",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
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
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };
  
  let redfish = {
    name: "Red Fish",
    type: "water",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: add a Blue Fish to your hand`  
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
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.encounterHand.push(bluefish)
      })
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let spreadingfungi = {
    name: "Spreading Fungi",
    type: "earth",
    baseCost: 2,
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
      return `End of Turn: summon a copy of this`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)
      return stateObj;
    },

    endOfTurn: async (stateObj, index, array, playerObj) => {
        stateObj = await summonDemon(stateObj, array[index], playerObj, 500, false)
        stateObj = await changeState(stateObj)
        return stateObj;
      }

  };

  let proudmama = {
    name: "Proud Mama",
    type: "earth",
    baseCost: 4,
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
      return `When Played: summon a copy of your highest HP minion`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        
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

        stateObj = await summonDemon(stateObj, player.monstersInPlay[maxHPIndex], playerObj, 500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let ashamedmama = {
    name: "Ashamed Mama",
    type: "earth",
    baseCost: 4,
    attack: 2,
    currentHP: 2,
    maxHP: 1,
    potCounter: 0,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: summon a copy of your lowest HP minion`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        
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

        stateObj = await summonDemon(stateObj, player.monstersInPlay[maxHPIndex], playerObj, 500)
        }
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
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let herbalistimp = {
    name: "Herbalist Imp",
    type: "water",
    baseCost: 2,
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
      return `When Played: summon 2 1/1 Pot Growths`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)
      stateObj = await summonDemon(stateObj, potgrowth, playerObj, 500)
      stateObj = await summonDemon(stateObj, potgrowth, playerObj, 500)
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let impcub = {
    name: "Imp Cub",
    type: "earth",
    baseCost: 2,
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/plant1.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: summon a 2/2 Pot Growths`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)
      let newpot = {...potgrowth}
      newpot.attack += 1
      newpot.currentHP += 1
      newpot.baseCost += 1
      newpot.maxHP += 1
      stateObj = await summonDemon(stateObj, newpot, playerObj, 500)
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };