
//array of objects with properties deck and heroPower







let waterMinions = [
    //5 - 1 mana - 
    gnometwins, birthingpot, beaverspirit, redfish, schoolleader, randomfish,
    //5 - 2 mana - 
    tinyhydra, spreadingfungi, impcub, herbalistimp, golemmaker,
    //3 mana - 
    attunednaturalist, imprecruiter, 
    //4 mana - 
    proudmama, ashamedmama,
]



//gainLife function where heroes gain life and have an extraLifegain property that can be changed by cards' action and onDeath functions to only be active
///when that card is in the battlefield
//add +2 to all HP gained
//your Life gain is doubled
//LIFE REQUIREMENTS ARE LOWERED BY 3 
//same with minionGainsHP
//parameters are minion gaining, minion granting, player, 

//high life payoff - 13


let highLifeEarthMinions = [
    //4 - 1 mana
    oysterspirit, woodsprite, lightspark, sicklyifrit,
    //4 - 2 mana
    woodfairy, sacrificialsprite, lightbornimp, forestnymph,
    //4 - 3 mana
    lifegiver, oystergod, fragilespirit, kindspirit, //kindspirit gives opponent life
    //2 - 4 mana
    cowardlyspirit, empoweredspirit,
]

//high minion HP payoff - 16
let highHPEarthMinions = [
    //4 - 1 mana
    tiderider, nymphcultivator, healerimp,
    //3 - 2 mana
    poisonousswamp, hypedjinn, sapplingsprout, deepseasquid,
    //2 - 3 mana
    healingspring, spreadingblessing,  
    //3 - 4 mana
    forestdeity, deityoflight, bellcasterdeity,
     //4 - 5+ - legendary
     purifiedoverlord, risingtsunami, europesspectre, corruptingspirit,
]

let enemyEarth1highLife = {
    deck: [
        //5
        oysterspirit, sicklyifrit, earthelementalI, earthelementalI, earthelementalI,
        //4
        sacrificialsprite, lightbornimp, elementalII, elementalII,
        //3
        elementalIII, elementalIII, attunednaturalist, 
        //3
        ashamedmama, ashamedmama, elementalIV
    ],

    heroPower: 0 //gainLife
}

let enemyEarth1HighHP = {
    deck: [
        //4
        tiderider, healerimp, earthelementalI, earthelementalI,
        //4
        sapplingsprout, sapplingsprout, elementalII, elementalII,
        //4
        elementalIII, elementalIII, elementalIII, healingspring, 
        //3
        proudmama, proudmama, elementalIV, elementalIV
    ],

    heroPower: 0 //gainLife
}

let testEnemy = {
    deck: [
        proudmama, proudmama, elementalIV, elementalIV,
        proudmama, proudmama, elementalIV, elementalIV
    ],

    heroPower: 0 //gainLife
}

//15    
let playerEarthHighHPPoisonous = {
    deck: [
        //5
        seedling, earthelementalI, healerimp, healerimp, healerimp,
        //4
        toxicvapors, toxicvapors, sapplingsprout, sapplingsprout, 
        //5
        poisonousswamp, poisonousswamp, earthelementalIII, earthelementalIII, healingspring,
        //1
        forestdeity
    ],
    heroPower: 1,
    name: "Creeping Death",
    text: "Use your creatures' high HP to deal damage directly to your opponent!"
}

//15
let playerEarthGainLife1 = {
    deck: [
        //5
        woodsprite, woodsprite, woodsprite, lightspark, sicklyifrit,
        //6
        woodfairy, woodfairy, forestnymph, forestnymph, lightbornimp, lightbornimp,
        //3
        fragilespirit, fragilespirit, lifegiver, 
        //1
        empoweredspirit,
    ],
    heroPower: 0,
    name: "Blossoming Life",
    text: "Raise your own life total and play powerful creatures!"
}


let potentialEnemies = [enemyEarth1highLife, enemyEarth1HighHP]
let potentialPlayers = [playerEarthGainLife1, playerEarthHighHPPoisonous]
