let simpleImp = {
  name: "simple imp",
  baseCost: 1,
  attack: 1,
  currentHP: 2,
  maxHP: 2,
  avatar: "img/fireMonster.png",

  canAttack: true,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `Battlecry: Deal 1 damage to a random enemy` 
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerMonstersInPlay.push(simpleImp)
      if (newState.enemyMonstersInPlay.length > 0) {
        let targetIndex = Math.floor(Math.random() * (stateObj.enemyMonstersInPlay.length));
        newState.enemyMonstersInPlay[targetIndex].currentHP -=1;
      }
      newState.playerCurrentEnergy -=array[index].baseCost;
    })
    return stateObj;
  }
}

let simpleDeathrattleImp = {
  name: "dying imp",
  baseCost: 1,
  attack: 1,
  currentHP: 1,
  maxHP: 1,
  avatar: "img/fireMonster.png",

  canAttack: true,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `On Death: Deal 1 damage to a random enemy` 
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerMonstersInPlay.push(simpleDeathrattleImp)
      newState.playerCurrentEnergy -=array[index].baseCost;
    })
    return stateObj;
  },
  onDeath: async (stateObj, index, array) => {
    stateObj = immer.produce(stateObj, (newState) => {
      if (newState.enemyMonstersInPlay.length > 0) {
        let targetIndex = Math.floor(Math.random() * (stateObj.enemyMonstersInPlay.length));
        newState.enemyMonstersInPlay[targetIndex].currentHP -=1;
      }
    })
    return stateObj;
  }
}

let scalingDeathrattleImp = {
  name: "scaling imp",
  baseCost: 1,
  attack: 1,
  currentHP: 1,
  maxHP: 1,
  deathCounter: 0,
  avatar: "img/fireMonster.png",

  canAttack: true,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `On Death: Summon a ${2+array[index].deathCounter}/${2+array[index].deathCounter} copy of this minion`  
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerMonstersInPlay.push(scalingDeathrattleImp)
      newState.playerCurrentEnergy -=array[index].baseCost;
    })
    return stateObj;
  },
  onDeath: async (stateObj, index, array) => {
    let newDeathrattleImp = {...array[index]};
    newDeathrattleImp.deathCounter += 1
    newDeathrattleImp.attack = 1 + newDeathrattleImp.deathCounter
    newDeathrattleImp.currentHP = 1 + newDeathrattleImp.deathCounter
    newDeathrattleImp.maxHP = 1 + newDeathrattleImp.deathCounter
    
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerMonstersInPlay.push(newDeathrattleImp)
    })
    return stateObj;
  }
}

let growingDjinn = {
  name: "Grow",
  baseCost: 2,
  attack: 5,
  currentHP: 6,
  maxHP: 6,
  avatar: "img/flamingbaby.png",

  growProperty: 1,
  canAttack: false,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `Gain +1/+1 whenever you play a card` 
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },


  action: async (stateObj, index, array) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerMonstersInPlay.push(array[index])
      newState.playerCurrentEnergy -=array[index].baseCost;
    })
    return stateObj;
  }
}

let highHealthImp = {
  name: "high health",
  baseCost: 1,
  attack: 1,
  currentHP: 7,
  maxHP: 3,
  avatar: "img/fireMonster.png",

  canAttack: true,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `Battlecry: Give a random friendly minion +1 attack`
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerCurrentEnergy -=array[index].baseCost;
      let arrayObj = (array === stateObj.playerMonstersInPlay || array === stateObj.encounterHand) ? newState.playerMonstersInPlay : newState.enemyMonstersInPlay
      arrayObj.push(highHealthImp)
      if (arrayObj.length > 0) {
        let targetIndex = Math.floor(Math.random() * (arrayObj.length));
        arrayObj[targetIndex].attack +=1;
      }
    })
    return stateObj;
  }
}

let destroyer = {
  name: "high health",
  baseCost: 7,
  attack: 5,
  currentHP: 12,
  maxHP: 12,
  avatar: "img/fireMonster.png",

  canAttack: true,

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `Battlecry: Give a random friendly minion +1 attack`
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },
  
  action: async (stateObj, index, array) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerCurrentEnergy -=array[index].baseCost;
      let arrayObj = (array === stateObj.playerMonstersInPlay || array === stateObj.encounterHand) ? newState.playerMonstersInPlay : newState.enemyMonstersInPlay
      arrayObj.push(destroyer)
    })
    return stateObj;
  }
}



// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
//                                                          State Stuff
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 

const Status = {
  inFight: renderDivs,
  lostFight: renderLostFight,
  wonFight: renderWonFight,
  chooseEnemyMonster: renderChooseEnemy,
}

let gameStartState = {
  playerHP: 50,
  encounterDraw: [],
  playerMonstersInPlay: [],
  encounterHand: [],
  playerCurrentEnergy: 1,
  playerMaxEnergy: 1,

  currentEnemyHP: 50,
  enemyMonstersInPlay: [destroyer],
  enemyEnergy: 1,
  enemyMaxEnergy: 1,

  fightStarted: false,
  status: Status.inFight,
  playerToAttackIndex: false,
  enemyToBeAttackedIndex: false,
}


let state = {...gameStartState};
startEncounter(state)
//renderScreen(state)




async function startEncounter(stateObj) {
    stateObj = immer.produce(stateObj, (newState) => {
      newState.fightStarted = true;
      //newState.encounterDraw = [simpleImp, simpleImp, highHealthImp, highHealthImp, growingDjinn, growingDjinn];
      newState.encounterDraw = [simpleImp, scalingDeathrattleImp, simpleDeathrattleImp, highHealthImp];
      newState.status = Status.inFight
    })
    stateObj = shuffleDraw(stateObj);
    for (let h=0; h < 4; h++) {
      stateObj = await drawACard(stateObj)
    }

    await changeState(stateObj);
    return stateObj
}

async function changeState(newStateObj) {
    let stateObj = {...newStateObj}
    
    if (stateObj.status === Status.inFight) {
      if (stateObj.playerToAttackIndex !== false) {
        stateObj = await completeAttack(stateObj)
      }
      stateObj = await handleDeaths(stateObj);
    }
    state = {...stateObj}
    renderScreen(stateObj);
    return stateObj
}

async function completeAttack(stateObj) {
  console.log("completing attack")
  stateObj = immer.produce(stateObj, (newState) => {
    let AttackingMonster = newState.playerMonstersInPlay[newState.playerToAttackIndex]
    let DefendingMonster = newState.enemyMonstersInPlay[newState.enemyToBeAttackedIndex]
    DefendingMonster.currentHP -= AttackingMonster.attack
    AttackingMonster.currentHP -= DefendingMonster.attack
    AttackingMonster.canAttack = false
    newState.playerToAttackIndex = false;
    newState.enemyToBeAttackedIndex = false
  })
  await changeState(stateObj);
  return stateObj
}

// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
//                                                          Rendering Stuff
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
  async function renderScreen(stateObj) {
    let newState = {...stateObj}
    newState.status(stateObj)
  }



async function handleDeaths(stateObj) {
  //push indexes of dead monsters to an array
  if (stateObj.enemyMonstersInPlay.length > 0) {
    let indexesToDelete = [];
    stateObj.enemyMonstersInPlay.forEach(function (monster, index) {
      if (monster.currentHP <= 0) {
        console.log("opponent monster at index " + index + " has died.")
        indexesToDelete.push(index);
      }
    });
    //if a monster has died
    if (indexesToDelete.length > 0) {
      indexesToDelete.reverse()
      //await opponentDeathAnimation(indexesToDelete)

      stateObj = immer.produce(stateObj, (newState) => {
        for (let i = 0; i < indexesToDelete.length; i++) {
          newState.enemyMonstersInPlay.splice(indexesToDelete[i], 1)
        }
      });
    }
  }

    if (stateObj.currentEnemyHP <= 0) {
      stateObj = renderWonFight(stateObj)
    }

    if (stateObj.playerMonstersInPlay.length > 0) {
      let indexesToDelete = [];
      stateObj.playerMonstersInPlay.forEach(async function (monster, index) {
        if (monster.currentHP <= 0) {
          console.log("player monster at index " + index + " has died.")
          indexesToDelete.push(index);
          if (typeof(stateObj.playerMonstersInPlay[index].onDeath) === "function") {
            
            
          } 
        }
      });
      //if a monster has died
      if (indexesToDelete.length > 0) {
        indexesToDelete.reverse()
        //await opponentDeathAnimation(indexesToDelete)

        for (let i = 0; i < indexesToDelete.length; i++) {  
          stateObj = await stateObj.playerMonstersInPlay[indexesToDelete[i]].onDeath(stateObj, indexesToDelete[i], stateObj.playerMonstersInPlay);
          stateObj = await immer.produce(stateObj, async (newState) => {
              console.log("splicing " + newState.playerMonstersInPlay.length)
              newState.playerMonstersInPlay.splice(indexesToDelete[i], 1)
          });
          console.log("player monsters length " + stateObj.playerMonstersInPlay.length)
        }
      }
    }
    if (stateObj.playerHP <= 0) {
      stateObj = renderLostFight(stateObj)
    }

  return stateObj;
}

async function changeStatus(stateObj, newStatus, countsAsEventSkipForChangeStatus=false, skipGoldGift=50) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.status = newStatus;
  })
  await changeState(stateObj);
  return stateObj;
}

function renderHand(stateObj) {
  document.getElementById("handContainer2").innerHTML = "";
  if (stateObj.encounterHand.length > 0) {
    stateObj.encounterHand.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.encounterHand, index, "handContainer2", functionToAdd=false)
    });
  }
}

function renderPlayerMonstersInPlay(stateObj) {
  document.getElementById("playerMonstersInPlay").innerHTML = "";
  if (stateObj.playerMonstersInPlay.length > 0) {
    stateObj.playerMonstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.playerMonstersInPlay, index, "playerMonstersInPlay", functionToAdd=false)
    });
  }
  let endTurnButton = document.createElement("Button");
  endTurnButton.classList.add("font5vmin")
  endTurnButton.addEventListener("click", function() {
    endTurn(stateObj)
  })
  endTurnButton.textContent = "End Turn";
  document.querySelector("#playerMonstersInPlay").append(endTurnButton);
}

function renderEnemyMonstersInPlay(stateObj) {
  document.getElementById("enemyMonstersInPlay").innerHTML = "";
  if (stateObj.enemyMonstersInPlay.length > 0) {
    stateObj.enemyMonstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.enemyMonstersInPlay, index, "enemyMonstersInPlay", functionToAdd=false)
    });
  }
}

function renderEnemyMonstersToChoose(stateObj) {
  document.getElementById("enemyMonstersInPlay").innerHTML = "";
  let indexChosen = false;
  if (stateObj.enemyMonstersInPlay.length > 0) {
    stateObj.enemyMonstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.enemyMonstersInPlay, index, "enemyMonstersInPlay", functionToAdd=false)
    });
  }
}

async function renderDivs(stateObj) {
  if (stateObj.fightStarted === false) {
    console.log("triggering startEncounter bc fightStarted is false")
    stateObj = await startEncounter(stateObj);
    stateObj = immer.produce(stateObj, (newState) => {
      newState.fightStarted = true;
    })
  }

  document.getElementById("app").innerHTML = ""
  let topRow = topRowDiv(stateObj)
  let restOfScreen = renderFightDiv();
  document.querySelector("#app").append(topRow, restOfScreen);
  
  
  renderHand(stateObj);
  renderPlayerMonstersInPlay(stateObj);
  renderEnemyMonstersInPlay(stateObj);
}

async function renderChooseEnemy(stateObj) {
  document.getElementById("app").innerHTML = ""
  //let topRow = topRowDiv(stateObj, "app")
  let restOfScreen = renderFightDiv();
  document.querySelector("#app").append(restOfScreen);
  
  
  renderHand(stateObj);
  renderPlayerMonstersInPlay(stateObj);
  renderEnemyMonstersToChoose(stateObj);
}

function renderFightDiv() {
  let fightContainer = document.createElement("Div");
  fightContainer.classList.add("flex-container");
  fightContainer.setAttribute("id", "battlefield");

  let enemyMonstersDiv = document.createElement("Div");
  enemyMonstersDiv.classList.add("flex-container");
  enemyMonstersDiv.setAttribute("id", "enemyMonstersInPlay");

  let playerMonstersDiv = document.createElement("Div");
  playerMonstersDiv.classList.add("flex-container");
  playerMonstersDiv.setAttribute("id", "playerMonstersInPlay");

  let handDiv = document.createElement("Div");
  handDiv.setAttribute("id", "handContainer2");

  fightContainer.append(enemyMonstersDiv, playerMonstersDiv, handDiv);
  return fightContainer;
}

async function renderLostFight(stateObj) {
  document.getElementById("app").innerHTML = "<p>You lost the fight!</p> <button onClick=changeState(gameStartState)> Click me to retry</button>"
  //let topRow = topRowDiv(stateObj, "app")
}

async function renderWonFight(stateObj) {
  document.getElementById("app").innerHTML = "<p>You won the fight!</p> <button onClick=changeState(gameStartState)> Click me to retry</button>"
  //let topRow = topRowDiv(stateObj, "app")
}


function renderCard(stateObj, cardArray, index, divName=false, functionToAdd=false) {
    let cardObj = cardArray[index];
    let cardDiv = document.createElement("Div");
          cardDiv.id = "card-index-"+index;
          cardDiv.classList.add("card");
  
          let topCardRowDiv = document.createElement("Div");
          topCardRowDiv.classList.add("card-top-row")
          let cardName = document.createElement("H3");
          cardName.textContent = cardObj.name;
          
          let cardCost = document.createElement("H3")
          if (typeof cardObj.cost === 'function') {
            cardCost.textContent = cardObj.cost(stateObj, index, cardArray);
          } else {
            cardCost.textContent = cardObj.cost;
          }
          cardCost.classList.add("hand-card-cost");
          topCardRowDiv.append(cardCost);
          topCardRowDiv.append(cardName);
          cardDiv.append(topCardRowDiv);
  
          
          let cardText = document.createElement("P");
          cardText.classList.add("card-text")
          if (typeof cardObj.cost === 'function') {
            cardText.textContent = cardObj.text(stateObj, index, cardArray);
          } else {
            cardCost.textContent = cardObj.text;
          }

          let avatar = document.createElement('img');
          avatar.classList.add("avatar");
          avatar.src = cardObj.avatar;
          
          
          cardDiv.append(avatar, cardText);

          let cardStatsDiv = document.createElement("Div");
          cardStatsDiv.classList.add("card-stats-row")

          let cardAttackDiv = document.createElement("Div");
          cardAttackDiv.classList.add("attack")
          cardAttackDiv.textContent = cardObj.attack;

          let cardDefendDiv = document.createElement("Div");
          cardDefendDiv.classList.add("defense")
          cardDefendDiv.textContent = cardObj.currentHP;

          cardStatsDiv.append(cardAttackDiv, cardDefendDiv)
          cardDiv.append(cardStatsDiv);
  
          //if cardArray is the hand, add playable class to the cards if energy > card.minReq
          if (cardArray === stateObj.encounterHand) {
              if (cardObj.minReq(stateObj, index, stateObj.encounterHand) <= stateObj.playerCurrentEnergy) {
                cardDiv.classList.add("playable");
                cardDiv.addEventListener("click", function () {
                  playACard(stateObj, index, stateObj.encounterHand);
                });
              };
          } else if (cardArray === stateObj.enemyMonstersInPlay && stateObj.playerToAttackIndex !== false) {
            cardDiv.classList.add("selectable");
            cardDiv.addEventListener("click", function () {
              selectThisEnemyIndex(stateObj, index, cardArray);
            });
          } else if (cardArray === stateObj.playerMonstersInPlay && cardArray[index].canAttack === true) {
            cardDiv.classList.add("can-attack");
                cardDiv.addEventListener("click", function () {
                  playerMonsterIsAttacking(stateObj, index, stateObj.playerMonstersInPlay);
                });
          }

          if (cardArray === stateObj.playerMonstersInPlay && stateObj.playerToAttackIndex === index) {
            cardDiv.classList.add("is-attacking");
          }
  
          if (functionToAdd) {
            cardDiv.addEventListener("click", function () {
              functionToAdd(stateObj, index, cardArray);
            });
          }

          if (cardObj.trigger && cardObj.trigger(stateObj, index, cardArray)) {
            cardDiv.classList.add("trigger-condition-met")
          }
          if (divName) {
            document.getElementById(divName).appendChild(cardDiv);
          }
          return cardDiv        
}

function topRowDiv(stateObj) {
  let topRowDiv = document.createElement("Div");
  topRowDiv.setAttribute("id", "town-top-row");

  let playerEnergyDiv = document.createElement("Div");
  playerEnergyDiv.setAttribute("id", "status-text-div");
  playerEnergyDiv.textContent = `Player Energy: ` + stateObj.playerCurrentEnergy + `/` + stateObj.playerMaxEnergy 

  let opponentEnergyDiv = document.createElement("Div");
  opponentEnergyDiv.setAttribute("id", "status-text-div");
  opponentEnergyDiv.textContent = `Enemy Energy: ` + stateObj.enemyEnergy + `/` + stateObj.enemyMaxEnergy 

  topRowDiv.append(playerEnergyDiv, opponentEnergyDiv);


  return topRowDiv
}


  function PlayACardImmer(stateObj, cardIndexInHand) {
    stateObj = immer.produce(stateObj, (newState) => {
      let playedCard = newState.encounterHand[cardIndexInHand]
      for (let h = 0; h < newState.encounterHand.length; h++) {
        if (newState.encounterHand[h].growProperty) {
          newState.encounterHand[h].attack +=1;
          newState.encounterHand[h].currentHP +=1;
          newState.encounterHand[h].maxHP +=1;
        }
      }
      if (playedCard) {
          newState.encounterHand.splice(cardIndexInHand, 1);
        }
    })
    return stateObj;
  }
  
  async function playACard(stateObj, cardIndexInHand, arrayObj) {
    console.log("you played " + stateObj.encounterHand[cardIndexInHand].name);  
    stateObj = await stateObj.encounterHand[cardIndexInHand].action(stateObj, cardIndexInHand, arrayObj);
    stateObj = await PlayACardImmer(stateObj, cardIndexInHand);
    stateObj = await changeState(stateObj);
  
    return stateObj;
  }

async function selectThisEnemyIndex(stateObj, index, arrayObj) {
    console.log("you chose " + stateObj.enemyMonstersInPlay[index].name);  
    stateObj = immer.produce(stateObj, (newState) => {
      newState.enemyToBeAttackedIndex = index
    })
    stateObj = await changeStatus(stateObj, Status.inFight)
    //stateObj = await changeState(stateObj);
    return stateObj;
}

async function playerMonsterIsAttacking(stateObj, index, arrayObj) {
  console.log("you are attacking with" + arrayObj[index].name);  
  stateObj = immer.produce(stateObj, (newState) => {
    newState.playerToAttackIndex = index
  })
  stateObj = await changeStatus(stateObj, Status.chooseEnemyMonster)
  //stateObj = await changeState(stateObj);
  return stateObj;
}

  
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
//                                                          Helper Stuff
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- --------------------------   
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 

function shuffleDraw(stateObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.encounterDraw = shuffleArray(newState.encounterDraw);
  });
  return stateObj;
}

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

async function endTurn(stateObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.playerMonstersInPlay.forEach(function (monsterObj, index) {
      monsterObj.canAttack = true;
    })
  });

  stateObj = await endTurnIncrement(stateObj);
  stateObj = await changeState(stateObj);

  stateObj = immer.produce(stateObj, (newState) => {
    newState.playerMaxEnergy += 1;
    newState.playerCurrentEnergy = newState.playerMaxEnergy;
    newState.enemyMaxEnergy += 1
    newState.enemyEnergy = newState.enemyMaxEnergy
  })
  stateObj = await drawACard(stateObj);
  await changeState(stateObj);
}

async function endTurnIncrement(stateObj) {
  
  stateObj.enemyMonstersInPlay.forEach(async function (monsterObj, index) {
    if (stateObj.playerMonstersInPlay.length > 0) {
      let playerTargetIndex = Math.floor(Math.random() * stateObj.playerMonstersInPlay.length)
      stateObj = immer.produce(stateObj, async (newState) => {
        newState.playerMonstersInPlay[playerTargetIndex].currentHP -= newState.enemyMonstersInPlay[index].attack
        newState.enemyMonstersInPlay[index].currentHP -= newState.playerMonstersInPlay[playerTargetIndex].attack
      })
    } else {
      stateObj = immer.produce(stateObj, async (newState) => {
        newState.playerHP -= newState.enemyMonstersInPlay[index].attack
      })
    }
  })
  
  return stateObj;
}

async function pause(timeValue) {
  return new Promise(res => setTimeout(res, timeValue))
}

async function drawACard(stateObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    if (stateObj.encounterHand.length > 6 ) {
      console.log("hand is full");
      return newState;
    }

    // if deck is empty, shuffle discard and change newState to reflect that
    if (newState.encounterDraw.length === 0) {
      console.log("you're out of cards!")
    }

    topCard = newState.encounterDraw.shift();
    if (!topCard) {
      return newState;
    }
    newState.encounterHand.push(topCard);
  })


  return stateObj;
}