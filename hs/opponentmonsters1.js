
//common - 5
//waverider - 1/1, +1HP eot
//oysterspirit - 1/1, +1 life
//tidepool lurker - 2 2/2, eot +1 hp
//kelp spirit - 1 1/2, eot give another +1
//great oyster spirit - 2 1/2, eot +2 Life

//rare
//tiderider - 1/2, +1HP eot
// 4 mana - 4/4 Restore all minions to full health
//sacrificial sprite - 2 3/1, on death: +2 life
//healing spring - 3 3/3, on play: heal all minions to full

//epic 
//poseidon - 4 3/4, all minions end of turn +1

//deity of light - 4 4/5; on play: hael all friendly minions to full


//legendary
//oyster god - 3 1/6, end of turn owner  gains 5 HP
//purifiedOverlord  - 6 5/8, end of turn heal all friendly minions to full 



let waverider = {
    name: "Wave Rider",
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
      return `End of Turn: Gains +1 HP` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(tiderider)
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

  let tiderider = {
    name: "Tide Rider",
    type: "water",
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(tiderider)
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

  let oysterspirit = {
    name: "Oyster Spirit",
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
      return `End of Turn: owner gains 1 Life` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(oysterspirit)
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

  let greatoysterspirit = {
    name: "Great Oyster Spirit",
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
      return `End of Turn: owner gains 2 Life` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(greatoysterspirit)
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

  let tidepoollurker = {
    name: "Tidepool Lurker",
    type: "water",
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(tidepoollurker)
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

  let kelpspirit = {
    name: "Kelp Spirit",
    type: "water",
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(kelpspirit)
        player.currentEnergy -=array[index].baseCost;
      })
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
    type: "water",
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(poseidon)
        player.currentEnergy -=array[index].baseCost;
      })
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
    type: "water",
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(oystergod)
        player.currentEnergy -=array[index].baseCost;
      })
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
    type: "water",
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
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
    type: "water",
    rarity: "rare",
    baseCost: 2,
    attack: 3,
    currentHP: 1,
    maxHP: 1,
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
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

  let deityoflight = {
    name: "Deity of Light",
    type: "water",
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
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
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
    type: "water",
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
        
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
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