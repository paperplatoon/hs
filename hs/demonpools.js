//15
let enemyEarth1highLife = [tiderider, sicklyifrit, earthelementalI, earthelementalI, earthelementalI,
    // sacrificialsprite, lightbornimp, lightbornimp, elementalII, elementalII,
    // elementalIII, elementalIII, attunednaturalist, 
    // ashamedmama, ashamedmama, elementalIV, elementalIV
]

//14    
let playerEarthHighHPPoisonous = [earthelementalI, healerimp, healerimp,
                            toxicvapors, toxicvapors, tidepoollurker, tidepoollurker, 
                            poisonousswamp, poisonousswamp, earthelementalIII, earthelementalIII, healingspring,
                            poseidon
                        ]


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