'use strict';

import React from 'react';
import Table from	'./FrontPageTable';
import AddTeamPopUp from './AddTeamPopUp';
import GameNamePopUp from './GameNamePopUp';
import LoadGamePopUp from './LoadGamePopUp';
import CountryKeyVal from './CountryKeyVal';
import TimeTrialPopUp from './TimeTrialPopUp';
import VsTournament from './VsTournament';
import {BrowserRouter as Router, Route, Link} from 'react-router';
import demoNames from '../data/demoNames';
import countries from '../data/countries';
import Settings from '../static/Settings';
import firebase from '../firebase';
import Toggle from 'react-toggle';

var GamesDB;
var spanStyle = {
	flex : 1
};

export default class IndexPage extends React.Component {
	constructor(){
		super();
		this.getBestTime = this.getBestTime.bind(this);
		this.state = {
			nRows : 0,
			players : {},
			bestTime : null,
			gameName : null,
			FourPmode: false,
			DblElim: true,
			RandSeed: false,
			CompDisplay: false
		};
	}
	
	// TOGGLE SWITCH HANDLERS //
	handleModeChange(e){
		if (e.target.checked ==  true){
			this.setState({FourPmode : true});
		} else {
			this.setState({FourPmode : false});
		}
	}
	handleElimChange(e){
		if (e.target.checked ==  true){
			this.setState({DblElim : true});
		} else {
			this.setState({DblElim : false});
		}
	}
	handleSeedChange(e){
		if (e.target.checked ==  true){
			this.setState({RandSeed : true});
		} else {
			this.setState({RandSeed : false});
		}
	}
	handleDisplayChange(e){
		if (e.target.checked ==  true){
			this.setState({CompDisplay : true});
		} else {
			this.setState({CompDisplay : false});
		}
	}
	
	//  METHODS // 
	randomIntFromInterval(min,max){
	    return Math.floor(Math.random()*(max-min+1)+min);
	}
	
	getBestTime(playersObj){
		for (var k in playersObj){
			if(playersObj[k].timeTrial != '-'){
			    if (this.state.bestTime == null){
			        this.setState({bestTime:playersObj[k].timeTrial});
			    } else if (Number(playersObj[k].timeTrial) < Number(this.state.bestTime)) { 
			        this.setState({bestTime:playersObj[k].timeTrial});
			    }
		    }
		}
	}
	
	removePlayer(player){
		for (var k in this.state.players){
			if (this.state.players[k].name == player){
				delete this.state.players[k];
			}
		}
		this.forceUpdate();
		GamesDB.update({
			players: this.state.players
		});
	}
	
	editPlayer(oldName,newName,oldCountry,newCountry){
		
		if(oldName !== newName || oldCountry !== newCountry){
			for (var k in this.state.players){
				if(this.state.players[k].name == oldName){
					if(oldName!== newName){
						this.state.players[k].name = newName;
					}
					if(oldCountry !==newCountry){
						this.state.players[k].country = CountryKeyVal[newCountry];
					}
				}
			}
		}
		this.forceUpdate();
		GamesDB.update({
			players: this.state.players
		});
	}
	
	addTeam(name, country, timeTrial){
		timeTrial = timeTrial || '-';
  
    	this.state.players[name] = {
			name : name,
		    country : CountryKeyVal[country],
		    seed : 0,
		    timeTrial : timeTrial,
		    wins : 0,
		    losses : 0,
		    totalTime : 0,
		    avgTime : 0,
		    splitTime : 0,
		    bestTime : timeTrial == '-'?0:timeTrial,
		    index: 1,
		    avgCupTime : 0,
		    maxRound: 0,
		    vsGroupAvg: 0,
		    avgPlacement:'-',
		    final4Spot:999,
		    mascot:null,
		    conference:null,
		    nLastPlace : 0,
		    primaryColor:null,
		    secondaryColor:null
		};
		
		GamesDB.update({players: this.state.players});
		this.setState({nRows : this.state.nRows + 1});
	}
	
	addTimeTrial(name,time){
		this.state.players[name].timeTrial = Number(time);
		this.state.players[name].bestTime = Number(time);
		this.state.players[name].avgTime = Number(time);
		this.state.players[name].avgCupTime = Math.round(100*time/Settings.cupsPerPerson)/100;
		this.setState({
			players: this.state.players
		}, function afterClick(){
			this.getBestTime(this.state.players);
			
		});
		GamesDB.update({
			players: this.state.players
		});
	}
	
	SetGameName(gameName){
		///// SET DATABASE/////
		GamesDB = firebase.database().ref(gameName);
		this.PopulateTestTeams(true,12);
		GamesDB.set({
				gameName:gameName,
				players: this.state.players,
				timeTrials: "open"
			});
		this.setState({
			gameName : gameName
		});
	}
	
	LoadGameProps(gameName, players){
		this.setState({
			players : players,
			gameName : gameName
		});
		GamesDB = firebase.database().ref(gameName);
	}
	
	PopulateTestTeams(bool, nTeams){
		//this section is to populate random number of teams
	  	//---------------------------------------------------------------------------------
	  	if (bool == true){
	  		var countryArr = [];
		  	for (var item in countries[0]){
		  		countryArr.push(countries[0][item].name);
		  	}
		  	
		  	for (var i = 0 ; i <nTeams; i++){
		  		var name = demoNames[this.randomIntFromInterval(0,demoNames.length)];
		  		//	this.randomIntFromInterval(1,999);
		  			
		  		this.addTeam(name, countryArr[this.randomIntFromInterval(0,countryArr.length)], 0);
		  		
		  		this.addTimeTrial(name, Math.round(this.randomIntFromInterval(1500,6000))/100);
		  	}
		  	this.getBestTime(this.state.players);
	  	}
	  	
	  	// --------------------------------------------------------------------------------
	}
	
	TestIfGameCanProceed(event, nTimeTrials, nPlayers, mode, gameName){
		if (gameName == null){
			return event.preventDefault();
		} else if (nPlayers >= (mode == true ? 8 : 4)){
			if (this.state.RandSeed == false){
				if (nTimeTrials == nPlayers){
					return ;
				} else {
					return event.preventDefault();
				}
			} else {
				return;
			}
		} else {
			return event.preventDefault();
		}
		
	}
	
    render() {
    	
    	var mainOptionButtons;
    	var startCreationButtons;
    	var gamePath;
    	var nTimeTrials = 0;
    	var secBkrdClrNA = '#D3D3D3';
    	var secBkrdClrAvail = '#9489b0';
    	
    	for (var m in this.state.players){
    		if(this.state.players[m].timeTrial !== null && this.state.players[m].timeTrial !== 0 && this.state.players[m].timeTrial !== '-'){
    			nTimeTrials += 1;
    		}
    	}
    	
    	//Grey out options until name is applied
    	if(this.state.gameName == null){
    		startCreationButtons = {
    			background: secBkrdClrAvail,
    			color: 'white'
    		};
    		mainOptionButtons = {
    			background: secBkrdClrNA,
    			color: '#888888'
    		};
    	} else {
    		startCreationButtons = {
    			background: secBkrdClrNA,
    			color: '#888888'
    		};
    		mainOptionButtons = {
    			background: secBkrdClrAvail,
    			color: 'white'
    		};
    	}
    	
    	// SET GAME PATH BASED ON TOGGLE SETTINGS //
    	gamePath = {
    		pathname: this.state.CompDisplay == true ? "/VsTournament" : "/VsMobile",
    		state:{
				players : this.state.players, 
				mode : this.state.FourPmode == true ? "4P" : "VS", 
				seeding: "blind",
				order: this.state.RandSeed == true ? "random" : "timeTrial",
				gameName:this.state.gameName
			}
    	};
    	
    	console.log('nTimeTrials',nTimeTrials);
    	console.log('FourPmode',this.state.FourPmode);
    	console.log('Object.keys(this.state.players).length',Object.keys(this.state.players).length);

	    return (
	    	<div className="main-page">
	    		<div className = "menu">
	    			<GameNamePopUp 
	        			SetGameName={this.SetGameName.bind(this)}
	        			style={startCreationButtons}
	        			trigger={this.state.gameName}
		            />
		            <LoadGamePopUp 
	        			SetGameName={this.SetGameName.bind(this)}
	        			style={startCreationButtons}
	        			trigger={this.state.gameName}
	        			LoadGameProps={this.LoadGameProps.bind(this)}
		            />
	    			<AddTeamPopUp 
	        			addTeamClick={this.addTeam.bind(this)}
	        			editPlayer={this.editPlayer.bind(this)}
	        			style={mainOptionButtons}
	        			trigger={this.state.gameName}
		            />
	    			<TimeTrialPopUp
		        		players={this.state.players}
		        		addTimeTrial={this.addTimeTrial.bind(this)}
		        		style={mainOptionButtons}
		        		trigger={this.state.gameName}
	        		/>
					<div className = "row" style={mainOptionButtons}>
						<span style={spanStyle}>VS</span>
						<Toggle
							id='modeStatus'
							icons={false}
							disabled={this.state.gameName == null ? true : false}
						    defaultChecked={this.state.FourPmode}
						    onChange={this.handleModeChange.bind(this)} 
					    />
					    <span style={spanStyle}>4P</span>
					</div>
					<div className = "row" style={mainOptionButtons}>
						<span style={spanStyle}>SGL</span>
						<Toggle
							id='elimStatus'
							icons={false}
							disabled={true}
						    defaultChecked={this.state.DblElim}
						    onChange={null} 
					    />
					    <span style={spanStyle}>DBL</span>
					</div>
					<div className = "row" style={mainOptionButtons}>
						<span style={spanStyle}>Seeded</span>
						<Toggle
							id='seedStatus'
							icons={false}
							disabled={this.state.gameName == null ? true : false}
						    defaultChecked={this.state.RandSeed}
						    onChange={this.handleSeedChange.bind(this)} 
					    />
					    <span style={spanStyle}>Random</span>
					</div>
					<div className = "row" style={mainOptionButtons}>
						<span style={spanStyle}>Phone</span>
						<Toggle
							id='displayStatus'
							icons={false}
							disabled={this.state.gameName == null ? true : false}
						    defaultChecked={this.state.CompDisplay}
						    onChange={this.handleDisplayChange.bind(this)} 
					    />
					    <span style={spanStyle}>Comp</span>
					</div>
					<Link 
						onClick={(e) => { this.TestIfGameCanProceed(e, nTimeTrials, Object.keys(this.state.players).length, this.state.FourPmode, this.state.gameName)}}
						className="row" 
						style={mainOptionButtons} 
						to={gamePath}
					>
						Start Game
					</Link>
	    		</div>
		        <div className="home">
				      <Table 
					      teamRows={this.state.nRows}
					      players={this.state.players}
					      bestTime={this.state.bestTime}
					      removePlayer={this.removePlayer.bind(this)}
					      editPlayer={this.editPlayer.bind(this)}
					      removePlayer={this.removePlayer.bind(this)}
				      />
	    		</div>
    		</div>
    	);
    }
}