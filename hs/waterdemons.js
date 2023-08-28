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
//oyster god - 3 1/6, end of turn owner  gains 5 HP
//purifiedoverlord  - 6 5/8, end of turn heal all friendly minions to full 

let tiderider = {
    name: "Tide Rider",
    type: "earth",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Gain +1 HP` 
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
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.monstersInPlay[index].currentHP += 1;
        player.monstersInPlay[index].maxHP += 1;
      })
      return stateObj;
    }
  };

  let greatoysterspirit = {
    name: "Great Oyster Spirit",
    type: "earth",
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
      return `End of Turn: owner gains 2 Life` 
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
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 2;
      })
      return stateObj;
    }
  };

  let tidepoollurker = {
    name: "Tidepool Lurker",
    type: "earth",
    baseCost: 2,
    attack: 2,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Gain +1 HP` 
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
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.monstersInPlay[index].currentHP += 1;
        player.monstersInPlay[index].maxHP += 1;
      })
      return stateObj;
    }
  };

  let kelpspirit = {
    name: "Kelp Spirit",
    type: "earth",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Give another friendly demon +1 HP` 
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
            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                if (playerObj.monstersInPlay.length > 1) {
                    let targetIndex = Math.floor(Math.random() * (player.monstersInPlay.length));
        
                    if (targetIndex !== index) {
                        player.monstersInPlay[targetIndex].currentHP +=1;
                        player.monstersInPlay[targetIndex].maxHP +=1;
                    } else {
                        if (targetIndex === 0) {
                            player.monstersInPlay[targetIndex+1].currentHP +=1;
                            player.monstersInPlay[targetIndex+1].maxHP +=1;
                        } else {
                            player.monstersInPlay[targetIndex-1].currentHP +=1;
                            player.monstersInPlay[targetIndex-1].maxHP +=1;
                        }
                    }
                }
              })
            return stateObj
        }
  };

  let poseidon = {
    name: "Poseidon",
    type: "earth",
    baseCost: 4,
    attack: 3,
    currentHP: 4,
    maxHP: 1,
    avatar: "img/waterpuddle.png",
    rarity: "rare",
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: All friendly demons gain +1 HP` 
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
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        for (let i=0; i < player.monstersInPlay.length; i++) {
            player.monstersInPlay[i].currentHP +=1
            player.monstersInPlay[i].maxHP +=1
        }
      })
      return stateObj;
    }
  };

  let oystergod = {
    name: "Oyster God",
    type: "earth",
    baseCost: 3,
    attack: 1,
    currentHP: 6,
    maxHP: 6,
    avatar: "img/waterpuddle.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `Can attack immediately. End of Turn: owner gains 5 Life` 
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
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 5;
      })
      return stateObj;
    }
  };

  let healingspring = {
    name: "Healing Spring",
    type: "earth",
    baseCost: 3,
    attack: 3,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: Heal all minions to full HP`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)

      for (let i = 0; i < stateObj.player.monstersInPlay.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
            newState.player.monstersInPlay[i].currentHP = newState.player.monstersInPlay[i].maxHP
        })
      }

      for (let i = 0; i < stateObj.opponent.monstersInPlay.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
            newState.opponent.monstersInPlay[i].currentHP = newState.opponent.monstersInPlay[i].maxHP
        })
      }
      
      //await pause(250)
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };


  let sacrificialsprite = {
    name: "Sacrificial Sprite",
    type: "earth",
    rarity: "rare",
    baseCost: 2,
    attack: 3,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `On Death: Owner gains 2 Life`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)

      return stateObj;
    },

    onDeath: async (stateObj, index, array, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
            let player = (playerObj.name === "player") ? newState.player : newState.opponent
            player.currentHP += 2;
        })
          
          //await pause(250)
        return stateObj;
      }
  };

  let forestnymph = {
    name: "Forest Nymph",
    type: "earth",
    rarity: "rare",
    baseCost: 2,
    attack: 2,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When played: Hero gains 3 Life`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 3;
    })
      stateObj = await changeState(stateObj)

      return stateObj;
    },
  };

  let woodsprite = {
    name: "Wood Sprite",
    type: "earth",
    rarity: "rare",
    baseCost: 1,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When played: Hero gains 1 Life`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.currentHP += 1;
    })
      stateObj = await changeState(stateObj)

      return stateObj;
    },
  };

  let deityoflight = {
    name: "Deity of Light",
    type: "earth",
    baseCost: 4,
    attack: 4,
    currentHP: 5,
    maxHP: 5,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `On Play: Heal all friendly minions to full HP`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)

      let playerOutside = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
      for (let i = 0; i < playerOutside.monstersInPlay.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
            let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
            playerInside.monstersInPlay[i].currentHP = playerInside.monstersInPlay[i].maxHP
        })
      }

      //await pause(250)
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let purifiedoverlord = {
    name: "Purified Overlord",
    type: "earth",
    baseCost: 6,
    attack: 5,
    currentHP: 8,
    maxHP: 8,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Heal all friendly minions to full HP`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)

      let playerOutside = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
      for (let i = 0; i < playerOutside.monstersInPlay.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
            let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
            playerInside.monstersInPlay[i].currentHP = playerInside.monstersInPlay[i].maxHP
        })
      }

      //await pause(250)
      stateObj = await changeState(stateObj)
      return stateObj;
    },

    endOfTurn: async (stateObj, index, array, playerObj) => {
  
        let playerOutside = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        for (let i = 0; i < playerOutside.monstersInPlay.length; i++) {
          stateObj = immer.produce(stateObj, (newState) => {
              let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
              playerInside.monstersInPlay[i].currentHP = playerInside.monstersInPlay[i].maxHP
          })
        }
  
        //await pause(250)
        stateObj = await changeState(stateObj)
        return stateObj;
      },
  };

  let corruptingspirit = {
    name: "Corrupting Spirit",
    type: "earth",
    baseCost: 6,
    attack: 5,
    currentHP: 8,
    maxHP: 8,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `On Play: set friendly minions' attack to be equal to their HP  `  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)

      let playerOutside = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
      for (let i = 0; i < playerOutside.monstersInPlay.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
            let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
            playerInside.monstersInPlay[i].attack = playerInside.monstersInPlay[i].currentHP
        })
      }

      //await pause(250)
      stateObj = await changeState(stateObj)
      return stateObj;
    },

  };

  let poisonousswamp = {
    name: "Poisonous Swamp",
    type: "earth",
    baseCost: 2,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/plant1.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Deal damage to the opponent equal to this minion's HP`  
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
  
        stateObj = immer.produce(stateObj, (newState) => {
            let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
            let opponent = (playerObj.name === "player") ? newState.opponent : newState.player
            opponent.currentHP -= playerInside.monstersInPlay[index].currentHP
        })
  
        //await pause(250)
        stateObj = await changeState(stateObj)
        return stateObj;
      },
  };

  let spreadingblessing = {
    name: "Spreading Blessing",
    type: "earth",
    baseCost: 3,
    attack: 2,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Another friendly minion gains HP equal to this minion's HP `  
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
        stateObj = immer.produce(stateObj, (newState) => {
            let player = (playerObj.name === "player") ? newState.player : newState.opponent
            if (playerObj.monstersInPlay.length > 1) {
                let targetIndex = Math.floor(Math.random() * (player.monstersInPlay.length));
    
                if (targetIndex !== index) {
                    player.monstersInPlay[targetIndex].currentHP += player.monstersInPlay[index].currentHP;
                    player.monstersInPlay[targetIndex].maxHP += player.monstersInPlay[index].currentHP;
                } else {
                    if (targetIndex === 0) {
                        player.monstersInPlay[targetIndex+1].currentHP += player.monstersInPlay[index].currentHP;
                        player.monstersInPlay[targetIndex+1].maxHP += player.monstersInPlay[index].currentHP;
                    } else {
                        player.monstersInPlay[targetIndex-1].currentHP += player.monstersInPlay[index].currentHP;
                        player.monstersInPlay[targetIndex-1].maxHP += player.monstersInPlay[index].currentHP;
                    }
                }
            }
          })
        return stateObj
    }
  };



  let waterelemental = {
    name: "Water Elemental",
    type: "earth",
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

  let waterelemental2 = {
    name: "Water Elemental",
    type: "earth",
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

  let waterelemental3 = {
    name: "Water Elemental",
    type: "earth",
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

  let bellcasterdeity = {
    name: "Bellcaster Deity",
    type: "earth",
    baseCost: 4,
    attack: 4,
    currentHP: 5,
    maxHP: 5,
    potCounter: 0,
    avatar: "img/plant1.png",
  
    canAttack: true,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: Your other minions double their HP`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)

      let playerOutside = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
      for (let i = 0; i < playerOutside.monstersInPlay.length-1; i++) {
            stateObj = await immer.produce(stateObj, async (newState) => {
                let playerInside = (playerObj.name === "player") ? newState.player : newState.opponent
                playerInside.monstersInPlay[i].currentHP *= 2
                playerInside.monstersInPlay[i].maxHP *= 2
            })
            await changeState(stateObj)
      }
      return stateObj
    },
    
  };

  let healerimp = {
    name: "Healer Imp",
    type: "earth",
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
      return `When Played: Give a random friendly minion +2 HP`  
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      
      stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
      stateObj = await changeState(stateObj)

      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        let targetIndex = Math.floor(Math.random() * player.monstersInPlay.length-1);
        player.monstersInPlay[targetIndex].currentHP += 2;
      })
      stateObj = await changeState(stateObj)
      return stateObj;
    },
  };

  let kindspirit = {
    name: "Kind Spirit",
    type: "earth",
    baseCost: 3,
    attack: 4,
    currentHP: 6,
    maxHP: 6,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: give opponent +4 Life` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        stateObj = immer.produce(stateObj, (newState) => {
            let opponent = (playerObj.name === "player") ? newState.opponent : newState.player
            opponent.currentHP += 4;
          })
        return stateObj;
    },
  };

  let empoweredspirit = {
    name: "Kind Spirit",
    type: "earth",
    baseCost: 4,
    attack: 4,
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If player's health is 30 or more, gain +3/+3` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        stateObj = immer.produce(stateObj, (newState) => {
            let player = (playerObj.name === "player") ? newState.player : newState.opponent
            if (player.currentHP >= 30) {
                player.monstersInPlay[player.monstersInPlay.length-1].attack  += 3;
                player.monstersInPlay[player.monstersInPlay.length-1].currentHP  += 3;
                player.monstersInPlay[player.monstersInPlay.length-1].maxHP  += 3;
            }
          })
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let lifegiver = {
    name: "Life Giver",
    type: "earth",
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
      return `When Played: Both players gain 4 life` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        stateObj = await changeState(stateObj)
        stateObj = immer.produce(stateObj, (newState) => {
            newState.player.currentHP += 4
            newState.opponent.currentHP += 4
          })
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let hypedjinn = {
    name: "Hype Djinn",
    type: "earth",
    baseCost: 2,
    attack: 1,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: Double the HP of your highest HP minion` 
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
            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                player.monstersInPlay[maxHPIndex].currentHP += maxHP
                player.monstersInPlay[maxHPIndex].maxHP += maxHP
              })
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let lightbornimp = {
    name: "Lightborn Imp",
    type: "earth",
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
      return `When Played: If you have at least 25 health, gain +2/+2` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        if (player.currentHP >= 25) {
            let newDemon = {...array[index]}
            newDemon.attack += 2
            newDemon.currentHP +=2
            newDemon.maxHP += 2

            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                player.currentEnergy -= array[index].baseCost
            })
            stateObj = await summonDemon(stateObj, newDemon, playerObj)
        } else {
            stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let fragilespirit= {
    name: "Fragile Spirit",
    type: "earth",
    baseCost: 3,
    attack: 4,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If you have at least 25 health, double this minion's HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        if (player.currentHP >= 25) {
            let newDemon = {...array[index]}
            newDemon.currentHP += newDemon.currentHP
            newDemon.maxHP += newDemon.maxHP

            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                player.currentEnergy -= array[index].baseCost
            })
            stateObj = await summonDemon(stateObj, newDemon, playerObj)
        } else {
            stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let minorfragile = {
    name: "Minor Fragile",
    type: "earth",
    baseCost: 2,
    attack: 3,
    currentHP: 3,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If you have at least 25 health, double this minion's HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        if (player.currentHP >= 25) {
            let newDemon = {...array[index]}
            newDemon.currentHP += newDemon.currentHP
            newDemon.maxHP += newDemon.maxHP

            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                player.currentEnergy -= array[index].baseCost
            })
            stateObj = await summonDemon(stateObj, newDemon, playerObj)
        } else {
            stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let cowardlyspirit = {
    name: "Cowardly Spirit",
    type: "earth",
    baseCost: 4,
    attack: 4,
    currentHP: 5,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If you have at least 20 health, gain +1/+2` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        if (player.currentHP >= 25) {
            let newDemon = {...array[index]}
            newDemon.attack += 1
            newDemon.currentHP +=2
            newDemon.maxHP += 2

            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                player.currentEnergy -= array[index].baseCost
            })
            stateObj = await summonDemon(stateObj, newDemon, playerObj)
        } else {
            stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let  = {
    name: "Cowardly Spirit",
    type: "earth",
    baseCost: 4,
    attack: 4,
    currentHP: 5,
    maxHP: 3,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: If you have at least 25 health, gain +1/+2` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
        let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
        if (player.currentHP >= 25) {
            let newDemon = {...array[index]}
            newDemon.attack += 1
            newDemon.currentHP +=2
            newDemon.maxHP += 2

            stateObj = immer.produce(stateObj, (newState) => {
                let player = (playerObj.name === "player") ? newState.player : newState.opponent
                player.currentEnergy -= array[index].baseCost
            })
            stateObj = await summonDemon(stateObj, newDemon, playerObj)
        } else {
            stateObj = await playDemonFromHand(stateObj, index, playerObj, 500)
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };

  let risingtsunami = {
    name: "Rising Tsunami",
    type: "earth",
    rarity: "legendary",
    baseCost: 5,
    attack: 5,
    currentHP: 5,
    maxHP: 5,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `End of Turn: Gain +3 HP` 
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
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        player.monstersInPlay[index].currentHP += 3;
        player.monstersInPlay[index].maxHP += 3;
      })
      return stateObj;
    }
  };

  let europesspectre = {
    name: "Europe's Specture",
    type: "earth",
    baseCost: 5,
    attack: 4,
    currentHP: 7,
    maxHP: 7,
    avatar: "img/waterpuddle.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `When Played: Set HP of all friendly minions to that of your highest HP minion` 
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

            for (let i=0; i < player.monstersInPlay.length-1; i++) {
                stateObj = immer.produce(stateObj, (newState) => {
                    let player = (playerObj.name === "player") ? newState.player : newState.opponent
                    player.monstersInPlay[i].currentHP = maxHP
                    player.monstersInPlay[i].maxHP = maxHP
                  })
            }

            
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    },
  };