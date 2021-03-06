'use strict';

import DetermineRoundNumber from '../vsBracketMethods/higherOrderMethods/DetermineRoundNumber';
import DetermineAvgTime from '../vsBracketMethods/baseMethods/DetermineAvgTime';
import DetermineBracket from '../vsBracketMethods/baseMethods/DetermineBracket';
import DetermineBracketPower from '../vsBracketMethods/baseMethods/DetermineBracketPower';
import Settings from '../../static/Settings';


export default function WinnerLoserHandler (WLpkg,RTpkg){
	
	
	//unPack vars
	var currentGameNum = WLpkg.gameNumber;
	var bracketSpots = WLpkg.bracketSpots;
	var currentBracket =DetermineBracket(currentGameNum,bracketSpots,WLpkg.mode);
	var roundNumber;
    var bracketPower = DetermineBracketPower(bracketSpots);
    var mode = WLpkg.mode;
    
    if (WLpkg.mode == 'VS'){
    	
    	roundNumber = DetermineRoundNumber(currentGameNum, bracketSpots, currentBracket);
    	var winPlayer = WLpkg.winner1;
    	var losePlayer = WLpkg.loser1;
    	var winTime = RTpkg.winner1time;
    	var loseTime = RTpkg.loser1time;
    	var nLoserRnds = 2*(bracketPower - 1);

    	
    	if ((winTime == null || winTime == 0) && winPlayer.timeTrial!== '-'){
	    	winTime = winPlayer.timeTrial;
	    }
	    
	    // update stats [GLOBAL]
	    if(WLpkg.byeRound === false) {
	    	winPlayer.wins +=  1;
	    	losePlayer.losses += 1;
	    	winPlayer.totalTime = Number(winPlayer.totalTime) + Number(winTime);
	    	losePlayer.totalTime = Number(losePlayer.totalTime) + Number(loseTime);
	    	losePlayer.nLastPlace +=1;
	    	
	    	
	    	if (winPlayer.bestTime == 0 && winPlayer.timeTrial == '-'){
	    		winPlayer.bestTime = winTime;
	    	} else {
	    		winPlayer.bestTime = winPlayer.bestTime > winTime ? winTime : winPlayer.bestTime;
	    	}
	    	
	    	if( winPlayer.timeTrial == '-' && (winPlayer.avgTime == 0 || winPlayer.avgTime == null || winPlayer.avgTime == '-')){
	    		winPlayer.avgTime = winTime;
	    	} else {
	    		winPlayer.avgTime = DetermineAvgTime(winPlayer.timeTrial,winPlayer.totalTime,winPlayer.wins,winPlayer.losses, winPlayer.nLastPlace);
	    	}
	    	
	    	winPlayer.avgCupTime = Math.round(100*winPlayer.avgTime/Settings.cupsPerPerson)/100;
	    	var loserEliminated = losePlayer.losses == 2 ? true : false;

	    }
	    if(currentBracket == 'loserBracket'){
    		losePlayer.maxRound = roundNumber;
    		winPlayer.maxRound = roundNumber+1;
    	} else if (currentBracket == 'specialBracket'){
    		if(currentGameNum == bracketSpots*2-2){
    			winPlayer.maxRound = nLoserRnds + (bracketPower);
    			losePlayer.maxRound = 2*(bracketPower-1);
    		} else if (currentGameNum == bracketSpots) {
    			losePlayer.maxRound = 2*(bracketPower-1);
    			winPlayer.maxRound = nLoserRnds + (bracketPower) + 1;
    		} else {
    			winPlayer.maxRound = nLoserRnds + (bracketPower) + 2;
    			losePlayer.maxRound = nLoserRnds + (bracketPower) + 1;
    		}
    	} 
	    	
	    if (currentBracket=='startBracket'){
	    		winPlayer.maxRound = roundNumber + nLoserRnds + 1;
	    		losePlayer.maxRound = 1;
    	}
    	
    	if (currentBracket=='winnerBracket'){
	    		winPlayer.maxRound = roundNumber + nLoserRnds + 1;
	    		losePlayer.maxRound = roundNumber*2;
    	}
	    
	    // set game object with results
	    this.state.masterGameObject = {
    		...this.state.masterGameObject,
    		[currentGameNum] : {
    			...this.state.masterGameObject[currentGameNum],
    			status : 'COMPLETE',
    			winner : winPlayer.name,
    			loser : losePlayer.name,
    			loserEliminated : loserEliminated,
    			playerAtime : WLpkg.playerAtime,
    			playerBtime : WLpkg.playerBtime
    		}
    	};
		
		console.log(this.state.playersArray);
		
    	//UPDATE WIN PLAYER STATE
    	if(winPlayer.name != 'BYE'){
    		this.state.playersArray = {
	    		...this.state.playersArray,
	    		[winPlayer.name] : {
	    			...this.state.playersArray[winPlayer.name],
	    			wins : winPlayer.wins,
	    			maxRound : winPlayer.maxRound
	    		}
	    	};
    	}
    	
    	//UPDATE LOSE PLAYER STATE
    	if(losePlayer.name != 'BYE'){
    		this.state.playersArray = {
	    		...this.state.playersArray,
	    		[losePlayer.name] : {
	    			...this.state.playersArray[losePlayer.name],
	    			losses : losePlayer.losses,
	    			maxRound : losePlayer.maxRound
	    		}
	    	};
    	}
    	
    	
	
		// send player based on bracket Location
		if (currentBracket == "startBracket"){
			
			this.SendWinnerWinBracket(currentGameNum, roundNumber, winPlayer, bracketSpots);
			this.SendLoserStartBracket(currentGameNum, losePlayer, bracketSpots);
		
		} else if (currentBracket == "winnerBracket"){
			this.SendWinnerWinBracket(currentGameNum, roundNumber, winPlayer, bracketSpots);
			this.SendLoserWinBracket(currentGameNum, roundNumber,losePlayer, bracketSpots, mode);
		} else if (currentBracket == "specialBracket"){
			if(currentGameNum == bracketSpots){
				this.SendWinnerSpecialWinnerBracket(currentGameNum,winPlayer,losePlayer,bracketSpots);
			} else {
				this.SendWinnerSpecialLoserBracket(currentGameNum,winPlayer,bracketSpots);
			}
		} else {
			this.SendWinnerLoseBracket(currentGameNum, roundNumber, winPlayer, bracketSpots, mode);
		}
    } else {
    	
    	roundNumber = DetermineRoundNumber(currentGameNum, bracketSpots/2, currentBracket);
    	var nLoserRnds4P = 2*(bracketPower - 2);
    	
	    // update stats [GLOBAL]
	    
    	if (WLpkg.byeRound == false){
    		WLpkg.winner1.wins +=  1;
	    	WLpkg.winner2.wins +=  1;
	    	WLpkg.loser1.losses += 1;
	    	WLpkg.loser2.losses += 1;
	    	WLpkg.loser2.nLastPlace += 1;
    	}
	    	
	    	
	    	/*
	    	for (var q = 0; q < wlArray.length; q++){
	    		
	    		if (RTpkg[wltArray[q]] == '-' || RTpkg[wltArray[q]] == null){
	    			WLpkg[wlArray[q]].totalTime = WLpkg[wlArray[q]].totalTime;
	    		} else {
	    			WLpkg[wlArray[q]].totalTime = Number(WLpkg[wlArray[q]].totalTime) + Number(RTpkg[wltArray[q]]);
	    		}
	    		
	    		if (WLpkg[wlArray[q]].bestTime == 0 && WLpkg[wlArray[q]].timeTrial == '-'  ){
	    			if(RTpkg[wltArray[q]] !== null && RTpkg[wltArray[q]] !== '-'){
	    				WLpkg[wlArray[q]].bestTime = RTpkg[wltArray[q]];
	    			} 
	    		} else {
	    			if(RTpkg[wltArray[q]] !== null && RTpkg[wltArray[q]] !== '-' && RTpkg[wltArray[q]] !== 0){
	    				WLpkg[wlArray[q]].bestTime = WLpkg[wlArray[q]].bestTime > RTpkg[wltArray[q]] ? RTpkg[wltArray[q]] : WLpkg[wlArray[q]].bestTime;
	    			}
	    		}
	    		
	    		if (WLpkg[wlArray[q]].avgTime == 0 || WLpkg[wlArray[q]].avgTime == null || WLpkg[wlArray[q]].avgTime == '-'){
	    			if(RTpkg[wltArray[q]] !== null && RTpkg[wltArray[q]] !== '-' && RTpkg[wltArray[q]] !== 0 ){
	    				WLpkg[wlArray[q]].avgTime = RTpkg[wltArray[q]];
	    			} 
	    		} else {
		    		WLpkg[wlArray[q]].avgTime = DetermineAvgTime(WLpkg[wlArray[q]].timeTrial,WLpkg[wlArray[q]].totalTime,WLpkg[wlArray[q]].wins,WLpkg[wlArray[q]].losses, WLpkg[wlArray[q]].nLastPlace);
	    		}
	    		
	    		WLpkg[wlArray[q]].index = Math.round(100*(WLpkg[wlArray[q]].timeTrial=='-'?0:WLpkg[wlArray[q]].timeTrial) / WLpkg[wlArray[q]].avgTime)/100;
	    		WLpkg[wlArray[q]].avgCupTime = Math.round(100*WLpkg[wlArray[q]].avgTime/Settings.cupsPerPerson)/100;
	    		WLpkg[wlArray[q]].avgPlacement = Math.round(100*((q+1)+(WLpkg[wlArray[q]].wins+WLpkg[wlArray[q]].losses-1)*(WLpkg[wlArray[q]].avgPlacement == '-'?0:WLpkg[wlArray[q]].avgPlacement))/(WLpkg[wlArray[q]].wins+WLpkg[wlArray[q]].losses))/100;
	    	}
	    	*/

    	var loser1Eliminated = WLpkg.loser1.losses == 2 ? true : false;
    	var loser2Eliminated = WLpkg.loser2.losses == 2 ? true : false;
	    	
	    	
	    
	    
	    if(currentBracket == 'loserBracket'){
    		WLpkg.winner1.maxRound = roundNumber + 1;
    		WLpkg.winner2.maxRound = roundNumber + 1;
    		WLpkg.loser1.maxRound = roundNumber;
    		WLpkg.loser2.maxRound = roundNumber;
    	} else if (currentBracket == 'specialBracket'){
    		if(currentGameNum == bracketSpots-2){
    			WLpkg.winner1.maxRound = nLoserRnds4P + 1 + (bracketPower-1);
    			WLpkg.winner2.maxRound = nLoserRnds4P + 1 + (bracketPower-1);
    			WLpkg.loser1.maxRound = 2*(bracketPower-1-1);
    			WLpkg.loser2.maxRound = 2*(bracketPower-1-1);
    		} else if (currentGameNum == bracketSpots/2) {
    			WLpkg.winner1.maxRound = nLoserRnds4P + 2 + (bracketPower-1);
    			WLpkg.winner2.maxRound = nLoserRnds4P + 2 + (bracketPower-1);
    			WLpkg.winner1.maxRound = nLoserRnds4P + 1 + (bracketPower-1);
    			WLpkg.winner2.maxRound = nLoserRnds4P + 1 + (bracketPower-1);
    			WLpkg.winner1.final4Spot = 1;
    			WLpkg.winner2.final4Spot = 2;
    			WLpkg.loser1.final4Spot = 3;
    			WLpkg.loser2.final4Spot = 4;
    		} 
    	}
    	
    	if (currentBracket=='startBracket'){
    		WLpkg.winner1.maxRound = roundNumber + nLoserRnds4P + 1;
    		WLpkg.winner2.maxRound = roundNumber + nLoserRnds4P + 1;
    		WLpkg.loser1.maxRound = 1;
    		WLpkg.loser2.maxRound = 1;
    	}
    	
    	if (currentBracket=='winnerBracket'){
	    		WLpkg.winner1.maxRound = roundNumber + nLoserRnds4P + 1;
    			WLpkg.winner2.maxRound = roundNumber + nLoserRnds4P + 1;
	    		WLpkg.loser1.maxRound = roundNumber*2;
	    		WLpkg.loser2.maxRound = roundNumber*2;
    	}
	    // set game object with results
	    this.state.masterGameObject = {
    		...this.state.masterGameObject,
    		[currentGameNum] : {
    			...this.state.masterGameObject[currentGameNum],
    			status : 'COMPLETE',
    			winner1 : WLpkg.winner1.name,
    			winner2 : WLpkg.winner2.name,
    			loser1 : WLpkg.loser1.name,
    			loser2 : WLpkg.loser2.name,
    			loserEliminated1 : loser1Eliminated,
    			loserEliminated2 : loser2Eliminated,
    			playerAtime : WLpkg.playerAtime,
    			playerBtime : WLpkg.playerBtime,
    			playerCtime : WLpkg.playerCtime,
    			playerDtime : WLpkg.playerDtime,
    		}
    	};
    	
    	
    	//UPDATE WIN1 PLAYER STATE
    	if(WLpkg.winner1.name != 'BYE'){
    		this.state.playersArray = {
	    		...this.state.playersArray,
	    		[WLpkg.winner1.name] : {
	    			...this.state.playersArray[WLpkg.winner1.name],
	    			wins : WLpkg.winner1.wins,
	    			maxRound : WLpkg.winner1.maxRound
	    		}
	    	};
    	}
    	
    	//UPDATE WIN2 PLAYER STATE
    	if(WLpkg.winner2.name != 'BYE'){
    		this.state.playersArray = {
	    		...this.state.playersArray,
	    		[WLpkg.winner2.name] : {
	    			...this.state.playersArray[WLpkg.winner2.name],
	    			wins : WLpkg.winner2.wins,
	    			maxRound : WLpkg.winner2.maxRound
	    		}
	    	};
    	}
    	
    	//UPDATE LOSE1 PLAYER STATE
    	if(WLpkg.loser1.name != 'BYE'){
    		this.state.playersArray = {
	    		...this.state.playersArray,
	    		[WLpkg.loser1.name] : {
	    			...this.state.playersArray[WLpkg.loser1.name],
	    			losses : WLpkg.loser1.losses,
	    			maxRound : WLpkg.loser1.maxRound
	    		}
	    	};
    	}
    	
    	//UPDATE LOSE2 PLAYER STATE
    	if(WLpkg.loser2.name != 'BYE'){
    		this.state.playersArray = {
	    		...this.state.playersArray,
	    		[WLpkg.loser2.name] : {
	    			...this.state.playersArray[WLpkg.loser2.name],
	    			losses : WLpkg.loser2.losses,
	    			maxRound : WLpkg.loser2.maxRound
	    		}
	    	};
    	}
	    
	    // send player based on bracket Location
		if (currentBracket == "startBracket"){
			this.SendWinnerWinBracket4P(currentGameNum, roundNumber, WLpkg.winner1,WLpkg.winner2, bracketSpots);
			this.SendLoserStartBracket4P(currentGameNum, WLpkg.loser1, WLpkg.loser2, bracketSpots);
		} else if (currentBracket == "winnerBracket"){
			this.SendWinnerWinBracket4P(currentGameNum, roundNumber, WLpkg.winner1,WLpkg.winner2, bracketSpots);
			this.SendLoserWinBracket4P(currentGameNum, roundNumber, WLpkg.loser1, WLpkg.loser2, bracketSpots, mode);
		} else if (currentBracket == "specialBracket"){
			this.SendWinnerSpecialLoserBracket4P(currentGameNum, WLpkg.winner1,WLpkg.winner2,bracketSpots);
		} else {
			this.SendWinnerLoseBracket4P(currentGameNum, roundNumber, WLpkg.winner1,WLpkg.winner2, bracketSpots, mode);
		}
    }
    
    
}