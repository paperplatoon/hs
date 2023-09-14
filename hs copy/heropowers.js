let heroPowers = [
    //1
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
      baseCost: 2,
      title: "Gain Life",
      lifeGain: 2,
      priority: 0,
      buffText: (numberParameter) => {return `Your Feat gains ${numberParameter} extra life` },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ? 
        `Gain ${playerObj.heroPower.lifeGain} Life` : `Gain 2 Life` },
      action: async (stateObj, playerObj) => {
        stateObj = await gainLife(stateObj, stateObj[playerObj.name], stateObj[playerObj.name].heroPower.lifeGain)
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
      baseCost: 1,
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
  //3
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
      baseCost: 3,
      title: "Summon Growth",
      counter: 1,
      priority: 1,
      buffText: (numberParameter) => { return `Your Feat's Growth gains +${numberParameter}/+${numberParameter}` },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
        `Summon a ${stateObj[playerObj.name].heroPower.counter}/${stateObj[playerObj.name].heroPower.counter} demon. Improve` : `Summon a 1/1 demon. Improve` },
      action: async (stateObj, playerObj) => {
        let c = playerObj.heroPower.counter
        stateObj = await createNewMinion(stateObj, playerObj, c, c, c, c, name="Personal Growth", minion=potgrowth)
        stateObj = immer.produce(stateObj, (newState) => {
          newState[playerObj.name].currentEnergy -= newState[playerObj.name].heroPower.cost(stateObj, playerObj)
          newState[playerObj.name].heroPower.counter += 1;
        })
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  //4
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost) },
      baseCost: 1,
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
  //5
    {
      cost: (stateObj, playerObj) => { return stateObj[playerObj.name].heroPower.baseCost },
      baseCost: 1,
      title: "Sting",
      HPBuff: 1,
      priority: 0,
      buffText: (numberParameter) => { return `Your Feat deals ${numberParameter} extra damage` },
      text: (stateObj, playerObj) => { return (stateObj.status === Status.inFight) ?  
        `Deal ${stateObj[playerObj.name].heroPower.HPBuff} damage directly to your opponent` : `Deal 1 damage directly to your opponent` },
      action: async (stateObj, playerObj) => {
        stateObj = immer.produce(stateObj, (newState) => {
          let opponent = (playerObj.name === "player") ? newState.opponent : newState.player
          opponent.currentLife -= stateObj[playerObj.name].heroPower.HPBuff
        })
        stateObj = await changeState(stateObj)
        return stateObj;
      },
    },
  //6
    {
      cost: (stateObj, playerObj) => { return (stateObj[playerObj.name].heroPower.baseCost + (stateObj[playerObj.name].heroPower.HPBuff*2)) },
      baseCost: 4,
      title: "Erase",
      HPBuff: 0,
      priority: 0,
      buffText: (numberParameter) => { 
        let textString = `Your Feat kills ${numberParameter} extra demon`
        if (numberParameter > 1) { textString += `s`}
        textString += `. It costs ${2*numberParameter} more` 
        return textString
      },
      text: (stateObj, playerObj) => { 
        let textString = ``
        textString = (stateObj[playerObj.name].heroPower.HPBuff === 0 || stateObj.status !== Status.inFight) ? `Destroy a random enemy minion` : `Destroy ${stateObj[playerObj.name].heroPower.HPBuff+1} random enemy minions` 
        return textString
      },
      action: async (stateObj, playerObj) => {
        for (i =0; i < stateObj[playerObj.name].heroPower.HPBuff+1; i++) {
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
    //7 2 mana - draw a card
  ]