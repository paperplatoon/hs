const Status = {
  inFight: renderDivs,
}

let sampleMonster = {
  name: "sample",
  baseCost: 1,
  text: "does nothing",
  attack: 3,
  currentHP: 4,
  maxHP: 4,
  avatar: "img/fireMonster.png",

  minReq: (state, index, array) => {
    return array[index].baseCost;
  },

  text: (state, index, array) => { 
    return `Battlecry: Deal 2 damage to a random enemy` 
  },

  cost:  (state, index, array) => {
    return array[index].baseCost;
  },

  action: async (stateObj, index, array) => {
    //await cardAnimationDiscard(index);
    //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
    stateObj = immer.produce(stateObj, (newState) => {
      newState.playerMonstersInPlay.push(sampleMonster)
      if (newState.enemyMonstersInPlay.length > 0) {
        let targetIndex = Math.floor(Math.random() * (stateObj.enemyMonstersInPlay.length));
        newState.enemyMonstersInPlay[targetIndex].currentHP -=2;
      }
    })
    return stateObj;
  }
}

let gameStartState = {
    playerHP: 50,
    encounterDraw: [],
    playerMonstersInPlay: [sampleMonster, sampleMonster],
    encounterHand: [],
    playerEnergy: 1,

    currentEnemyHP: 0,
    enemyMonstersInPlay: [sampleMonster, sampleMonster],
    enemyEnergy: 1,

    fightStarted: false,
    status: Status.inFight,
}



let state = {...gameStartState};
renderDivs(state)

// playerMonsterArray = Object.values(playerMonsters);
// opponentMonsterArray = Object.values(opponentMonsters);
// fireCardArray = Object.values(fireCardPool);
// waterCardArray = Object.values(waterCardPool);

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
      console.log("rendering monsters in play")
      stateObj.playerMonstersInPlay.forEach(function (cardObj, index) {
        console.log('about to render' + stateObj.playerMonstersInPlay[index])
        renderCard(stateObj, stateObj.playerMonstersInPlay, index, "playerMonstersInPlay", functionToAdd=false)
      });
    }
}

function renderEnemyMonstersInPlay(stateObj) {
    document.getElementById("enemyMonstersInPlay").innerHTML = "";
    if (stateObj.enemyMonstersInPlay.length > 0) {
      stateObj.enemyMonstersInPlay.forEach(function (cardObj, index) {
        renderCard(stateObj, stateObj.enemyMonstersInPlay, index, "enemyMonstersInPlay", functionToAdd=false)
      });
    }
}

async function renderDivs(stateObj) {
    if (stateObj.fightStarted === false) {
      console.log("triggering startEncounter")
      stateObj = await startEncounter(stateObj);
      stateObj = immer.produce(stateObj, (newState) => {
        newState.fightStarted = true;
      })
      //await changeState(stateObj);
      //stateObj = await drawAHand(stateObj);
    }
  
    document.getElementById("app").innerHTML = ""
    //let topRow = topRowDiv(stateObj, "app")
    let restOfScreen = renderFightDiv();
    document.querySelector("#app").append(restOfScreen);
    
    
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

// function renderCardPile(stateObj, cardArrayObj, divStringName) {
//     document.getElementById(divStringName).innerHTML = "";
//     if (cardArrayObj.length > 0) {
//         cardArrayObj.forEach(function (cardObj, index) {
//         renderCard(stateObj, cardArrayObj, index, divStringName)
//         });
//     }
// }

//setting up the fight

async function startEncounter(stateObj) {
    console.log('inside start encounter');
    
    stateObj = immer.produce(stateObj, (newState) => {
      newState.fightStarted = true;
      newState.encounterDraw = [sampleMonster, sampleMonster, sampleMonster];
      newState.encounterHand = [...newState.encounterDraw];
    })
    stateObj = shuffleDraw(stateObj);
    await changeState(stateObj);
    return stateObj
  }

  function shuffleDraw(stateObj) {
    stateObj = immer.produce(stateObj, (newState) => {
      console.log("sjuffling array inside an immer loop")
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



//rendering and changing
  async function renderScreen(stateObj) {
    let newState = {...stateObj}
    newState.status(stateObj)
  }

  async function changeState(newStateObj) {
    let stateObj = {...newStateObj}
    
    if (stateObj.status === Status.inFight) {
      stateObj = await handleDeaths(stateObj);
    }
    
    state = {...stateObj}
    renderScreen(stateObj);
    //renderDivs(state)
    return stateObj
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
          console.log("deleting opponent at index " + i);
          newState.enemyMonstersInPlay.splice(indexesToDelete[i], 1)
        }
      });
    }

    // if (stateObj.opponentMonster.length == 0) {
    //   stateObj = resetAfterFight(stateObj)
    // }

    // if (stateObj.playerMonster.currentHP <= 0) {
    //   stateObj = await changeStatus(stateObj, Status.DeathScreen) ;
    // }
  }
  return stateObj;
};


function renderCard(stateObj, cardArray, index, divName=false, functionToAdd=false) {
  console.log("rendering card " + index)
    let cardObj = cardArray[index];
    console.log("card obj is " + cardObj)
    let cardDiv = document.createElement("Div");
          cardDiv.id = "card-index-"+index;
          cardDiv.classList.add("card");
        //   let nonClickableArrays = [stateObj.encounterHand, stateObj.encounterDraw];
        //   if (nonClickableArrays.includes(cardArray)) {   
        //   } else if (divName === "deckDiv") {
        //     cardDiv.classList.add("card-pile-card")
        //   } else {
        //     cardDiv.classList.add("card-reward");
        //     cardDiv.classList.add("playable");
        //   }
  
  
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
              if (cardObj.minReq(stateObj, index, stateObj.encounterHand) <= stateObj.playerEnergy) {
                cardDiv.classList.add("playable");
                cardDiv.addEventListener("click", function () {
                  playACard(stateObj, index, stateObj.encounterHand);
                });
              };
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


  function PlayACardImmer(stateObj, cardIndexInHand) {
    stateObj = immer.produce(stateObj, (newState) => {
      let playedCard = newState.encounterHand[cardIndexInHand]
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

  