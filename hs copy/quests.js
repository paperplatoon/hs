let quests = [
    {
      title: "Draw Cards",
      targetCards: 4,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Draw ${playerObj.quest.targetCards} cards` : `Draw 7 cards` },
      action: async (stateObj, playerObj) => {
        stateObj = await addQuestReward(stateObj, stateObj[playerObj.name], drawcardsReward)
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
          stateObj = await addQuestReward(stateObj, stateObj[playerObj.name], gainLifeReward)
          return stateObj;
        },
    },

    {
      title: "Face Damage",
      targetDamage: 5,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Deal ${playerObj.quest.targetDamage} damage to opponent's Life` : `Deal 5 damage to opponent's Life` },
        action: async (stateObj, playerObj) => {
          stateObj = await addQuestReward(stateObj, stateObj[playerObj.name], dealDamageReward)
          return stateObj;
        },
    },
  ]

  let drawcardsReward = {
    name: "Reward 1",
    elementType: "air",
    cardType: "minion",
    tribe: "none",
    baseCost: 3,
    attack: 3,
    currentHealth: 3,
    maxHealth: 3,
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

  let dealDamageReward = {
    name: "Reward 2",
    elementType: "earth",
    cardType: "minion",
    tribe: "none",
    baseCost: 3,
    attack: 2,
    currentHealth: 5,
    maxHealth: 5,
    avatar: "img/waterpuddle.png",
    hpToGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `Play: Draw 3 cards` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      for (let c=0; c < 3; c++) {
        stateObj = await drawACard(stateObj, stateObj[playerObj.name])
      }
      return stateObj;
    }
  };

  let gainLifeReward = {
    name: "Reward 2",
    elementType: "earth",
    cardType: "minion",
    tribe: "none",
    baseCost: 3,
    attack: 2,
    currentHealth: 5,
    maxHealth: 5,
    avatar: "img/waterpuddle.png",
    hpToGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `Play: Draw 3 cards` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      for (let c=0; c < 3; c++) {
        stateObj = await drawACard(stateObj, stateObj[playerObj.name])
      }
      return stateObj;
    }
  };