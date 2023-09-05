

// next up - animated deaths
//animated entrance
//should instead check on death/play/end of turn if any minions have that ability, and then save that as a CONST mult

//should program in minionValue and have opponents:
//1. sum their total inPlay attack values
//2. calcuate the highest value minion they can kill, using the same formula as maxHPIndex (if none, go face)
//3. calculate the most efficient way to kill this minion (????)
//take HP of most valuable minion, search for minion that can kill it exactly, have it attack
//if none exist, search for lowest attack minion and have it attack
//repeat this step until minion is dead
//4. changeState and repeat until all minions have attacked.
//
  
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 
//                                                          State Stuff
// -------------------------- -------------------------- -------------------------- -------------------------- -------------------------- 

const Status = {
  inFight: renderDivs,
  lostFight: renderLostFight,
  wonFight: renderWonFight,
  chooseEnemyMonster: renderChooseEnemy,
  ChoosingMonster: renderChooseDeck,
}


let gameStartState = {

  player: {
    currentHP: 24,
    name: "player",

    lifeRequirementReduction: 0,
    endofTurnMultiplier: 1,
    onDeathMultiplier: 1,
    whenPlayedMultiplier: 1,
    heroPower: false,

    cardsPerTurn: 0,

    currentEnergy: 1,
    maxEnergy: 1,

    encounterDraw: [],
    monstersInPlay: [],
    encounterHand: [],
  },

  opponent: {
    name: "opponent",
    currentHP: 10,

    currentEnergy: 1,
    maxEnergy: 1,

    encounterDraw: [],
    monstersInPlay: [],
    encounterHand: [],

    lifeRequirementReduction: 0,
    endofTurnMultiplier: 1,
    onDeathMultiplier: 1,
    whenPlayedMultiplier: 1,

    cardsPerTurn: 0,

    
  },

  fightStarted: false,
  status: Status.ChoosingMonster,
  playerToAttackIndex: false,
  enemyToBeAttackedIndex: false,
  canPlay: true,
  testingMode: true,

  cardToBePlayed: false,
}


let state = {...gameStartState};
renderScreen(state)

async function startEncounter(stateObj) {

    if (stateObj.testingMode === true) {
      stateObj = immer.produce(stateObj, (newState) => {
        // newState.player.encounterDraw = [];
        // newState.player.monstersInPlay = [];
        newState.player.currentEnergy = 15;
        newState.player.currentHP = 31
        newState.opponent.monstersInPlay = []
        newState.player.heroPower = heroPowers[2]
        newState.opponent.heroPower = heroPowers[testEnemy.heroPower]
        newState.opponent.encounterDraw = testEnemy.deck
      })
      for (let i = 0; i < stateObj.player.monstersInPlay.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
          newState.player.monstersInPlay[i].canAttack = true;
        })
      }
    }
    console.log("starting encounter")
    stateObj = shuffleDraw(stateObj, stateObj.player);
    stateObj = shuffleDraw(stateObj, stateObj.opponent);
    for (let h=0; h < 4; h++) {
      stateObj = await drawACard(stateObj, stateObj.player)
      stateObj = await drawACard(stateObj, stateObj.opponent)
    }

    stateObj = immer.produce(stateObj, (newState) => {
      newState.fightStarted = true;
    })

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
    stateObj = await updateState(stateObj)
    renderScreen(stateObj);
    return stateObj
}

async function updateState(newStateObj) {
  state = {...newStateObj}
  renderScreen(newStateObj)
  return newStateObj
}

async function completeAttack(stateObj, attackerIndex = stateObj.playerToAttackIndex, defenderIndex = stateObj.enemyToBeAttackedIndex) {
  // document.querySelectorAll("#enemyMonstersInPlay .avatar")[0].classList.add("opponent-windup")
  // pause(500)
  if (defenderIndex === 99) {
    await addImpact("player", attackerIndex);
    await addImpact("opponent", "health");
    stateObj = immer.produce(stateObj, (newState) => {
      let AttackingMonster = newState.player.monstersInPlay[attackerIndex]
      console.log(AttackingMonster.name + " dealt " + AttackingMonster.attack + " damage to the opponent")
      newState.opponent.currentHP -= AttackingMonster.attack
      AttackingMonster.canAttack = false
      newState.playerToAttackIndex = false;
      newState.enemyToBeAttackedIndex = false
    })
  } else {
    await addImpact("player", attackerIndex);
    await addImpact("opponent", defenderIndex);
    stateObj = immer.produce(stateObj, (newState) => {
      let AttackingMonster = newState.player.monstersInPlay[attackerIndex]
      let DefendingMonster = newState.opponent.monstersInPlay[defenderIndex]
      console.log("Player's " + AttackingMonster.name + " dealt " + AttackingMonster.attack + " damage to enemy's " + DefendingMonster.name + " and took " + DefendingMonster.attack + " damage")
      DefendingMonster.currentHP -= AttackingMonster.attack
      AttackingMonster.currentHP -= DefendingMonster.attack
      AttackingMonster.canAttack = false
      newState.playerToAttackIndex = false;
      newState.enemyToBeAttackedIndex = false
    })
  }
  await changeState(stateObj);
  return stateObj
}

async function playDemonFromHand(stateObj, cardIndexInHand, playerSummoning, pauseTime=500, stateChange=true) {
  let cardObj = playerSummoning.encounterHand[cardIndexInHand]
  stateObj = await immer.produce(stateObj, async (newState) => {
    let player = (playerSummoning.name === "player") ? newState.player : newState.opponent
    player.currentEnergy -= cardObj.baseCost;
  })

  stateObj = await summonDemon(stateObj, cardObj, playerSummoning, pauseTime, stateChange)
  return stateObj;
}

//changes state
async function summonDemon(stateObj, cardObj, playerSummoning, pauseTime=500, pushToEnd=true, stateChange=true) {
    stateObj = immer.produce(stateObj, (newState) => {
      let player = (playerSummoning.name === "player") ? newState.player : newState.opponent
      player.monstersInPlay.push(cardObj)
    })
  if (stateChange) {
    stateObj = await changeState(stateObj)
  }
  if (pushToEnd) {
    let queryString = (playerSummoning.name === "player") ? "#playerMonstersInPlay .card" : "#enemyMonstersInPlay .card"
    let monstersLength = (playerSummoning.name === "player") ? stateObj.player.monstersInPlay.length : stateObj.opponent.monstersInPlay.length
    document.querySelectorAll(queryString)[monstersLength-1].classList.add("fade-in")
    await pause(pauseTime)
    document.querySelectorAll(queryString)[monstersLength-1].classList.remove("fade-in")
  }
  
  
  return stateObj
}

//changes state with summonDemon
async function createNewMinion(stateObj, playerSummoning, attack=1, currentHP=1, baseCost=1, maxHP=1, name="Elemental", minion=potgrowth, pauseTime=500, 
                              property1name=false, property1valIncrease=1, stateChange=true) {
  let newpot = {...minion}
  newpot.attack = attack
  newpot.currentHP = currentHP
  newpot.baseCost = baseCost
  newpot.maxHP = maxHP
  if (property1name) {
    newpot[property1name] = property1valIncrease
  }
   if (name) {
    newpot.name = name
  }

  if (stateChange === true) {
    stateObj = await summonDemon(stateObj, newpot, playerSummoning, pauseTime, stateChange)
    return stateObj
  } else {
    return newpot
  }
}

async function gainLife(stateObj, playerSummoning, lifeToGain) {
  stateObj = immer.produce(stateObj, (newState) => {
    let player = (playerSummoning.name === "player") ? newState.player : newState.opponent
    player.currentHP += lifeToGain;
  })
  await updateState(stateObj)
  return stateObj;
}

//can fix maxHP

async function giveDemonStats(stateObj, playerObj, index, stat1Name, stat1Value, inHand=false, stat2Name=false, stat2Value=false, stat3Name=false, stat3Value=false) {
  stateObj = immer.produce(stateObj, (newState) => {
    let player = (playerObj.name === "player") ? newState.player : newState.opponent
    let array = (inHand) ? player.encounterHand : player.monstersInPlay
    if (stat2Name) {
      if (stat2Name === "maxHP") {
        let missingHP = array[index].maxHP - array[index].currentHP
        stat2Value = ((missingHP > array[index].currentHP) ? 0 : array[index].currentHP-missingHP)
      }
      array[index][stat2Name] += stat2Value
    }
    array[index][stat1Name] += stat1Value
    
    if (stat3Name) {
      array[index][stat3Name] += stat3Value
    }
  })
  await changeState(stateObj)
  return stateObj;
}

async function pickRandomOtherIndex(arrayObj, indexToAvoid) {
  if (arrayObj.length > 1) {
    let targetIndex = Math.floor(Math.random() * (arrayObj.length));

    if (targetIndex === indexToAvoid) {
        if (targetIndex === 0) {
            targetIndex += 1
        } else {
            targetIndex -=1
        }
    }
    return targetIndex
  } else {
    return false
  }
}

async function addCardToHand(stateObj, playerSummoning, cardObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    let player = (playerSummoning.name === "player") ? newState.player : newState.opponent
    player.encounterHand.push(cardObj);
  })
  await changeState(stateObj)
  return stateObj;
}

async function checkForArrayMatches(arrayObj, propertyName, propertyValue) {
  let matchesInArray = 0
  arrayObj.forEach((element) => {
    if (element[propertyName] === propertyValue) {
      matchesInArray +=1
    }
  })
  return matchesInArray;
}

async function healMinion(stateObj, playerSummoning, index, HPToHeal) {
  stateObj = immer.produce(stateObj, (newState) => {
    let monstersArray = (playerSummoning.name === "player") ? newState.player.monstersInPlay : newState.opponent.monstersInPlay
    let missingHP = monstersArray[index].maxHP - monstersArray[index].currentHP
    let healAmount = (HPToHeal >= missingHP) ? HPToHeal : missingHP
    if (healAmount > 0) {
      monstersArray[index].currentHP += healAmount
    }
  })
  await changeState(stateObj)
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

 function renderChooseDeck(stateObj) {
    document.getElementById("app").innerHTML = ""
    let monsterChoiceDiv = document.createElement("Div");
    monsterChoiceDiv.classList.add("monster-choice-window");
    document.getElementById("app").appendChild(monsterChoiceDiv);
  
    for (let p =0; p < potentialPlayers.length; p++) {
      let monsterDiv = document.createElement("Div");
      monsterDiv.id = p;
      monsterDiv.classList.add("monster-to-choose");
  
      monsterDiv.addEventListener("click", async function () {
        chooseThisMonster(stateObj, p);
      });

      let monsterName = document.createElement("H3");
      monsterName.textContent = potentialPlayers[p].name;
      let monsterText = document.createElement("p");
      monsterText.textContent = potentialPlayers[p].text;
      monsterDiv.append(monsterName, monsterText);
      monsterChoiceDiv.append(monsterDiv)
    }
      document.getElementById("app").appendChild(monsterChoiceDiv);
  };

//changeState issues iwth onDeath calling itself probably causing this; look into the minion 
async function handleDeathsForPlayer(stateObj, playerObj) {
  if (playerObj.monstersInPlay.length > 0) {
    let indexesToDelete = [];
    playerObj.monstersInPlay.forEach(function (monster, index) {
      if (monster.currentHP <= 0) {
        console.log(playerObj.name + "'s " + monster.name + " has died.")
        indexesToDelete.push(index);
      }
    });
    //if a monster has died
    if (indexesToDelete.length > 0) {
      indexesToDelete.reverse()
      //await opponentDeathAnimation(indexesToDelete)
      for (let i = 0; i < indexesToDelete.length; i++) {
          let monsterObj = stateObj[playerObj.name].monstersInPlay[indexesToDelete[i]]
          if (typeof(monsterObj.onDeath) === "function") {
            let mult = stateObj[playerObj.name].onDeathMultiplier
            for (let m = 0; m < mult; m++) {
              stateObj = await stateObj[playerObj.name].monstersInPlay[indexesToDelete[i]].onDeath(stateObj, indexesToDelete[i], playerObj.monstersInPlay, playerObj)
            }
          }
          
          stateObj = immer.produce(stateObj, (newState) => {
            let player = (playerObj.name === "player") ? newState.player : newState.opponent
            player.monstersInPlay.splice(indexesToDelete[i], 1)
          })
      }
    }
  }
  return stateObj
}



async function handleDeaths(stateObj) {
  if (stateObj.fightStarted === true) {
    stateObj = await(handleDeathsForPlayer(stateObj, stateObj.opponent))

    if (stateObj.opponent.currentHP <= 0) {
      stateObj = renderWonFight(stateObj)
    }
    stateObj = await(handleDeathsForPlayer(stateObj, stateObj.player))

    if (stateObj.player.currentHP <= 0) {
      stateObj = renderLostFight(stateObj)
    }
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

function createConjurerSkillButton(stateObj, playerObj) {
  let ConjurerSkillButton = document.createElement("Button");
  ConjurerSkillButton.classList.add("conjurer-skill-button")
  ConjurerSkillButton.textContent = stateObj[playerObj.name].heroPower.text(stateObj, playerObj)
  if (playerObj.name === "player") {
    if (stateObj.canPlay === true && stateObj.player.currentEnergy >= stateObj.player.heroPower.cost) {
      ConjurerSkillButton.classList.add("conjurer-skill-button-playable")
      ConjurerSkillButton.addEventListener("click", function() {
        stateObj.player.heroPower.action(stateObj, stateObj.player)
      })
    } else {
      ConjurerSkillButton.classList.add("conjurer-skill-button-greyed-out")
    }
  }
  
  return ConjurerSkillButton
}

function renderHand(stateObj) {
  document.getElementById("handContainer2").innerHTML = "";
  if (stateObj.player.encounterHand.length > 0) {
    stateObj.player.encounterHand.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.player.encounterHand, index, stateObj.player, "handContainer2", functionToAdd=false)
    });
  }
  skillButton = createConjurerSkillButton(stateObj, stateObj.player)
  document.getElementById("handContainer2").append(skillButton)
}

function renderPlayerMonstersInPlay(stateObj) {
  document.getElementById("playerMonstersInPlay").innerHTML = "";
  if (stateObj.player.monstersInPlay.length > 0) {
    stateObj.player.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.player.monstersInPlay, index, stateObj.player, "playerMonstersInPlay", functionToAdd=false)
    });
  }
  let endTurnButton = document.createElement("Button");
  endTurnButton.classList.add("font5vmin")
  if (stateObj.canPlay === true) {
    endTurnButton.classList.add("end-turn-button")
    endTurnButton.addEventListener("click", function() {
      endTurn(stateObj)
    })
  } else {
    endTurnButton.classList.add("greyed-out")
  }
  
  endTurnButton.textContent = "End Turn";
  document.querySelector("#playerMonstersInPlay").append(endTurnButton);
}

function renderEnemyMonstersInPlay(stateObj) {
  document.getElementById("enemyMonstersInPlay").innerHTML = "";
  if (stateObj.opponent.monstersInPlay.length > 0) {
    stateObj.opponent.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.opponent.monstersInPlay, index, stateObj.opponent, "enemyMonstersInPlay", functionToAdd=false)
    });
  }
}

function renderEnemyMonstersToChoose(stateObj) {
  document.getElementById("enemyMonstersInPlay").innerHTML = "";
  if (stateObj.opponent.monstersInPlay.length > 0) {
    stateObj.opponent.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.opponent.monstersInPlay, index, stateObj.opponent, "enemyMonstersInPlay", functionToAdd=false)
    });
  }
}

async function renderDivs(stateObj) {
  if (stateObj.fightStarted === false) {
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
  let topRow = topRowDiv(stateObj)
  document.getElementById("app").innerHTML = ""
  //let topRow = topRowDiv(stateObj, "app")
  let restOfScreen = renderFightDiv();
  document.querySelector("#app").append(topRow, restOfScreen);
  
  
  renderHand(stateObj);
  renderPlayerMonstersInPlay(stateObj);
  renderEnemyMonstersInPlay(stateObj);
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


function renderCard(stateObj, cardArray, index, playerObj, divName=false, functionToAdd=false) {
    let cardObj = cardArray[index];
    let cardDiv = document.createElement("Div");
    
          if (cardArray === stateObj.player.encounterHand) {
            cardDiv.id = "hand-card-index-"+index;
            cardDiv.classList.add("card");
          } else if (cardArray === stateObj.player.monstersInPlay) {
            cardDiv.id = "play-card-index-"+index;
            cardDiv.classList.add("card");
          } else {
            cardDiv.id = "card-index-"+index;
            cardDiv.classList.add("card");
          }
          

          if (cardObj.elementType === "fire") {
            cardDiv.classList.add("fire");
          } else if (cardObj.elementType === "water") {
            cardDiv.classList.add("water");
          } else if (cardObj.elementType === "earth") {
            cardDiv.classList.add("earth");
          } else if (cardObj.elementType === "air") {
            cardDiv.classList.add("air");
          }
   
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
            cardText.textContent = cardObj.text(stateObj, index, cardArray, playerObj);
          } else {
            cardCost.textContent = cardObj.text;
          }

          let avatar = document.createElement('img');
          avatar.classList.add("avatar");
          avatar.src = cardObj.avatar;
          avatar.setAttribute("draggable", "false")
          
          
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
          if (cardArray === stateObj.player.encounterHand) {
              if (cardObj.minReq(stateObj, index, stateObj.player.encounterHand) <= stateObj.player.currentEnergy) {
                if (stateObj.canPlay === true) {
                  cardDiv.classList.add("playable");
                  cardDiv.setAttribute("draggable", "true")
                  cardDiv.addEventListener("click", function () {
                    playACard(stateObj, index, stateObj.player.encounterHand, stateObj.player);
                  });

                  cardDiv.addEventListener("dragstart", (event) => {
                    event.dataTransfer.setData("text/plain", cardDiv.id);
                    
                  });
        
                  const monstersDiv = document.querySelector("#playerMonstersInPlay");
                  monstersDiv.addEventListener("dragover", (event) => {
                    event.preventDefault();
                  });
        
                  monstersDiv.addEventListener("drop", (event) => {
                    event.preventDefault();
                    const cardId = event.dataTransfer.getData("text/plain");
                    
                    if (cardId && cardId[0] === "h") {
                      str = cardId.charAt(cardId.length-1) 

                      playACard(stateObj, Number(str), stateObj.player.encounterHand, stateObj.player);
                      event.stopImmediatePropagation();
                    }
                    
                      
                    
                  });

                }
              };
          } else if (cardArray === stateObj.opponent.monstersInPlay && stateObj.playerToAttackIndex !== false) {
            cardDiv.classList.add("selectable");
            cardDiv.addEventListener("click", function () {
              selectThisEnemyIndex(stateObj, index);
            });

          } else if (cardArray === stateObj.player.monstersInPlay && cardArray[index].canAttack === true) {
            const enemyMonsters = document.querySelector("#enemyMonstersInPlay");
            cardDiv.setAttribute("draggable", "true")
            if (cardArray[index].elementType === "water") {
              cardDiv.classList.add("can-attack-water");
            } else if (cardArray[index].elementType === "earth") {
              cardDiv.classList.add("can-attack-earth");
            } else {
              cardDiv.classList.add("can-attack");
            }
                cardDiv.addEventListener("click", function () {
                  playerMonsterIsAttacking(stateObj, index, stateObj.player.monstersInPlay);
                });

                cardDiv.addEventListener("dragstart", (event) => {
                    event.dataTransfer.setData("text/plain", cardDiv.id);
                  });

                  enemyMonsters.addEventListener("dragover", (event) => {
                    let droppableElements = document.querySelectorAll("#enemyMonstersInPlay .card");

                  droppableElements.forEach((element, targetIndex) => {
                    element.addEventListener("dragover", (event) => {
                      event.preventDefault();
                    });

                    element.addEventListener("drop", (event) => {
                      event.preventDefault();
                      const cardId = event.dataTransfer.getData("text/plain");
                    
                    if (cardId && cardId[0] === "p") {
                      str = Number(cardId.charAt(cardId.length-1)) 
                      console.log("played card id is " + str)
                      console.log("targeted index is " + targetIndex)
                      stateObj = completeAttack(stateObj, str, targetIndex)


                      event.stopImmediatePropagation();
                    }
                      // Call your function with the index of the target zone element
                      //yourFunction(targetIndex);
                    });
                  });
                  })

    
          }

          if (cardArray === stateObj.player.monstersInPlay && stateObj.playerToAttackIndex === index) {
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

async function playCardFromHand(stateObj, index, arrayObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.playerToAttackIndex = index
  })
  stateObj = await changeStatus(stateObj, Status.chooseEnemyMonster)
  //stateObj = await changeState(stateObj);
  return stateObj;
}

function topRowDiv(stateObj) {
  let topRowDiv = document.createElement("Div");
  topRowDiv.setAttribute("id", "top-row");

  let playerEnergyDiv = document.createElement("Div");
  playerEnergyDiv.setAttribute("id", "player-energy-div-top-row");

  playerEnergyTextDiv = document.createElement("Div");
  playerEnergyTextDiv.textContent = `Player Energy: `

  let playerEnergyCircleDiv = document.createElement("Div");
  playerEnergyCircleDiv.setAttribute("id", "player-energy-div");
  playerEnergyCircleDiv.textContent = stateObj.player.currentEnergy + `/` + stateObj.player.maxEnergy 

  playerEnergyDiv.append(playerEnergyTextDiv, playerEnergyCircleDiv)

  let opponentEnergyDiv = document.createElement("Div");
  opponentEnergyDiv.setAttribute("id", "status-text-div");
  opponentEnergyDiv.textContent = `Enemy Energy: ` + stateObj.opponent.currentEnergy + `/` + stateObj.opponent.maxEnergy 

  let opponentHealthDiv = document.createElement("Div");
  opponentHealthDiv.setAttribute("id", "opponent-health-div");
  opponentHealthDiv.textContent = `Enemy HP: ` + stateObj.opponent.currentHP

  let opponentHandDiv = document.createElement("Div");
  opponentHandDiv.setAttribute("id", "opponent-health-div");
  opponentHandDiv.textContent = `Enemy Hand: ` + stateObj.opponent.encounterHand.length + ' cards'

  if ( stateObj.playerToAttackIndex !== false) {
    opponentHealthDiv.classList.add("selectable");
    opponentHealthDiv.addEventListener("click", function () {
      selectThisEnemyIndex(stateObj, 99);
    });
  }
  
  let playerHealthDiv = document.createElement("Div");
  playerHealthDiv.setAttribute("id", "player-health-div");
  playerHealthDiv.textContent = `player HP: ` + stateObj.player.currentHP

  topRowDiv.append(playerEnergyDiv, playerHealthDiv, opponentEnergyDiv, opponentHealthDiv, opponentHandDiv);


  return topRowDiv
}


 async function PlayACardImmer(stateObj, cardIndexInHand, playerObj) {
    let player = (playerObj.name === "player") ? stateObj.player : stateObj.opponent
    let playedCard = {...player.encounterHand[cardIndexInHand]}

    if (playedCard.cardType === "minion") {
      stateObj = await playDemonFromHand(stateObj, cardIndexInHand, playerObj, pauseTime = (playedCard.pauseTime) ? playedCard.pauseTime : 500, stateChange=true)
    }

    
      if (playedCard) {
        stateObj = immer.produce(stateObj, (newState) => {
          newState.player.encounterHand.splice(cardIndexInHand, 1);
        })
      }


      
    stateObj = immer.produce(stateObj, (newState) => {
      for (let h = 0; h < newState.player.encounterHand.length; h++) {
        if (newState.player.encounterHand[h].growProperty) {
          newState.player.encounterHand[h].attack +=1;
          newState.player.encounterHand[h].currentHP +=1;
        }
      }
    })
//      let playedCard = newState.player.encounterHand[cardIndexInHand]
      

    stateObj = await changeState(stateObj);
    return stateObj;
  }
  
  async function playACard(stateObj, cardIndexInHand, arrayObj, playerObj) {
    let monsters = stateObj[playerObj.name].monstersInPlay
    stateObj = await PlayACardImmer(stateObj, cardIndexInHand, playerObj);
    let newMonsters = stateObj[playerObj.name].monstersInPlay
    let mult = stateObj[playerObj.name].whenPlayedMultiplier
    for (let i = 0; i < mult; i++) {
      stateObj = (newMonsters[newMonsters.length-1].action) ? await newMonsters[newMonsters.length-1].action(stateObj, newMonsters.length-1, newMonsters, playerObj) : stateObj
    }
    return stateObj;
  }

async function selectThisEnemyIndex(stateObj, index) {
    stateObj = immer.produce(stateObj, (newState) => {
      newState.enemyToBeAttackedIndex = index
    })
    stateObj = await changeStatus(stateObj, Status.inFight)
    //stateObj = await changeState(stateObj);
    return stateObj;
}

async function playerMonsterIsAttacking(stateObj, index, arrayObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.playerToAttackIndex = index
  })
  stateObj = await changeStatus(stateObj, Status.chooseEnemyMonster)
  //stateObj = await changeState(stateObj);
  return stateObj;
}

// function renderChooseDeck(stateObj) {
//   document.getElementById("app").innerHTML = ""
//   let monsterChoiceDiv = document.createElement("Div");
//   monsterChoiceDiv.classList.add("monster-choice-window");
//   document.getElementById("app").appendChild(monsterChoiceDiv);
//   // let devModeDiv = document.createElement("Div");
//   // devModeDiv.classList.add("dev-mode-div")
//   // devModeDiv.addEventListener("click", function () {
//   //   chooseThisMonster(stateObj, 4);
//   // });
//   // monsterChoiceDiv.append(devModeDiv);

//   potentialPlayers.forEach(function (playerObj, index) {
//     let monsterDiv = document.createElement("Div");
//     monsterDiv.id = index;
//     monsterDiv.classList.add("monster-to-choose");
//     if (monsterObj.type === "fire") {
//       monsterDiv.classList.add("fire-choose");
//     } else {
//       monsterDiv.classList.add("water-choose");
//     }
//     let monsterName = document.createElement("H3");

//     monsterName.textContent = playerObj.name;
//     // let avatar = document.createElement('img');
//     // avatar.classList.add("avatar");
//     // avatar.src = monsterObj.avatar;

//     monsterDiv.addEventListener("click", function () {
//       chooseThisMonster(stateObj, index);
//     });

//     monsterDiv.append(monsterName, avatar);
//     monsterChoiceDiv.append(monsterDiv)
//     document.getElementById("app").appendChild(monsterChoiceDiv);
//     })
// };

function chooseThisMonster(stateObj, index) {
    stateObj = immer.produce(stateObj, (newState) => {
      newState.player.encounterDraw = [...potentialPlayers[index].deck];
      newState.player.heroPower = {...heroPowers[potentialPlayers[index].heroPower]}
      newState.status = Status.inFight
      let i = Math.floor(Math.random() * potentialEnemies.length)
      newState.opponent.encounterDraw = [...potentialEnemies[i].deck],
      newState.opponent.heroPower = {...heroPowers[potentialEnemies[i].heroPower]}
    })
   stateObj = updateState(stateObj);
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

function shuffleDraw(stateObj, playerShuffling) {
  stateObj = immer.produce(stateObj, (newState) => {
    let player = (playerShuffling.name === "player") ? newState.player : newState.opponent
    player.encounterDraw = shuffleArray(player.encounterDraw);
  });
  return stateObj;
}

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

//should hero power cost increase by 1 every time it's played a turn??
async function heroPower(stateObj, playerObj) {
  stateObj = await gainLife(stateObj, playerObj, 2) // 1 + playerObj.heroPowerIncrease
  stateObj = immer.produce(stateObj, (newState) => {
    let player = (playerObj.name === "player") ? newState.player : newState.opponent
    player.currentEnergy -= 2; //1 + playerObj.heroPowerCost
  });
  await changeState(stateObj)
}

async function endTurn(stateObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.canPlay = false
  })
  await changeState(stateObj)
  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.monstersInPlay.forEach(function (monsterObj, index) {
      monsterObj.canAttack = false;
    })
  });
  for (let i = stateObj.player.monstersInPlay.length-1; i > -1; i--) {
    let card = stateObj.player.monstersInPlay[i]
    if (typeof(card.endOfTurn) === "function") {
      await executeAbility("player", i)
      for (let j = 0; j < stateObj.player.endofTurnMultiplier; j++) {
        stateObj = await card.endOfTurn(stateObj, i, stateObj.player.monstersInPlay, stateObj.player);
      }
      stateObj = immer.produce(stateObj, (newState) => {
        newState.canPlay = false
      })
      stateObj = await changeState(stateObj)
      await pause(500)
    }  
  }
  stateObj = await drawACard(stateObj, stateObj.opponent)
  stateObj = await endTurnIncrement(stateObj);
  await pause(500)
  stateObj = await enemyTurn(stateObj);
  await pause(500)

  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.maxEnergy += 1;
    newState.player.currentEnergy = newState.player.maxEnergy;
    newState.opponent.maxEnergy += 1
    newState.opponent.currentEnergy = newState.opponent.maxEnergy
  })
  stateObj = await drawACard(stateObj, stateObj.player);
  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.monstersInPlay.forEach(function (monsterObj, index) {
      monsterObj.canAttack = true;
    })
  });
  await changeState(stateObj);

  stateObj = immer.produce(stateObj, (newState) => {
    newState.canPlay = true
  })
  await changeState(stateObj)
}

async function addImpact(playerName, index) {
  if (index !== "health") {
    let queryString = (playerName === "player") ? "#playerMonstersInPlay .avatar" : "#enemyMonstersInPlay .avatar"
    document.querySelectorAll(queryString)[index].classList.add("opponent-windup")
    await pause(400)
    document.querySelectorAll(queryString)[index].classList.remove("opponent-windup")
  } else {
    let queryString = (playerName === "player") ? "#player-health-div" : "#opponent-health-div"
    document.querySelector(queryString).classList.add("opponent-windup")
    await pause(400)
    document.querySelector(queryString).classList.remove("opponent-windup")
  }
}

async function executeAbility(playerName, index) {
  let queryString = (playerName === "player") ? "#playerMonstersInPlay .avatar" : "#enemyMonstersInPlay .avatar"
  document.querySelectorAll(queryString)[index].classList.add("execute-ability")
  await pause(750)
  document.querySelectorAll(queryString)[index].classList.remove("execute-ability")
}

//do enemy minions die?
//if the first minions kill player monsters, do the last minions attack HP?
async function endTurnIncrement(stateObj) {
  for (let i = 0; i < stateObj.opponent.monstersInPlay.length; i++) {
    if (stateObj.opponent.monstersInPlay[i].canAttack === true) {
      if (stateObj.player.monstersInPlay.length > 0) {
        let playerTargetIndex = Math.floor(Math.random() * stateObj.player.monstersInPlay.length)
        console.log(stateObj.opponent.monstersInPlay[i].name + " deals " + stateObj.opponent.monstersInPlay[i].attack + " damage to " + stateObj.player.monstersInPlay[playerTargetIndex].name)
        stateObj = await immer.produce(stateObj, async (newState) => {
          newState.player.monstersInPlay[playerTargetIndex].currentHP -= newState.opponent.monstersInPlay[i].attack
          newState.opponent.monstersInPlay[i].currentHP -= newState.player.monstersInPlay[playerTargetIndex].attack
        })
        await addImpact("opponent", i);
        await addImpact("player", playerTargetIndex);
      } else {
        stateObj = await immer.produce(stateObj, async (newState) => {
          console.log(stateObj.opponent.monstersInPlay[i].name + " deals " + stateObj.opponent.monstersInPlay[i].attack + " damage to you.")
          newState.player.currentHP -= newState.opponent.monstersInPlay[i].attack
        })
        await addImpact("opponent", i);
        await addImpact("player", "health");
      }

      stateObj = await changeState(stateObj)
    } 
  }
  
  return stateObj;
}

//in forEach, when a card is spliced, that makes the foreach loop 3 times, but now only 2 cards....
async function enemyTurn(stateObj) {
  
  let currentEnergy = stateObj.opponent.currentEnergy;

    //if can play card, push to index
    let indexesToDelete = []
    for (let i = 0; i < stateObj.opponent.encounterHand.length; i++) {
      if (currentEnergy > 0) {
        let cardObj = stateObj.opponent.encounterHand[i];
        if (cardObj.cost(stateObj, i, stateObj.opponent.encounterHand) <= currentEnergy) {
          currentEnergy -= cardObj.cost(stateObj, i, stateObj.opponent.encounterHand);
          indexesToDelete.push(i)
        }
      }
    }
    //play that card
    if (indexesToDelete.length > 0) {
      indexesToDelete.reverse()
      for (let i = 0; i < indexesToDelete.length; i++) {
        let cardObj = stateObj.opponent.encounterHand[indexesToDelete[i]]
        stateObj = (cardObj.action) ? await cardObj.action(stateObj, indexesToDelete[i], stateObj.opponent.encounterHand, stateObj.opponent) : stateObj
        stateObj = await playDemonFromHand(stateObj, indexesToDelete[i], stateObj.opponent)
        stateObj = await immer.produce(stateObj, async (newState) => {
          newState.opponent.encounterHand.splice(indexesToDelete[i], 1)
        })
        stateObj = await changeState(stateObj)
        await pause(750)
      }
    }
    if (stateObj.opponent.currentEnergy >= stateObj.opponent.heroPower.cost) {
      console.log("opponent used their hero power")
      stateObj = await stateObj.opponent.heroPower.action(stateObj, stateObj.opponent)
    }

  //check for opponent end of turn abilities, and set all enemies' canAttacks to true
  for (let i = 0; i < stateObj.opponent.monstersInPlay.length; i++) {
    if (stateObj.opponent.monstersInPlay[i].endOfTurn) {
      stateObj = await stateObj.opponent.monstersInPlay[i].endOfTurn(stateObj, i, stateObj.opponent.monstersInPlay, stateObj.opponent);
      await executeAbility("opponent", i)
      stateObj = await changeState(stateObj)
    }  
  }

  for (let i = 0; i < stateObj.opponent.monstersInPlay.length; i++) {
    stateObj = await immer.produce(stateObj, async (newState) => {
      newState.opponent.monstersInPlay[i].canAttack = true
    })
  }
  return stateObj;
}


async function pause(timeValue) {
  return new Promise(res => setTimeout(res, timeValue))
}

async function drawACard(stateObj, playerDrawing) {
  if (playerDrawing.encounterHand.length > 5 ) {
    console.log(playerDrawing.name + "'s hand is full");
    return stateObj;
  }

  if (playerDrawing.encounterDraw.length === 0) {
    console.log("player is out of cards!")
  }

  stateObj = immer.produce(stateObj, (newState) => {
    let chosenPlayer = (playerDrawing.name === "player") ? newState.player : newState.opponent
    topCard = chosenPlayer.encounterDraw.shift();
    if (!topCard) {
      return newState;
    }
    chosenPlayer.encounterHand.push(topCard);
  })
  return stateObj;
}

