 /* ------------------------------------------------------------------------ */
// Clone objects
/* ------------------------------------------------------------------------ */
function clone(obj) {
    if (null == obj || "object" != typeof obj) {
		return obj;
	}

    var copy = obj.constructor();
    
	for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    
	return copy;
}

var endAll = false;
var echo = { logic: true, loop: false }
var overFlow = true;

var freeWorkerIndex = 0;

game.options.menu.confirmhole.enabled

/* ------------------------------------------------------------------------ */
// Get Resources Max 
/* ------------------------------------------------------------------------ */
var getMax = function (upg) {

	if(upg) {
		var max = Math.floor(upg.max + (upg.max * game.portal.Packrat.modifier * game.portal.Packrat.level));
		return calcHeirloomBonus("Shield", "storageSize", max);
	}

	return undefined;
}

getMax();

/* ------------------------------------------------------------------------ */
// Auto check for free workers and assign them
/* ------------------------------------------------------------------------ */
var runFreeWorkers = false;
var endFreeWorkers = false;
var echoFreeWorkers = clone(echo);
var constWorker = function() {

	if(runFreeWorkers) {
		var trimps = game.resources.trimps;
		var jobs = ['Dragimp', 'Geneticist', 'Miner', 'Farmer', 'Lumberjack', 'Trainer', 'Explorer', 'Miner', 'Farmer', 'Lumberjack', 'Scientist'];

		var free = (Math.ceil(trimps.realMax() / 2) - trimps.employed);

		for(; free > 0; free--, freeWorkerIndex++) {
			if(freeWorkerIndex >= jobs.length) {
				freeWorkerIndex = 0;
			}

			if(!game.jobs[jobs[freeWorkerIndex]].locked) {
				buyJob(jobs[freeWorkerIndex]);
				if(echoFreeWorkers.logic) {
					console.log('Put to work ', jobs[freeWorkerIndex]);
				}
			}
		}
	}

	if(!endFreeWorkers || !endAll) {
		if(echoFreeWorkers.loop) {
			console.log('Running Free Worker');
		}
    	setTimeout(function() {
        	constWorker();
    	}, 1000);		
	}
}

constWorker();

/* ------------------------------------------------------------------------ */
// Auto check for Well Fed
/* ------------------------------------------------------------------------ */
var runWellFed = false;
var endWellFed = false;
var echoWellFed = clone(echo);
var constwf = function () {

	if(runWellFed) {
		if(game.global.turkimpTimer > 0) {
			if(echoWellFed.logic) {
				setGather('metal', false);
			}
		}
	}

	if(!endWellFed || !endAll){
		if(echoWellFed.loop) {
			console.log('Running Well Fed');
		}
    	setTimeout(function(){
        	constwf();
    	}, 1000);
	}
}

constwf();


/* ------------------------------------------------------------------------ */
// Auto buy buildings
/* ------------------------------------------------------------------------ */
var runBuilding = false;
var endBuilding = false;
var echoBuilding = clone(echo);
var construir = function () {

	var buildings = ['Warpstation', 'Collector', 'Wormhole', 'Gateway', 'Resort', 'Hotel', 'Mansion', 'House', 'Hut'];
	var level = false;

	if(runBuilding) {
	    for (var i = 0;i < buildings.length;i++) {
			if(!game.buildings[buildings[i]].locked) {
		        while (canAffordBuilding(buildings[i], false)) {
					level = true;
		            buyBuilding(buildings[i]);
					if(echoBuilding.logic) {
						console.log('Purchased ' + buildings[i]);
					}
		        }
				if(!level) {
					break;
				}
			}
	    }
	}

	if(!endBuilding || !endAll){
		if(echoBuilding.loop) {
			console.log('Running Building');
		}
    	setTimeout(function(){
        	construir();
    	}, 1000);
	}
}

construir();

/* ------------------------------------------------------------------------ */
// Auto buy non-equipment upgrades
/* ------------------------------------------------------------------------ */
var echoUpgrade = clone(echo);
var runUpgrade = false;
var endUpgrade = false;
var constupg = function () {

	if(runUpgrade) { 
		for(upg in game.upgrades) {
			if (game.upgrades.hasOwnProperty(upg)) {
	        	if (!game.upgrades[upg].locked && !game.upgrades[upg].prestiges && canAffordTwoLevel(upg, false)) {

					console.log(game.upgrades[upg]);
					if(game.upgrades[upg] == 'Coordination' ? canAffordCoordinationTrimps() ? true : false : true) {
		            	buyUpgrade(upg);
						if(echoUpgrade.logic) {
							console.log('Took ' + upg);
						}
					}
	        	}
			}
		}
	}

	if(!endUpgrade || !endAll) {
		if(echoUpgrade.loop) {
			console.log('Running Upgrade');
		}
    	setTimeout(function(){
        	constupg();
    	}, 1000);
	}
}

constupg();

/* ------------------------------------------------------------------------ */
// Auto buy resource buildngs when full
/* ------------------------------------------------------------------------ */
var runWarehouse = false;
var endWarehouse = false;
var echoWarehouse = clone(echo);
var constwh = function () {
var buildings = {'food': 'Barn', 
				'metal': 'Forge',
				'wood': 'Shed'};

	if(runWarehouse) {
		for(upg in game.resources) {
			if (game.resources.hasOwnProperty(upg)) {
				if(buildings[upg]) {
		        	if (game.resources[upg].owned >= (getMax(game.resources[upg]) * 0.99) && canAffordBuilding(buildings[upg], false)) {
		            	buyBuilding(buildings[upg]);
						if(echoWarehouse.logic) {
							console.log('Purchased ' + buildings[upg]);
						}
		        	}
				}
			}
		}
	}

	if(!runWarehouse || !endAll){
		if(echoWarehouse.loop) {
			console.log('Running Warehouse');
		}
    	setTimeout(function(){
        	constwh();
    	}, 1000);
	}
}

constwh();

/* ------------------------------------------------------------------------ */
// Auto Breed Trimps
/* ------------------------------------------------------------------------ */
var runBreed = false;
var endBreed = false;
var echoBreed = clone(echo);
var constBreed = function () {

	var startMap = game.global.world;

	if(runBreed) {
		game.resources.trimps.owned = game.resources.trimps.max;
		if(echoBreed.logic) {
			console.log('Breeding');
		}
	}

	if(!runBreed || !endAll){
		if(echoBreed.loop) {
			console.log('Running Breed');
		}
    	setTimeout(function(){
        	constBreed();
    	}, 1000);
	}
}

echoBreed.logic = false;
constBreed();


/* ------------------------------------------------------------------------ */
// Auto run map for each zone
/* ------------------------------------------------------------------------ */
// var runMaps = true;
// var endMaps = false;
// var echoMap = clone(echo);
// var constMap = function () {

// 	var startMap = game.global.world;

// 	if(runMaps) {
// 		for(upg in game.resources) {
// 			if (game.resources.hasOwnProperty(upg)) {
// 	        	if (!game.buildings[buildings[upg]].locked && buildings[upg] && game.resources[upg].owned >= game.resources[upg].max) {
// 	            	buyBuilding(buildings[upg]);
// 					console.log('Purchased ' + buildings[upg]);
// 	        	}
// 			}
// 		}
// 	}

// 	if(!runMaps || !endAll){
// 		if(echoMap.loop) {
// 			console.log('Running Map');
// 		}
//     	setTimeout(function(){
//         	constMap();
//     	}, 1000);
// 	}
// }

// constMap();

/* ------------------------------------------------------------------------ */
// Toggle Running Bot
/* ------------------------------------------------------------------------ */
var toggleBot = function (bot) {
	var btnClass;
	var collectionBtn = document.getElementById(bot.buttonId);
	// console.log('bot ' + JSON.stringify( bot ));
	// console.log('bot ', bot);

	this[bot.res] = !this[bot.res];
	if(this[bot.res])
		btnClass = 'btn btn-success fightBtn';
	else
		btnClass = 'btn btn-danger fightBtn';

	collectionBtn.className = btnClass;
}

/* ------------------------------------------------------------------------ */
// Create HTML Buttons to toggle Bots
/* ------------------------------------------------------------------------ */
var insertBot = function (collection) {
	var collectBtn = document.getElementById("battleBtnsColumn");
	var btnText = collectBtn.innerHTML;
	var btnColor = this[collection.res] ? 'btn-success' : 'btn-danger';

		btnText += `
		<div class="battleSideBtnContainer" style="display: block" id="${collection.divId}">
			<span class="btn ${btnColor} fightBtn" id="${collection.buttonId}" onclick='toggleBot(${JSON.stringify( collection) })'>
				Run ${collection.text}
			</span>
		</div>
		`
	// }
    collectBtn.innerHTML = btnText;
}

insertBot({text: 'Building', divId: 'runBuilding', buttonId: 'runBuildingBtn', res: 'runBuilding'});
insertBot({text: 'Workers', divId: 'runWorkers', buttonId: 'runWorkersBtn', res: 'runFreeWorkers'});
insertBot({text: 'Upgrade', divId: 'runUpgrade', buttonId: 'runUpgradeBtn', res: 'runUpgrade'});
insertBot({text: 'Breeding', divId: 'runBreed', buttonId: 'runBreedBtn', res: 'runBreed'});
insertBot({text: 'Warehouse', divId: 'runWarehouse', buttonId: 'runWarehouseBtn', res: 'runWarehouse'});
insertBot({text: 'Maps', divId: 'runMaps', buttonId: 'runMapsBtn', res: 'runMaps'});
insertBot({text: 'Well Fed', divId: 'runWellFed', buttonId: 'runWellFedBtn', res: 'runWellFed'});

/* ------------------------------------------------------------------------ */
// Set owned value to max Resources without overflow
/* ------------------------------------------------------------------------ */
var maxResource = function (res) {
	var max = getMax(game.resources[res]);
	if(max >= 0 ? (overFlow ? (game.resources[res].owned * 2 < max ? true : false) : true) : true) {
		game.resources[res].owned *= 2;
		console.log(`Increased ${res} by ${game.resources[res].owned}`);
	} 
}

/* ------------------------------------------------------------------------ */
// Create HTML Buttons to max Resources
/* ------------------------------------------------------------------------ */
var insertMaxResource = function (res) {
	var collectBtn = document.getElementById(res);
	console.log(collectBtn);
	var txtStr = collectBtn.innerHTML;
	console.log(txtStr);
	var txtReplace = `<span onclick="maxResource('${res}')" `;

	collectBtn.innerHTML = txtStr.replace('<span ', txtReplace);
}

insertMaxResource('food');
insertMaxResource('metal');
insertMaxResource('wood');
insertMaxResource('science');
insertMaxResource('gems');
insertMaxResource('fragments');
insertMaxResource('helium');

/* ------------------------------------------------------------------------ */
// Create HTML for Buttons in Settings Section
/* ------------------------------------------------------------------------ */
var insertSettings = function (collection) {
	var ul = document.getElementById("settingsTabs");
	var li = document.createElement("li");

	li.appendChild(document.createTextNode("Bot"));
	li.setAttribute("id", "element4"); 
	li.setAttribute("role", "presentation"); 
	// li.setAttribute("id", "element4");
	li.className = 'tabNotSelected settingTab';
	// li.onclick = '';

	ul.appendChild(li);
}
