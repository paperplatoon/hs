//high health not always giving to simple imp
//fire - deal damage
//earth - summon more guys
//air - gain attack
//water - gain health


  
  
  
  let growingDjinn = {
    name: "Grow",
    baseCost: 3,
    attack: 2,
    currentHP: 3,
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
        newState.player.monstersInPlay.push(array[index])
        newState.player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    }
  }
  
  

  
  let destroyer = {
    name: "Destroyer",
    baseCost: 7,
    attack: 5,
    currentHP: 12,
    maxHP: 12,
    avatar: "img/fireMonster.png",
  
    canAttack: false,
  
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
        newState.player.currentEnergy -=array[index].baseCost;
        let arrayObj = (array === stateObj.player.monstersInPlay || array === stateObj.player.encounterHand) ? newState.player.monstersInPlay : newState.opponent.monstersInPlay
        arrayObj.push(destroyer)
      })
      return stateObj;
    }
  }