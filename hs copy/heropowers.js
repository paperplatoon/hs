let heroPowers = [
    //0
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
      baseCost: 2,
      used: false,
      title: "Gain Life",
      HPBuff: 2,
      priority: 0,
      buffText: (numberParameter) => {return `Your Feat gains ${numberParameter} extra life` },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Gain ${playerObj.heroPower.HPBuff} Life` : `Gain 2 Life` },
      action: async (stateObj, playerObj) => {
        stateObj = await gainLife(stateObj, stateObj[playerObj.name], stateObj[playerObj.name].heroPower.HPBuff)
        stateObj = immer.produce(stateObj, (newState) => {
          newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
        })
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  //1
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
      baseCost: 1,
      used: false,
      title: "Small Shield",
      HPBuff: 1,
      priority: 0,
      buffText: (numberParameter) => { return `Your Feat gives demons ${numberParameter} extra Health` },
      text: (stateObj, playerObj) => {  return (stateObj.status === Status.inFight) ? 
        `Give a random friendly pet +${stateObj[playerObj.name].heroPower.HPBuff} Defense`: `Give a random friendly pet +1 Health`},
      action: async (stateObj, playerObj) => {
        if (stateObj[playerObj.name].monstersInPlay.length > 0) {
          let t = Math.floor(Math.random() * stateObj[playerObj.name].monstersInPlay.length)
          stateObj = await giveDemonStats(stateObj, playerObj, t, "currentHealth", stateObj[playerObj.name].heroPower.HPBuff, false, "maxHealth", stateObj[playerObj.name].heroPower.HPBuff)
        }
        stateObj = immer.produce(stateObj, (newState) => {
          newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
        })
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  //2
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
      baseCost: 3,
      used: false,
      title: "Summon Growth",
      HPBuff: 1,
      priority: 1,
      buffText: (numberParameter) => { return `Your Feat's Growth gains +${numberParameter}/+${numberParameter}` },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
        `Summon a ${stateObj[playerObj.name].heroPower.HPBuff}/${stateObj[playerObj.name].heroPower.HPBuff} demon. Improve` : `Summon a 1/1 demon. Improve` },
      action: async (stateObj, playerObj) => {
        let c = playerObj.heroPower.HPBuff
        stateObj = await createNewMinion(stateObj, playerObj, c, c, c, c, name="Personal Growth", minion=potgrowth)
        stateObj = immer.produce(stateObj, (newState) => {
          newState[playerObj.name].currentEnergy -= newState[playerObj.name].heroPower.cost(stateObj, playerObj)
          newState[playerObj.name].heroPower.HPBuff += 1;
        })
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  //3
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
      baseCost: 1,
      used: false,
      title: "Gain Attack",
      HPBuff: 1,
      priority: 0,
      buffText: (numberParameter) => { return `Your Feat gives ${numberParameter} more Attack` },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
        `Give a random friendly minion +${stateObj[playerObj.name].heroPower.HPBuff} Attack` : `Give a random friendly minion +1 Attack` },
      action: async (stateObj, playerObj) => {
        if (stateObj[playerObj.name].monstersInPlay.length > 0) {
          let t = Math.floor(Math.random() * stateObj[playerObj.name].monstersInPlay.length)
          stateObj = await giveDemonStats(stateObj, playerObj, t, "attack", stateObj[playerObj.name].heroPower.HPBuff)
        }
        stateObj = immer.produce(stateObj, (newState) => {
          newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
        })
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  //4
    {
      cost: (stateObj, playerObj) => { return stateObj[playerObj.name].heroPower.baseCost },
      baseCost: 1,
      used: false,
      title: "Sting",
      HPBuff: 1,
      priority: 0,
      buffText: (numberParameter) => { return `Your Feat deals ${numberParameter} extra damage` },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
        `Deal ${stateObj[playerObj.name].heroPower.HPBuff} damage directly to your opponent` : `Deal 1 damage directly to your opponent` },
      action: async (stateObj, playerObj) => {
        stateObj = await dealFaceDamage(stateObj, stateObj[playerObj.name], attackerIndex="player", 1)
        stateObj = immer.produce(stateObj, (newState) => {
          newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
        })
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  //5
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost + (stateObj[playerObj.name].heroPower.HPBuff*2)) },
      baseCost: 4,
      used: false,
      title: "Erase",
      HPBuff: 1,
      priority: 0,
      buffText: (numberParameter) => { 
        let textString = `Your Feat kills ${numberParameter} extra demon`
        if (numberParameter > 1) { textString += `s`}
        textString += `. It costs ${2*numberParameter} more` 
        return textString
      },
      text: (stateObj, playerObj) => { 
        let textString = ``
        textString = (stateObj[playerObj.name].heroPower.HPBuff === 1 || stateObj.status !== Status.inFight) ? `Destroy a random enemy minion` : `Destroy ${stateObj[playerObj.name].heroPower.HPBuff} random enemy minions` 
        return textString
      },
      action: async (stateObj, playerObj) => {
        for (i =0; i < stateObj[playerObj.name].heroPower.HPBuff; i++) {
          stateObj = immer.produce(stateObj, (newState) => {
            console.log(playerObj.name)
            let mArray = (playerObj.name === "player") ? newState.opponent.monstersInPlay : newState.player.monstersInPlay
            if (mArray.length > 0) {
              let t = Math.floor(Math.random() * mArray.length)
              mArray[t].currentHealth = 0;
            }
            newState[playerObj.name].currentEnergy -= stateObj[playerObj.name].heroPower.cost(stateObj, playerObj)
          })
          stateObj = await changeState(stateObj)
        }
          return stateObj;
      },
    },
    //6 2 mana - draw a card
    {
      cost: (stateObj, playerObj) => { return stateObj[playerObj.name].heroPower.baseCost },
      baseCost: 2,
      used: false,
      title: "Analyze",
      HPBuff: 1,
      priority: 0,
      buffText: (numberParameter) => { 
        let textString = `Your Feat draws ${numberParameter} extra card`
        if (numberParameter > 1) {
          textString += `s`
        }
        return textString
      },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
        `Draw ${stateObj[playerObj.name].heroPower.HPBuff} card` : `Draw 1 card` },
      action: async (stateObj, playerObj) => {
        stateObj = await drawACard(stateObj, stateObj[playerObj.name])
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  ]