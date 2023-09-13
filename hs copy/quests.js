let quests = [
    {
      title: "Draw Cards",
      targetCards: 7,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Draw ${playerObj.quest.targetCards} cards` : `Draw 7 cards` },
      action: async (stateObj, playerObj) => {
        console.log("executing reward")
          stateObj = immer.produce(stateObj, (newState) => {
            newState[playerObj.name].encounterHand.push(drawcardsReward)
          })
        stateObj = await updateState(stateObj)
        return stateObj;
      },
    },
  
    {
      title: "Gain Life",
      targetLife: 7,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Gain ${playerObj.quest.targetLife} Life` : `Gain 7 life` },
      action: async (stateObj, playerObj) => {
        for (let c=0; c < 3; c++) {
          stateObj = await drawACard(stateObj, stateObj.player)
        }
        
        return stateObj;
      },
    },
  ]

  let drawcardsReward = {
    name: "Card Drawer",
    elementType: "air",
    cardType: "minion",
    tribe: "none",
    baseCost: 3,
    attack: 4,
    currentHealth: 4,
    maxHealth: 4,
    avatar: "img/waterpuddle.png",
    hpToGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `Play: Reduce cost of cards in hand by (1)` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
        for (let c=0; c < stateObj[playerObj.name].encounterHand.length; c++) {
            stateObj = immer.produce(stateObj, (newState) => {
              let costReduction = (newState[playerObj.name].encounterHand[c].baseCost > 0) ? 1 : 0
              newState[playerObj.name].encounterHand[c].baseCost -= costReduction
            })
        }
        stateObj = await changeState(stateObj)
        return stateObj;
    }
  };