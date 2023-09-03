let enemyWater1Minions = [waverider, waverider, oysterspirit, oysterspirit, kelpspirit,
    tidepoollurker,  sacrificialsprite, eartheelementalcommon, eartheelementalcommon, eartheelemental2common, 
    eartheelemental2common, eartheelemental3common, eartheelemental3common, eartheelemental3common, eartheelemental4common,
]

let playerWaterStarterMinions = [tiderider,  tiderider, kelpspirit, eartheelementalrare, eartheelementalrare,
                                 eartheelemental2rare, eartheelemental2rare, poisonousswamp, poisonousswamp, spreadingblessing,   
                                spreadingblessing, eartheelemental3rare, corruptingspirit, healingspring, europesspectre, ]


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
    greatoysterspirit, sacrificialsprite, lightbornimp, forestnymph,
    //4 - 3 mana
    lifegiver, oystergod, fragilespirit, kindspirit, //kindspirit gives opponent life
    //2 - 4 mana
    cowardlyspirit, empoweredspirit,
]

//high minion HP payoff - 16
let highHPEarthMinions = [
    //4 - 1 mana
    tiderider, kelpspirit, healerimp,
    //3 - 2 mana
    poisonousswamp, hypedjinn, tidepoollurker, deepseasquid,
    //2 - 3 mana
    healingspring, spreadingblessing,  
    //3 - 4 mana
    poseidon, deityoflight, bellcasterdeity,
     //4 - 5+ - legendary
     purifiedoverlord, risingtsunami, europesspectre, corruptingspirit,
]

let allEarthMinions = [...highLifeEarthMinions, highHPEarthMinions]

//healinhg payoff

//simple elementals - 20
let bigMinionEarthMinions = [
    //3 - 1 mana
    eartheelementalcommon, eartheelementalrare, eartheelementalepic,
    //4 - 2 mana
    eartheelemental2common, eartheelemental2rare, eartheelemental2epic, eartheelemental2epicB,
    //5 - 3 mana
    eartheelemental3common, eartheelemental3rare, eartheelemental3rareB, eartheelemental3epic, eartheelemental3epicB,
    //8 - 4 mana
    eartheelemental4common, eartheelemental4rare, eartheelemental4rareB, eartheelemental4rareC, eartheelemental4epic, eartheelemental4epicB, eartheelemental4epicC, eartheelemental4legendary,
]

let playerWaterHighValueMinions = [eartheelemental4legendary, poseidon, oystergod, deityoflight, purifiedoverlord,]