//play 5 minions
//summon 7 minions
//grant other minions +4 HP


let quests = [
  //0
    {
      title: "Draw Cards",
      target: 7,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Draw ${playerObj.quest.target} cards` : `Draw 7 cards` },
      action: async (stateObj, playerObj) => {
        stateObj = await addQuestReward(stateObj, stateObj[playerObj.name], drawcardsReward)
        return stateObj;
      },
    },
  //1
    {
      title: "Gain Life",
      target: 7,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Gain ${playerObj.quest.target} Life` : `Gain 7 life` },
        action: async (stateObj, playerObj) => {
          stateObj = await addQuestReward(stateObj, stateObj[playerObj.name], gainLifeReward)
          return stateObj;
        },
    },
//2
    {
      title: "Face Damage",
      target: 5,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Deal ${playerObj.quest.target} damage to opponent's Life` : `Deal 5 damage to opponent's Life` },
        action: async (stateObj, playerObj) => {
          stateObj = await addQuestReward(stateObj, stateObj[playerObj.name], dealDamageReward)
          return stateObj;
        },
    },
//3
    {
      title: "Grant Health",
      target: 4,
      conditionMet: false,
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Give ${playerObj.quest.target} Health to friendly demons` : `Give 4 Health to friendly demons` },
        action: async (stateObj, playerObj) => {
          stateObj = await addQuestReward(stateObj, stateObj[playerObj.name], grantHealthReward)
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
    elementType: "fire",
    cardType: "minion",
    tribe: "none",
    baseCost: 3,
    attack: 4,
    currentHealth: 2,
    maxHealth: 2,
    avatar: "img/waterpuddle.png",
    hpToGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `Play: Deal 4 damage to all enemy demons` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      const mLength = (playerObj.name === "player") ? stateObj.opponent.monstersInPlay.length : stateObj.player.monstersInPlay.length
      for (let e=0;  e < mLength; e++) {
        stateObj = immer.produce(stateObj, (newState) => {
          const mArray = (playerObj.name === "player") ? newState.opponent.monstersInPlay : newState.player.monstersInPlay
          mArray[e].currentHealth -= 4
          console.log(mArray[e].name + "has taken 4 damage and is now at " + mArray[e].currentHealth)
        })
      }
      stateObj = await changeState(stateObj)
      return stateObj;
    }
  };

  let grantHealthReward = {
    name: "Health Reward",
    elementType: "water",
    cardType: "minion",
    tribe: "none",
    baseCost: 4,
    attack: 4,
    currentHealth: 4,
    maxHealth: 4,
    avatar: "img/waterpuddle.png",
    hpToGain: 1,
    canAttack: false,
    text: (state, index, array) => { return `Play: Summon a copy of your highest HP minion` },
    minReq: (state, index, array) => { return array[index].baseCost; },
    cost:  (state, index, array) => { return array[index].baseCost; },
    action: async (stateObj, index, array, playerObj) => {
      let mArray = (playerObj.name === "player") ? stateObj.player.monstersInPlay : stateObj.opponent.monstersInPlay
        if (mArray.length > 1) {
            let maxHealthIndex = false;
            let maxHealth = 0;
            for (let i=0; i < mArray.length-1; i++) {
                if (mArray[i].currentHealth > maxHealth) {
                    maxHealth = mArray[i].currentHealth
                    maxHealthIndex = i
                }
            }
            stateObj = await summonDemon(stateObj, mArray[maxHealthIndex], playerObj)
        }
        return stateObj;
    }
  };