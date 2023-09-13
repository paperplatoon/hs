

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
  ChoosingMonster: renderChooseDeck,
  ChoosingHeroPower: renderChooseHeroPower,
  inFight: renderDivs,
  lostFight: renderLostFight,
  wonFight: renderWonFight,
  chooseEnemyMonster: renderChooseEnemy,
  ChoosingMonster: renderChooseDeck,
  ChooseEncounterCardReward: renderChooseEncounterCardReward,
}

let preFightState = {
  testingMode: false,
  canPlay: true,
  fightStarted: false,
  status: Status.ChoosingMonster,
  

  turnCounter: 0,
  
  playerToAttackIndex: false,
  enemyToBeAttackedIndex: false,
  

}

let gameStartState = {

  player: {
    currentLife: 10,
    maxLife: 10,
    name: "player",

    lifeRequirementReduction: 0,
    endofTurnMultiplier: 1,
    onDeathMultiplier: 1,
    whenPlayedMultiplier: 1,
    heroPower: false,
    quest: {...quests[1]},

    cardsPerTurn: 0,

    currentEnergy: 1,
    turnEnergy: 2,

    encounterDraw: [],
    monstersInPlay: [],
    encounterHand: [],
  },

  opponent: {
    name: "opponent",
    currentLife: 10,
    maxLife: 10,

    currentEnergy: 1,
    turnEnergy: 2,

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
  testingMode: false,

}


let state = {...gameStartState};
renderScreen(state)

async function startEncounter(stateObj) {

  stateObj = immer.produce(stateObj, (newState) => {
    newState.fightStarted = true;
    newState.status = Status.inFight
    newState.player.encounterDraw = [...newState.player.encounterDeck]
    newState.player.encounterHand = []
    //fix
    newState.opponent.encounterDraw = [...potentialEnemies[0].deck],
    newState.opponent.heroPower = {...heroPowers[potentialEnemies[0].heroPower]}
    newState.opponent.encounterHand = []
  })

    if (stateObj.testingMode === true) {
      stateObj = immer.produce(stateObj, (newState) => {
        // newState.player.encounterDraw = [...testPlayer.deck];
        // newState.player.monstersInPlay = [sparkingimp, deityoflight];
        newState.player.currentEnergy = 15;
        newState.player.currentLife = 31
        newState.opponent.monstersInPlay = [tiderider, tiderider]
        // newState.player.heroPower = heroPowers[testPlayer.heroPower]
        newState.opponent.heroPower = heroPowers[testEnemy.heroPower]
        newState.opponent.encounterDraw = testEnemy.deck
      })
      for (let i = 0; i < stateObj.player.monstersInPlay.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
          newState.player.monstersInPlay[i].canAttack = true;
        })
      }
    }
    stateObj = await updateState(stateObj)

    console.log("starting encounter")
    stateObj = shuffleDraw(stateObj, stateObj.player);
    stateObj = shuffleDraw(stateObj, stateObj.opponent);
    for (let h=0; h < 4; h++) {
      console.log("drawing a card")
      stateObj = await drawACard(stateObj, stateObj.player)
      stateObj = await drawACard(stateObj, stateObj.opponent)
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
  if (defenderIndex === 99) {
      document.querySelectorAll("#playerMonstersInPlay .avatar")[attackerIndex].classList.add("attack-windup")
      await pause(300)
      document.querySelectorAll("#enemyMonstersInPlay .hp-hand-div")[0].classList.add("attack-impact")
      document.querySelectorAll("#playerMonstersInPlay .attack" )[attackerIndex].classList.add("attack-bulge")
      await pause(200)
      stateObj = immer.produce(stateObj, (newState) => {
      let AttackingMonster = newState.player.monstersInPlay[attackerIndex]
      console.log(AttackingMonster.name + " dealt " + AttackingMonster.attack + " damage to the opponent")
      newState.opponent.currentLife -= AttackingMonster.attack
      AttackingMonster.canAttack = false
      newState.playerToAttackIndex = false;
      newState.enemyToBeAttackedIndex = false
    })
  } else {
      document.querySelectorAll("#playerMonstersInPlay .avatar")[attackerIndex].classList.add("attack-windup")
      await pause(300)
      document.querySelectorAll("#enemyMonstersInPlay .avatar")[defenderIndex].classList.add("attack-impact")
      document.querySelectorAll("#playerMonstersInPlay .attack" )[attackerIndex].classList.add("attack-bulge")
      await pause(200)
      stateObj = immer.produce(stateObj, (newState) => {
        let AttackingMonster = newState.player.monstersInPlay[attackerIndex]
        let DefendingMonster = newState.opponent.monstersInPlay[defenderIndex]
        console.log("Player's " + AttackingMonster.name + " dealt " + AttackingMonster.attack + " damage to enemy's " + DefendingMonster.name + " and took " + DefendingMonster.attack + " damage")
        DefendingMonster.currentHealth -= AttackingMonster.attack
        AttackingMonster.currentHealth -= DefendingMonster.attack
        AttackingMonster.canAttack = false
        newState.playerToAttackIndex = false;
        newState.enemyToBeAttackedIndex = false
      })
      stateObj = await updateState(stateObj)
      await pause(200)
      document.querySelectorAll("#enemyMonstersInPlay .avatar")[defenderIndex].classList.remove("attack-impact")
      document.querySelectorAll("#playerMonstersInPlay .avatar")[attackerIndex].classList.remove("attack-windup")
      document.querySelectorAll("#playerMonstersInPlay .attack" )[attackerIndex].classList.remove("attack-bulge")
      stateObj = await changeState(stateObj)
      
    } 
  await changeState(stateObj);
  return stateObj
}

async function playDemonFromHand(stateObj, cardObj, playerSummoning, pauseTime=1000, stateChange=true) {
  stateObj = await immer.produce(stateObj, async (newState) => {
    let player = (playerSummoning.name === "player") ? newState.player : newState.opponent
    player.currentEnergy -= cardObj.baseCost;
  })

  stateObj = await summonDemon(stateObj, cardObj, playerSummoning, pauseTime, stateChange)
  return stateObj;
}

//changes state
async function summonDemon(stateObj, cardObj, playerSummoning, pauseTime=1000, pushToEnd=true, stateChange=true) {
  let changeCanPlay = (stateObj.canPlay) ? true : false
    stateObj = immer.produce(stateObj, (newState) => {
      let player = (playerSummoning.name === "player") ? newState.player : newState.opponent
      player.monstersInPlay.push(cardObj)
      if (changeCanPlay) {
        newState.canPlay = false
      }
    })
  if (stateChange) {
    stateObj = await changeState(stateObj)
  }
  if (pushToEnd) {
    let queryString = (playerSummoning.name === "player") ? "#playerMonstersInPlay .avatar" : "#enemyMonstersInPlay .avatar"
    let cardString = (playerSummoning.name === "player") ? "#playerMonstersInPlay .card" : "#enemyMonstersInPlay .card"
    let monstersLength = (playerSummoning.name === "player") ? stateObj.player.monstersInPlay.length : stateObj.opponent.monstersInPlay.length
    // let animAvatar = document.createElement('img');
    // animAvatar.classList.add("avatar");
    //       let mArray = stateObj[playerSummoning.name].monstersInPlay
    //       animAvatar.src = mArray[mArray.length-1].avatar;
    //       animAvatar.setAttribute("draggable", "false")
    //       animAvatar.setAttribute("id", "anim-avatar")
    //       document.querySelectorAll(cardString)[monstersLength-1].append(animAvatar)
    document.querySelectorAll(cardString)[monstersLength-1].classList.add("opaque")
    document.querySelectorAll(queryString)[monstersLength-1].classList.add("summon-demon")
    await pause(500)
    document.querySelectorAll(cardString)[monstersLength-1].classList.remove("opaque")
    await pause(600)
    document.querySelectorAll(queryString)[monstersLength-1].classList.remove("summon-demon")
  }

  if (changeCanPlay) {
    stateObj = immer.produce(stateObj, (newState) => {
        newState.canPlay = true
    })
  }

  if (stateChange) {
    stateObj = await changeState(stateObj)
  }
  return stateObj
}

//changes state with summonDemon
async function createNewMinion(stateObj, playerSummoning, attack=1, currentHealth=1, baseCost=1, maxHealth=1, name="Elemental", minion=potgrowth, pauseTime=1000, 
                              property1name=false, property1valIncrease=1, stateChange=true) {
  let newpot = {...minion}
  newpot.attack = attack
  newpot.currentHealth = currentHealth
  newpot.baseCost = baseCost
  newpot.maxHealth = maxHealth
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
    player.currentLife += lifeToGain;
  })

  if (playerSummoning.name === "player" && playerSummoning.quest.title === "Gain Life") {
    stateObj = immer.produce(stateObj, (newState) => {
      newState.player.quest.targetLife -= lifeToGain;
    })
    if (stateObj.player.quest.targetLife <= 0) {
      stateObj = await stateObj.player.quest.action(stateObj, stateObj.player)
      stateObj = immer.produce(stateObj, (newState) => {
        newState.player.quest = false
      })
    }
  } 
  stateObj = await changeState(stateObj)
  return stateObj;
}

//can fix maxHealth

async function giveDemonStats(stateObj, playerObj, index, stat1Name, stat1Value, inHand=false, stat2Name=false, stat2Value=false, stat3Name=false, stat3Value=false) {
  stateObj = immer.produce(stateObj, (newState) => {
    let player = (playerObj.name === "player") ? newState.player : newState.opponent
    let array = (inHand) ? player.encounterHand : player.monstersInPlay
    if (stat2Name) {
      if (stat2Name === "maxHealth") {
        let missingHP = array[index].maxHealth - array[index].currentHealth
        stat2Value = ((missingHP > array[index].currentHealth) ? 0 : array[index].currentHealth-missingHP)
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
    let missingHP = monstersArray[index].maxHealth - monstersArray[index].currentHealth
    let healAmount = (HPToHeal >= missingHP) ? HPToHeal : missingHP
    if (healAmount > 0) {
      monstersArray[index].currentHealth += healAmount
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
    monsterChoiceDiv.classList.add("deck-choice-window");
    document.getElementById("app").appendChild(monsterChoiceDiv);
  
    for (let p =0; p < potentialPlayers.length; p++) {
      let monsterDiv = document.createElement("Div");
      monsterDiv.id = p;
      monsterDiv.classList.add("deck-to-choose");
  
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

  function renderChooseHeroPower(stateObj) {
    document.getElementById("app").innerHTML = ""
    let HeroPowerChoiceDiv = document.createElement("Div");
    HeroPowerChoiceDiv.classList.add("hp-choice-window");
  
    for (let p = 0; p < heroPowers.length; p++) {
      let heroPowerDiv = document.createElement("Div");
      heroPowerDiv.id = p;
      heroPowerDiv.classList.add("hero-power-to-choose");
  
      heroPowerDiv.addEventListener("click", async function () {
        chooseThisHeroPower(stateObj, p);
      });
      let ManaDiv = document.createElement("Div");
      ManaDiv.classList.add('hero-power-cost')
      ManaDiv.textContent = heroPowers[p].baseCost;
      let HPText = document.createElement("p");
      HPText.textContent = heroPowers[p].text(stateObj, stateObj.player);
      heroPowerDiv.append(ManaDiv, HPText);
      HeroPowerChoiceDiv.append(heroPowerDiv)
    }
      document.getElementById("app").appendChild(HeroPowerChoiceDiv);
  };

//changeState issues iwth onDeath calling itself probably causing this; look into the minion 
async function handleDeathsForPlayer(stateObj, playerObj) {
  if (playerObj.monstersInPlay.length > 0) {
    let indexesToDelete = [];
    playerObj.monstersInPlay.forEach(function (monster, index) {
      if (monster.currentHealth <= 0) {
        console.log(playerObj.name + "'s " + monster.name + " has died.")
        console.log(index)
        indexesToDelete.push(index);
      }
    });
    //if a monster has died
    if (indexesToDelete.length > 0) {
      indexesToDelete.reverse()
      //await opponentDeathAnimation(indexesToDelete)
      for (let i = 0; i < indexesToDelete.length; i++) {
        let cards = (playerObj.name === "player") ? document.querySelectorAll("#playerMonstersInPlay .card") : document.querySelectorAll("#enemyMonstersInPlay .card")
        let avString = (playerObj.name === "player") ? document.querySelectorAll("#playerMonstersInPlay .avatar") : document.querySelectorAll("#enemyMonstersInPlay .avatar")
        cards[indexesToDelete[i]].classList.add("opaque")
        avString[indexesToDelete[i]].classList.add("avatar-death")
        await pause(800)
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
          stateObj = await updateState(stateObj)
          await pause(200)
        }
    }
  }
  return stateObj
}



async function handleDeaths(stateObj) {
  if (stateObj.fightStarted === true) {
    stateObj = await(handleDeathsForPlayer(stateObj, stateObj.opponent))

    if (stateObj.opponent.currentLife <= 0) {
        stateObj = await resetAfterFight(stateObj)
        stateObj = await changeStatus(stateObj, Status.ChooseEncounterCardReward)
    }
    stateObj = await(handleDeathsForPlayer(stateObj, stateObj.player))

    if (stateObj.player.currentLife <= 0) {
      stateObj = renderLostFight(stateObj)
    }
  }
  return stateObj;
}

async function changeStatus(stateObj, newStatus, countsAsEventSkipForChangeStatus=false, skipGoldGift=50) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.status = newStatus;
  })
  stateObj = await changeState(stateObj);
  return stateObj;
}

function createConjurerTrickButton(stateObj, playerObj) {
  let ConjurerTrickButton = document.createElement("Button");
  ConjurerTrickButton.classList.add("conjurer-trick-button")
  ConjurerTrickButton.textContent = `{${stateObj[playerObj.name].heroPower.cost(stateObj, stateObj[playerObj.name])} mana}: ` + stateObj[playerObj.name].heroPower.text(stateObj, playerObj)
  if (playerObj.name === "player") {
    if (stateObj.canPlay === true && stateObj.player.currentEnergy >= stateObj.player.heroPower.cost(stateObj, playerObj)) {
      ConjurerTrickButton.classList.add("conjurer-trick-button-playable")
      ConjurerTrickButton.addEventListener("click", function() {
        stateObj.player.heroPower.action(stateObj, stateObj.player)
      })
    } else {
      ConjurerTrickButton.classList.add("conjurer-trick-button-greyed-out")
    }
  }
  
  return ConjurerTrickButton
}

function createHandEndDiv(stateObj, playerObj) {
  let trickButton = createConjurerTrickButton(stateObj, stateObj[playerObj.name])
  let handEndDiv = document.createElement("Div");
  handEndDiv.classList.add("hand-end-div")
  if (playerObj.name === "player") {
    console.log("render player with feat " + playerObj.heroPower.text)
    handEndDiv.classList.add("player-hand-end") 
  } else {
    console.log("render opponent with feat " + playerObj.heroPower.text)
    handEndDiv.classList.add("opponent-hand-end")
  }
  let HPManaDiv = document.createElement("Div");
  HPManaDiv.classList.add("hp-mana-end-div")
  let HPDiv = document.createElement("Div");  
  HPDiv.classList.add("hp-hand-div")
  HPDiv.textContent = stateObj[playerObj.name].currentLife;
  let ManaDiv = document.createElement("Div");
  ManaDiv.classList.add("stats-container-div", "mana-hand-div")
  ManaDiv.textContent = stateObj[playerObj.name].currentEnergy
  HPManaDiv.append(ManaDiv, HPDiv)
  if (playerObj.name === "player") {
    if (playerObj.quest !== false) {
      let questText = document.createElement("p");
      questText.textContent = stateObj.player.quest.text(stateObj, stateObj.player)
      handEndDiv.append(HPManaDiv, questText, trickButton)
    } else {
      handEndDiv.append(HPManaDiv, trickButton)
    }
  } else {
    handEndDiv.append(trickButton, HPManaDiv)
  }
  return handEndDiv
}

function renderHand(stateObj) {
  document.getElementById("handContainer2").innerHTML = "";
  let handEndDiv = createHandEndDiv(stateObj, stateObj.player)
  document.getElementById("handContainer2").append(handEndDiv)
  if (stateObj.player.encounterHand.length > 0) {
    stateObj.player.encounterHand.forEach(async function (cardObj, index) {
      await renderCard(stateObj, stateObj.player.encounterHand, index, stateObj.player, "#handContainer2", functionToAdd=false)
    });
  }
}

function renderPlayerMonstersInPlay(stateObj) {
  document.getElementById("playerMonstersInPlay").innerHTML = "";
  if (stateObj.player.monstersInPlay.length > 0) {
    stateObj.player.monstersInPlay.forEach(async function (cardObj, index) {
      await renderCard(stateObj, stateObj.player.monstersInPlay, index, stateObj.player, "#playerMonstersInPlay", functionToAdd=false)
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
  let endTurnButtonText = document.createElement("P");
  let endTurnButtonText2 = document.createElement("P");
  let endTurnButtonText3 = document.createElement("P");
  endTurnButtonText = "   (+"
  endTurnButtonText2.classList.add("hand-card-cost")
  endTurnButtonText2 = stateObj.player.turnEnergy
  endTurnButtonText3 = ")"
  endTurnButton.append(endTurnButtonText, endTurnButtonText2, endTurnButtonText3)
  document.querySelector("#playerMonstersInPlay").append(endTurnButton);
}

function renderEnemyMonstersInPlay(stateObj) {
  document.getElementById("enemyMonstersInPlay").innerHTML = "";
  let handEndDiv = createHandEndDiv(stateObj, stateObj.opponent)
  document.getElementById("enemyMonstersInPlay").append(handEndDiv)
  if (stateObj.opponent.monstersInPlay.length > 0) {
    stateObj.opponent.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.opponent.monstersInPlay, index, stateObj.opponent, "#enemyMonstersInPlay", functionToAdd=false)
    });
  }
  
}

function renderEnemyMonstersToChoose(stateObj) {
  document.getElementById("enemyMonstersInPlay").innerHTML = "";
  if (stateObj.opponent.monstersInPlay.length > 0) {
    stateObj.opponent.monstersInPlay.forEach(function (cardObj, index) {
      renderCard(stateObj, stateObj.opponent.monstersInPlay, index, stateObj.opponent, "#enemyMonstersInPlay", functionToAdd=false)
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
  let restOfScreen = renderFightDiv();
  document.querySelector("#app").append(restOfScreen);
  renderEnemyMonstersInPlay(stateObj);
  renderPlayerMonstersInPlay(stateObj);
  renderHand(stateObj);
  
}

async function renderChooseEnemy(stateObj) {
  document.getElementById("app").innerHTML = ""
  let restOfScreen = renderFightDiv();
  document.querySelector("#app").append(restOfScreen);
  
  renderEnemyMonstersInPlay(stateObj);
  renderPlayerMonstersInPlay(stateObj);
  renderHand(stateObj);
  
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
}

async function renderWonFight(stateObj) {
  document.getElementById("app").innerHTML = "<p>You won the fight!</p> <button onClick=changeState(gameStartState)> Click me to retry</button>"
}


async function renderCard(stateObj, cardArray, index, playerObj, divName=false, functionToAdd=false) {
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
          
          
          

          let cardStatsDiv = document.createElement("Div");
          cardStatsDiv.classList.add("card-stats-row")

          let attackContainer = document.createElement("Div");
          attackContainer.classList.add("attack-container")
          let cardAttackDiv = document.createElement("Div");
          cardAttackDiv.classList.add("attack")
          cardAttackDiv.textContent = cardObj.attack;
          attackContainer.append(cardAttackDiv)

          let cardDefendDiv = document.createElement("Div");
          cardDefendDiv.classList.add("defense")
          let defendContainer = document.createElement("Div");
          defendContainer.classList.add("defense-container")
          cardDefendDiv.textContent = (cardObj.currentHealth > 0) ? cardObj.currentHealth : 0
          defendContainer.append(cardDefendDiv)

          cardStatsDiv.append(attackContainer, avatar, defendContainer)
          cardDiv.append(cardStatsDiv, cardText);
  
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
            cardDiv.addEventListener("click", async function () {
              await selectThisEnemyIndex(stateObj, index);
            });

          } else if (cardArray === stateObj.player.monstersInPlay && cardArray[index].canAttack === true) {
            if (stateObj.canPlay === true) {
            const enemyMonsters = document.querySelector("#enemyMonstersInPlay");
              cardDiv.setAttribute("draggable", "true")
              cardDiv.classList.add("can-attack");
              if (cardArray[index].elementType === "water") {
                cardDiv.classList.add("can-attack-water");
              } else if (cardArray[index].elementType === "earth") {
                cardDiv.classList.add("can-attack-earth");
              } else if (cardArray[index].elementType === "air") {
                cardDiv.classList.add("can-attack-air");
              } else {
                cardDiv.classList.add("can-attack-fire");
              }
              cardDiv.addEventListener("click", function () {
                playerMonsterIsAttacking(stateObj, index, stateObj.player.monstersInPlay);
              });

              cardDiv.addEventListener("dragstart", (event) => {
                  event.dataTransfer.setData("text/plain", cardDiv.id);
                });
                  const enemyHealthDiv = document.querySelectorAll(".opponent-hand-end")[0];
                  enemyHealthDiv.addEventListener("dragover", (event) => {
                    console.log("drag")
                    event.preventDefault();
                  });

                    enemyHealthDiv.addEventListener("drop", (event) => {
                      
                      console.log("drop")
                      const cardId = event.dataTransfer.getData("text/plain");
                      
                      if (cardId && cardId[0] === "p") {
                        str = cardId.charAt(cardId.length-1) 
                        console.log("completeing attack index " + str)
                        completeAttack(stateObj, 0, 99);
                        event.stopImmediatePropagation();
                      }
                      event.preventDefault();
                    });

                    enemyMonsters.addEventListener("dragover", (event) => {
                      console.log("dragged over")
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

          if (stateObj.status === Status.chooseEnemyMonster) {
            if (cardArray !== stateObj.opponent.monstersInPlay) {
              if (cardArray !== stateObj.player.monstersInPlay || index !== stateObj.playerToAttackIndex) {
                cardDiv.classList.add("select-grey")
              }
            }
          }
          if (divName) {
            document.querySelector(divName).appendChild(cardDiv);
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


 async function PlayACardImmer(stateObj, cardObj, cardIndexInHand, playerObj) {
  if (playerObj.name === "player") {
    document.querySelectorAll("#handContainer2 .card")[cardIndexInHand].classList.add("summon-hand")
    document.querySelectorAll("#handContainer2 .avatar")[cardIndexInHand].classList.add("summon-avatar")
    await pause(300)
  }

  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.encounterHand.splice(cardIndexInHand, 1);
  })
  
    if (cardObj.cardType === "minion") {
      stateObj = await playDemonFromHand(stateObj, cardObj, playerObj, pauseTime = (cardObj.pauseTime) ? cardObj.pauseTime : 1000, stateChange=true)
    }

    stateObj = immer.produce(stateObj, (newState) => {
      for (let h = 0; h < newState[playerObj.name].encounterHand.length; h++) {
        if (newState[playerObj.name].encounterHand[h].growProperty) {
          newState[playerObj.name].encounterHand[h].attack +=1;
          newState[playerObj.name].encounterHand[h].currentHealth +=1;
        }
      }
    })
//      let playedCard = newState.player.encounterHand[cardIndexInHand]
      

    stateObj = await changeState(stateObj);
    return stateObj;
}
  
  async function playACard(stateObj, cardIndexInHand, arrayObj, playerObj) {
    let monsters = stateObj[playerObj.name].monstersInPlay
    stateObj = await PlayACardImmer(stateObj, stateObj[playerObj.name].encounterHand[cardIndexInHand], cardIndexInHand, playerObj);
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

function chooseThisMonster(stateObj, index) {
    stateObj = immer.produce(stateObj, (newState) => {
      newState.player.encounterDraw = [...potentialPlayers[index].deck];
      newState.player.encounterDeck = [...potentialPlayers[index].deck];
      newState.status = Status.ChoosingHeroPower
      let i = Math.floor(Math.random() * potentialEnemies.length)
      newState.opponent.encounterDraw = [...potentialEnemies[i].deck],
      newState.opponent.heroPower = {...heroPowers[potentialEnemies[i].heroPower]}
    })
   stateObj = updateState(stateObj);
  return stateObj;
}

function chooseThisHeroPower(stateObj, index) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.heroPower = {...heroPowers[index]}
    newState.status = Status.inFight
  })
 stateObj = updateState(stateObj);
return stateObj;
}

function fisherYatesShuffle(arrayObj) {
  let arrayCopy = [...arrayObj];
  for (let x = arrayCopy.length-1; x > 0; x--) { 
    let y = Math.floor(Math.random() * (x+1)); 
    let temp = arrayCopy[x] 
    arrayCopy[x] = arrayCopy[y] 
    arrayCopy[y] = temp 
 } 
 return arrayCopy;
}

async function chooseThisCard(stateObj, index, sampledCardPool) {
  console.log("added " + sampledCardPool[index].name + " to deck")
  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.encounterDeck.push(sampledCardPool[index]);
    newState.fightStarted = false
  })

    //stateObj = await changeState(stateObj)  
    stateObj = await changeStatus(stateObj, Status.inFight)
  return stateObj;
}

async function renderClickableCardList(stateObj, cardArray, divName, functionToAdd) {
  cardArray.forEach(async function (cardObj, index) {
    await renderCard(stateObj, cardArray, index, stateObj.player, divName, functionToAdd=chooseThisCard)
  })
}

async function renderChooseEncounterCardReward(stateObj) {
  let shuffledCardPool = fisherYatesShuffle(playerElementals);
  let sampledCardPool = shuffledCardPool.slice(0, 3);

  document.getElementById("app").innerHTML = ""
  let rewardChoiceDiv = document.createElement("Div")
  rewardChoiceDiv.classList.add("reward-choice-div")
  document.getElementById("app").append(rewardChoiceDiv)
  await renderClickableCardList(stateObj, sampledCardPool, ".reward-choice-div", chooseThisCard);
  //skipToTownButton(stateObj, "I choose not to add any of these cards to my deck (+5 gold)", ".remove-div", cardSkip=true);
  //renderCardPile(stateObj, stateObj.playerDeck, "deckDiv");
};

async function resetAfterFight(stateObj) {
  stateObj = immer.produce(stateObj, (newState) => {
    newState.fightStarted = false;
    newState.status = Status.ChoosingMonster;
    newState.playerToAttackIndex = false;
    newState.enemyToBeAttackedIndex = false;
    newState.canPlay = true;
    newState.turnCounter = 0
    newState.cardsPerTurn = 0

    newState.player.maxLife += 1
    newState.player.currentLife = newState.player.maxLife 

    newState.player.lifeRequirementReduction
    newState.player.endofTurnMultiplier
    newState.player.onDeathMultiplier
    newState.player.whenPlayedMultiplier
    newState.player.currentEnergy = 1
    newState.player.turnEnergy = 2
    newState.player.encounterDraw = [];
    newState.player.monstersInPlay = [];
    newState.player.encounterHand = []

    newState.opponent.encounterDraw = [];
    newState.opponent.monstersInPlay = [];
    newState.opponent.encounterHand = []
    newState.opponent.maxLife += 1
    newState.opponent.currentLife = newState.player.maxLife 

    newState.opponent.lifeRequirementReduction
    newState.opponent.endofTurnMultiplier
    newState.opponent.onDeathMultiplier
    newState.opponent.whenPlayedMultiplier
    newState.opponent.currentEnergy = 1
    newState.opponent.turnEnergy = 2

  })

  let gameStartState = {
  
    opponent: {
      name: "opponent",
      currentLife: 10,
  
      currentEnergy: 1,
      turnEnergy: 2,
  
      encounterDraw: [],
      monstersInPlay: [],
      encounterHand: [],
  
      lifeRequirementReduction: 0,
      endofTurnMultiplier: 1,
      onDeathMultiplier: 1,
      whenPlayedMultiplier: 1,
  
      cardsPerTurn: 0,
  
      
    },

  
  }
  stateObj = await changeState(stateObj)
  
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
    newState[playerShuffling.name].encounterDraw = shuffleArray(stateObj[playerShuffling.name].encounterDraw);
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
  await updateState(stateObj)
  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.monstersInPlay.forEach(function (monsterObj, index) {
      monsterObj.canAttack = false;
    })
  });
  for (let i = stateObj.player.monstersInPlay.length-1; i > -1; i--) {
    let card = stateObj.player.monstersInPlay[i]
    if (typeof(card.endOfTurn) === "function" && stateObj.status === Status.inFight) {
      await executeAbility("player", i)
      for (let j = 0; j < stateObj.player.endofTurnMultiplier; j++) {
        stateObj = await card.endOfTurn(stateObj, i, stateObj.player.monstersInPlay, stateObj.player);
      }
      stateObj = await changeState(stateObj)
    }  
  }
  stateObj = await drawACard(stateObj, stateObj.opponent)
  stateObj = await endTurnIncrement(stateObj);
  await pause(200)
  stateObj = await enemyTurn(stateObj);
  await pause(200)

  stateObj = immer.produce(stateObj, (newState) => {
    newState.player.currentEnergy += newState.player.turnEnergy;
    newState.opponent.currentEnergy += newState.opponent.turnEnergy
    newState.player.turnEnergy += 1;
    newState.opponent.turnEnergy += 1
    
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
  await updateState(stateObj)
}

async function attackAnimation(attackerName, attackerIndex, targetName, targetIndex) {
  let attackerString = (attackerName === "player") ? "#playerMonstersInPlay .avatar" : "#enemyMonstersInPlay .avatar"
  let hexString = (attackerName === "player") ? "#playerMonstersInPlay .attack" : "#enemyMonstersInPlay .attack"
  document.querySelectorAll(attackerString)[attackerIndex].classList.add("attack-windup")
  await pause(300)
  //document.querySelectorAll(attackerString)[attackerIndex].classList.remove("attack-windup")
  let targetString = (targetName === "player") ? "#playerMonstersInPlay .avatar" : "#enemyMonstersInPlay .avatar"
  document.querySelectorAll(targetString)[targetIndex].classList.add("attack-impact")
  document.querySelectorAll(hexString)[attackerIndex].classList.add("attack-bulge")
  await pause(400)
  document.querySelectorAll(targetString)[targetIndex].classList.remove("attack-impact")
  document.querySelectorAll(attackerString)[attackerIndex].classList.remove("attack-windup")
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
  await pause(500)
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
          newState.player.monstersInPlay[playerTargetIndex].currentHealth -= newState.opponent.monstersInPlay[i].attack
          newState.opponent.monstersInPlay[i].currentHealth -= newState.player.monstersInPlay[playerTargetIndex].attack
        })
        await attackAnimation("opponent", i, "player", playerTargetIndex)
        // await addImpact("opponent", i);
        // await addImpact("player", playerTargetIndex);
      } else {
        stateObj = await immer.produce(stateObj, async (newState) => {
          console.log(stateObj.opponent.monstersInPlay[i].name + " deals " + stateObj.opponent.monstersInPlay[i].attack + " damage to you.")
          newState.player.currentLife -= newState.opponent.monstersInPlay[i].attack
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
  let usedHeroPower = false;

  if (stateObj.opponent.heroPower.priority > 0  &&  stateObj.opponent.currentEnergy >= stateObj.opponent.heroPower.cost(stateObj, stateObj.opponent)) {
    console.log("opponent used their hero power")
    stateObj = await stateObj.opponent.heroPower.action(stateObj, stateObj.opponent)
    usedHeroPower = true
  }

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
        stateObj = await playDemonFromHand(stateObj, cardObj, stateObj.opponent)
        stateObj = await immer.produce(stateObj, async (newState) => {
          newState.opponent.encounterHand.splice(indexesToDelete[i], 1)
        })
        stateObj = await changeState(stateObj)
        await pause(750)
      }
    }
    if (stateObj.opponent.currentEnergy >= stateObj.opponent.heroPower.cost(stateObj, stateObj.opponent) && usedHeroPower === false) {
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
  if (playerDrawing.encounterHand.length > 6 ) {
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

  // animString = "draw-div-anim-" + stateObj[playerDrawing.name].encounterHand.length
  // document.querySelectorAll(".draw-animation-div")[handLength].classList.add(animString)
  // await pause(350)


  //checking quest completion
  if (playerDrawing.name === "player" && playerDrawing.quest.title === "Draw Cards") {
    stateObj = immer.produce(stateObj, (newState) => {
      newState.player.quest.targetCards -= 1;
    })
    if (stateObj.player.quest.targetCards <= 0) {
      stateObj = await stateObj.player.quest.action(stateObj, stateObj.player)
      stateObj = immer.produce(stateObj, (newState) => {
        newState.player.quest = false
      })
    }
  } 
  stateObj = await changeState(stateObj)
  return stateObj;
}



async function applyClassToFilter(elementArray, className, duration) {
  elementArray.forEach((element) => {
    element.classList.add(className);
  })
  await pause(duration)
  elementArray.forEach((element) => {
    element.classList.remove(className);
  })
  await pause(duration)
}