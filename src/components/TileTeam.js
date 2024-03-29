'use strict';

import React from 'react';
import Konva from "konva";
import {Group, Rect, Text } from "react-konva";
import TileFlag from './TileFlag';
import Colors from '../static/Colors';

var tileColor = Colors.tileColor;
var byeColor = Colors.byeColor;
var hoverColor = Colors.hoverColor;
var seedColor = Colors.seedColor;
var timeColor = Colors.timeColor;
var eliminatedColor = Colors.eliminatedColor;
var loserColor = Colors.byeColor;
var emptyColor = Colors.gameNotReadyColor;
var firstColor = Colors.gold;

export default class TileTeam extends React.Component {
	constructor(props){
		super(props);
	}
	
	BackgroundColor(name, hover, mode){
		if (name === 'BYE'){
			return byeColor;
		} else if (this.props.mode =='VS'){
			if (name == this.props.loser && this.props.loserEliminated ){
				return eliminatedColor;
			} else if (name == this.props.loser) {
				return loserColor;
			} else if (name === '' || name.slice(0, 5) == 'Winne' || name.slice(0, 5) == 'Loser') {
				return (emptyColor);
			} else if (hover === true) {
				return hoverColor;
			} else {
				return tileColor;
			}
		} else  {
			if ((name == this.props.loser1 && this.props.loserEliminated1)||(name == this.props.loser2 && this.props.loserEliminated2) ){
				return eliminatedColor;
			} else if(name == this.props.loser1 || name == this.props.loser2){
				return loserColor;
			} else if (name === '' || name.slice(0, 5) == 'Winne' || name.slice(0, 5) == 'Loser') {
				return (emptyColor);
			} else if (hover === true) {
				return hoverColor;
			} else {
				return tileColor;
			}
		} 
	}
	
	TextDecoration(name,mode) {
		 if (this.props.mode =='VS'){
		 	if( name == this.props.loser) {
				return 'line-through';
			} else {
				return '';
			}
		 } else {
		 	if (name == this.props.loser1 || name == this.props.loser2){
		 		return 'line-through';
		 	} else {
		 		return '';
		 	}
		 }
	}
	
	
	nameDisplay(name,country,hover){
		if (hover === true){
			return country;
		} else {
			return name;
		}
	}
	
	timeDisplay(time,winChance,hover, status, finishTime){
		if (status == 'COMPLETE'){
			return finishTime == 0 ? '-' : '*'+finishTime;
		} else if (hover === true){
			return winChance+'%';
		} else {
			return time;
		}
	}
	
	displayPlace(name, winner1,winner2,loser1, mode){
		if(mode == 'VS'){
			return seedColor;
		} else {
			if (name == null || name == '' || name == 'BYE'){
				return seedColor;
			} else if (name == winner1){
				return firstColor;
			} else if (name == winner2){
				return firstColor;
			} else {
				return seedColor;
			}
		}
	}


	render(){
		var teamWidth = this.props.width;
		var teamHeight = this.props.height;
		var clipWidth = teamHeight;
		var fontSize = 12;
		var seedFontSize = 16;
		
		return(
			<Group x={this.props.globalX} y={this.props.globalY} ref={'group'}>
				<Group>
					<Rect 
						width={teamWidth}
	        			height={teamHeight}
	                    fill= {this.BackgroundColor(this.props.name,this.props.hover, this.props.mode)}
						stroke= 'black'
						strokeWidth= {0.5}
						cornerRadius={5}
                    />
                </Group>
                <Group
                	clipX = {0}
                	clipY = {0}
		            clipWidth = {clipWidth}
		            clipHeight = {teamHeight}
            	>	
                    <Rect 
						width={teamWidth}
	        			height={teamHeight}
	                    fill= {this.displayPlace(this.props.name, this.props.winner1, this.props.winner2, this.props.loser1, this.props.mode)}
						stroke= 'black'
						strokeWidth= {0.5}
						cornerRadius={5}
                    />
                </Group>
                <Group
                	clipX = {teamWidth - clipWidth}
                	clipY = {0}
		            clipWidth = {clipWidth}
		            clipHeight = {teamHeight}
            	>	
                    <Rect 
						width={teamWidth}
	        			height={teamHeight}
	                    fill= {timeColor}
						stroke= 'black'
						strokeWidth= {0.5}
						cornerRadius={5}
                    />
                </Group>
                <Group>
                	<Text //seed number
                		text = {this.props.seed}
                		x = {clipWidth/2 - 9}
                		y = {(teamHeight-seedFontSize)/2}
                		fontSize = {seedFontSize}
                		fontStyle = 'bold'
                		shadowBlur = {2}
                		fill = 'white'
                		width = {18}
                		align = 'center'
                	/>
                	<Text //player name
                		text = {this.nameDisplay(this.props.name,this.props.country,this.props.hover)}
                		x = {clipWidth + 48 + 10}
                		y = {(teamHeight-fontSize)/2}
                		fontSize = {fontSize}
                		fill = 'black'
                		width = {teamWidth - 2 * teamHeight}
                		fontFamily = 'Open Sans'
                		fontStyle = 'bold'
                		align = 'left'
                		textDecoration = {this.TextDecoration(this.props.name, this.props.mode)}
                		ellipsis = 'true'
                		wrap = 'none'
                	/>
                	<Text //player avg time
                		text = {this.timeDisplay(this.props.time,this.props.winChance,this.props.hover,this.props.status,this.props.finishTime)}
                		x = {teamWidth - clipWidth}
                		y = {(teamHeight-fontSize)/2}
                		fontSize = {fontSize}
                		fill = {this.props.status == 'COMPLETE' ? firstColor : 'white'}
                		width = {clipWidth}
                		align = 'center'
                		shadowBlur = {2}
                		fontFamily = 'Open Sans'
                		fontStyle = 'bold'
                	/>
					<TileFlag
						img = {this.props.img}
						rectHeight = {teamHeight}
						rectWidth = {teamWidth}
						rectX = {clipWidth}
						stageHeight = {teamHeight}
						flagHeight = {48}
						flagWidth = {48}
					/>
				</Group>
			</Group>
		);
	}
}