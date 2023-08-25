let sparkingimp = {
    name: "Sparking Imp",
    type: "fire",
    baseCost: 1,
    attack: 1,
    currentHP: 2,
    maxHP: 2,
    avatar: "img/flamingbaby.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `Battlecry: Deal 1 damage to a random enemy` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent
        let opponent = (playerObj.name === "player") ? newState.opponent : newState.player

        let targetIndex = Math.floor(Math.random() * (opponent.monstersInPlay.length+1));
        console.log('target index for simpleImp is ' + targetIndex)

        if (targetIndex >= opponent.monstersInPlay.length || opponent.monstersInPlay.length === 0) {
            console.log(array[index].name + " battlecries 1 damage to " + opponent.name )
            opponent.currentHP -= 1;
        } else {
            console.log(array[index].name + " battlecries 1 damage to " + opponent.monstersInPlay[targetIndex].name)
            opponent.monstersInPlay[targetIndex].currentHP -=1;
            
        }
        player.monstersInPlay.push(sparkingimp)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    }
  };
  
  let explosiveimp = {
    name: "Explosive Imp",
    baseCost: 1,
    type: "fire",
    attack: 1,
    currentHP: 1,
    maxHP: 1,
    avatar: "img/firebaby.png",
  
    canAttack: false,
  
    minReq: (state, index, array) => {
      return array[index].baseCost;
    },
  
    text: (state, index, array) => { 
      return `On Death: Deal 2 damage to a random enemy minion` 
    },
  
    cost:  (state, index, array) => {
      return array[index].baseCost;
    },
    
    action: async (stateObj, index, array, playerObj) => {
      //await cardAnimationDiscard(index);
      //stateObj = gainBlock(stateObj, array[index].baseBlock + (3*array[index].upgrades), array[index].baseCost)
      stateObj = immer.produce(stateObj, (newState) => {
        let player = (playerObj.name === "player") ? newState.player : newState.opponent

        player.monstersInPlay.push(explosiveimp)
        player.currentEnergy -=array[index].baseCost;
      })
      return stateObj;
    },
    onDeath: async (stateObj, index, array, playerObj) => {
      stateObj = immer.produce(stateObj, (newState) => {
        let opponent = (playerObj.name === "player") ? newState.opponent : newState.player

        if (opponent.monstersInPlay.length > 0) {
          let targetIndex = Math.floor(Math.random() * (opponent.monstersInPlay.length));
          opponent.monstersInPlay[targetIndex].currentHP -=2;
        }
      })
      return stateObj;
    }
  };