



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

  player: {
    currentHP: 10,
    maxHP: 10,

    currentEnergy: 1,
    maxEnergy: 1,

    encounterDraw: [],
    monstersInPlay: [],
    encounterHand: [],
    
  },

  opponent: {
    currentHP: 10,
    maxHP: 10,

    currentEnergy: 1,
    maxEnergy: 1,

    encounterDraw: [],
    monstersInPlay: [destroyer],
    encounterHand: [],
    
  },
  

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
      newState.player.encounterDraw = [simpleImp, scalingDeathrattleImp, simpleDeathrattleImp, highHealthImp];
      newState.status = Status.inFight
    })
    stateObj = shuffleDraw(stateObj);
    for (let h=0; h < 4; h++) {
      stateObj = await drawACard(stateObj, stateObj.player)
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
  // document.querySelectorAll("#enemyMonstersInPlay .avatar")[0].classList.add("opponent-windup")
  // pause(500)
  if (stateObj.enemyToBeAttackedIndex === 99) {
    console.log("attacking enemy health")
    stateObj = immer.produce(stateObj, (newState) => {
      let AttackingMonster = newState.player.monstersInPlay[newState.playerToAttackIndex]
      newState.currentEnemyHP -= AttackingMonster.attack
      AttackingMonster.canAttack = false
      newState.playerToAttackIndex = false;
      newState.enemyToBeAttackedIndex = false
    })
  } else {
    stateObj = immer.produce(stateObj, (newState) => {
      console.log("attacking enemy monster at " + stateObj.enemyToBeAttackedIndex)
      let AttackingMonster = newState.player.monstersInPlay[newState.playerToAttackIndex]
      let DefendingMonster = newState.opponent.monstersInPlay[newState.enemyToBeAttackedIndex]
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
  if (stateObj.opponent.monstersInPlay.length > 0) {
    let indexesToDelete = [];
    stateObj.opponent.monstersInPlay.forEach(function (monster, index) {
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
          newState.opponent.monstersInPlay.splice(indexesToDelete[i], 1)
        }
      });
    }
  }

    if (stateObj.currentEnemyHP <= 0) {
      stateObj = renderWonFight(stateObj)
    }

    if (stateObj.player.monstersInPlay.length > 0) {
      let indexesToDelete = [];
      stateObj.player.monstersInPlay.forEach(async function (monster, index) {
        if (monster.currentHP <= 0) {
          console.log("player monster at index " + index + " has died.")
          indexesToDelete.push(index);
          
          } 
      });
      //if a monster has died
      if (indexesToDelete.length > 0) {
        indexesToDelete.reverse()
        //await opponentDeathAnimation(indexesToDelete)

        for (let i = 0; i < indexesToDelete.length; i++) {  
          if (typeof(stateObj.player.monstersInPlay[indexesToDelete[i]].onDeath) === "function") {
            stateObj = await stateObj.player.monstersInPlay[indexesToDelete[i]].onDeath(stateObj, indexesToDelete[i], stateObj.player.monstersInPlay);
          }
          stateObj = await immer.produce(stateObj, async (newState) => {
              console.log("splicing " + newState.player.monstersInPlay.length)
              newState.player.monstersInPlay.splice(indexesToDelete[i], 1)
          });
          console.log("player monsters length " + stateObj.player.monstersInPlay.length)
        }
      }
    }
    if (stateObj.player.currentHP <= 0) {
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
  if (stateObj.player.encounterHand.length > 0) {
    stateObj.player.encounterHand.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.player.encounterHand, index, "handContainer2", functionToAdd=false)
    });
  }
}

function renderPlayerMonstersInPlay(stateObj) {
  document.getElementById("playerMonstersInPlay").innerHTML = "";
  if (stateObj.player.monstersInPlay.length > 0) {
    stateObj.player.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.player.monstersInPlay, index, "playerMonstersInPlay", functionToAdd=false)
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
  if (stateObj.opponent.monstersInPlay.length > 0) {
    stateObj.opponent.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.opponent.monstersInPlay, index, "enemyMonstersInPlay", functionToAdd=false)
    });
  }
}

function renderEnemyMonstersToChoose(stateObj) {
  document.getElementById("enemyMonstersInPlay").innerHTML = "";
  if (stateObj.opponent.monstersInPlay.length > 0) {
    stateObj.opponent.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.opponent.monstersInPlay, index, "enemyMonstersInPlay", functionToAdd=false)
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
          if (cardArray === stateObj.player.encounterHand) {
              if (cardObj.minReq(stateObj, index, stateObj.player.encounterHand) <= stateObj.player.currentEnergy) {
                cardDiv.classList.add("playable");
                cardDiv.addEventListener("click", function () {
                  playACard(stateObj, index, stateObj.player.encounterHand);
                });
              };
          } else if (cardArray === stateObj.opponent.monstersInPlay && stateObj.playerToAttackIndex !== false) {
            cardDiv.classList.add("selectable");
            cardDiv.addEventListener("click", function () {
              selectThisEnemyIndex(stateObj, index);
            });
          } else if (cardArray === stateObj.player.monstersInPlay && cardArray[index].canAttack === true) {
            cardDiv.classList.add("can-attack");
                cardDiv.addEventListener("click", function () {
                  playerMonsterIsAttacking(stateObj, index, stateObj.player.monstersInPlay);
                });
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

function topRowDiv(stateObj) {
  let topRowDiv = document.createElement("Div");
  topRowDiv.setAttribute("id", "top-row");

  let playerEnergyDiv = document.createElement("Div");
  playerEnergyDiv.setAttribute("id", "status-text-div");
  playerEnergyDiv.textContent = `Player Energy: ` + stateObj.player.currentEnergy + `/` + stateObj.player.maxEnergy 

  let opponentEnergyDiv = document.createElement("Div");
  opponentEnergyDiv.setAttribute("id", "status-text-div");
  opponentEnergyDiv.textContent = `Enemy Energy: ` + stateObj.opponent.currentEnergy + `/` + stateObj.opponent.maxEnergy 

  let opponentHealthDiv = document.createElement("Div");
  opponentHealthDiv.setAttribute("id", "opponent-health-div");
  opponentHealthDiv.textContent = `Enemy HP: ` + stateObj.currentEnemyHP

  if ( stateObj.playerToAttackIndex !== false) {
    console.log("making enemy HP selectable")
    opponentHealthDiv.classList.add("selectable");
    opponentHealthDiv.addEventListener("click", function () {
      selectThisEnemyIndex(stateObj, 99);
    });
  }
  
  let playerHealthDiv = document.createElement("Div");
  playerHealthDiv.setAttribute("id", "player-health-div");
  playerHealthDiv.textContent = `Enemy HP: ` + stateObj.player.currentHP

  topRowDiv.append(playerEnergyDiv, playerHealthDiv, opponentEnergyDiv, opponentHealthDiv);


  return topRowDiv
}


  function PlayACardImmer(stateObj, cardIndexInHand) {
    stateObj = immer.produce(stateObj, (newState) => {
      let playedCard = newState.player.encounterHand[cardIndexInHand]
      for (let h = 0; h < newState.player.encounterHand.length; h++) {
        if (newState.player.encounterHand[h].growProperty) {
          newState.player.encounterHand[h].attack +=1;
          newState.player.encounterHand[h].currentHP +=1;
          newState.player.encounterHand[h].maxHP +=1;
        }
      }
      if (playedCard) {
          newState.player.encounterHand.splice(cardIndexInHand, 1);
        }
    })
    return stateObj;
  }
  
  async function playACard(stateObj, cardIndexInHand, arrayObj) {
    console.log("you played " + stateObj.player.encounterHand[cardIndexInHand].name);  
    stateObj = await stateObj.player.encounterHand[cardIndexInHand].action(stateObj, cardIndexInHand, arrayObj);
    stateObj = await PlayACardImmer(stateObj, cardIndexInHand);
    stateObj = await changeState(stateObj);
  
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
    newState.player.encounterDraw = shuffleArray(newState.player.encounterDraw);
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
    newState.player.monstersInPlay.forEach(function (monsterObj, index) {
      monsterObj.canAttack = true;
    })
  });

  stateObj = await endTurnIncrement(stateObj);
  stateObj = await changeState(stateObj);

  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.maxEnergy += 1;
    newState.player.currentEnergy = newState.player.maxEnergy;
    newState.opponent.maxEnergy += 1
    newState.opponent.currentEnergy = newState.opponent.maxEnergy
  })
  stateObj = await drawACard(stateObj, stateObj.player);
  await changeState(stateObj);
}

async function endTurnIncrement(stateObj) {
  
  stateObj.opponent.monstersInPlay.forEach(async function (monsterObj, index) {
    if (stateObj.player.monstersInPlay.length > 0) {
      let playerTargetIndex = Math.floor(Math.random() * stateObj.player.monstersInPlay.length)
      stateObj = immer.produce(stateObj, async (newState) => {
        newState.player.monstersInPlay[playerTargetIndex].currentHP -= newState.opponent.monstersInPlay[index].attack
        newState.opponent.monstersInPlay[index].currentHP -= newState.player.monstersInPlay[playerTargetIndex].attack
      })
    } else {
      stateObj = immer.produce(stateObj, async (newState) => {
        newState.player.currentHP -= newState.opponent.monstersInPlay[index].attack
      })
    }
  })
  
  return stateObj;
}

async function pause(timeValue) {
  return new Promise(res => setTimeout(res, timeValue))
}

async function drawACard(stateObj, playerDrawing) {
  if (playerDrawing.encounterHand.length > 6 ) {
    console.log("player's hand is full");
    return newState;
  }

  if (playerDrawing.encounterDraw.length === 0) {
    console.log("player is out of cards!")
  }

  stateObj = immer.produce(stateObj, (newState) => {
    // if deck is empty, shuffle discard and change newState to reflect that
    let chosenPlayer = (playerDrawing = stateObj.player) ? newState.player : newState.opponent
    topCard = chosenPlayer.encounterDraw.shift();
    if (!topCard) {
      return newState;
    }
    chosenPlayer.encounterHand.push(topCard);
  })


  return stateObj;
}