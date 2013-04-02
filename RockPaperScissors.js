/**
  * @desc Simple framework-agnostic fully-functional JS
  * implementation of Rock Paper Scissors game in my first contact with
  * LEAP Motion device.
  * @author: Nandico nandico@gmail.com
*/
function RockPaperScissors()
{
	this.lh = new LeapHelper();			// simple helper to count pointables and related functions
	
	this.mode = -1;						// app mode in state machine
	this.loopTID = null;				// reference to timer handling main loop function
	this.count = 3;						// stores the count-down to start the game
	this.countTID = null;				// reference to timer handling the countdown
	this.answerTID = null;				// reference to timer handling the answer window
	this.nextRoundTID = null;			// reference to timer waiting next round
	
	this.playerScore = 0;				// store player score
	this.cpuScore = 0;					// store cpu score
	this.dumbuserHand = null;			// if the user put the hand over the sensor before counting computer 'sees' it and won
	this.cpuChoice = -1;				// store cpu hand in the turn
	this.userChoice = -1;				// store user hand in the turn
	this.userLosetime = false;			// used when users take too long time to put a hand in a turn. User will lose the turn
	
	this.handHistory = new Array();		// store detected hands in loop to ensure correct detection
	
	/**
	  * @desc System init
	*/
	this.init = function()
	{
		this.loopTID = window.setInterval( "rps.loop()", 10 );
		this.setMode( RockPaperScissors.MODE_READY );	
	}

	/**
	  * @desc System main gameloop
	*/	
	this.loop = function()
	{	
		// transfer management of main loop to specific loop routines
		switch( this.mode )
		{
			case RockPaperScissors.MODE_READY:
				this.loopReady();
				break;
			case RockPaperScissors.MODE_321:
				this.loop321();
				break;
			case RockPaperScissors.MODE_LISTEN:
				this.loopListen();
				break;
		}		
	}
	
	/**
	  * @desc system still this state is in looping awaiting for \m/ hand signal.
	  * it's a trick - if you start the game with scissors will work,
	  * but \m/ is cooler.
	*/	
	this.loopReady = function()
	{	
		hand = this.lh.getMoreProeminentHand();
		
		if( hand )
		{
			if( rps.checkHand( hand ) == RockPaperScissors.SCISSORS )
			{
				this.setMode321();
			}
		}
	}
	
	/**
	  * @desc system still in this state during the countdown
	  * if a dumb user put the hand over the sensor the computer
	  * will see it and the computer will always win with a 
	  * fulminant attack
	*/		
	this.loop321 = function()
	{
		// detects if user put the hand before the right moment
		hand = this.lh.getMoreProeminentHand();
		
		if( hand )
		{
			this.dumbuserHand = this.checkHand( hand );
		}
	}
	
	/**
	  * @desc system still in this state while waiting for user 
	  * hand. Will move forward when finds a hand or when user
	  * looses
	*/	
	this.loopListen = function()
	{
		if( this.userLosetime ) return;
		
		hand = this.lh.getMoreProeminentHand();
		
		if( hand )
		{
			this.handHistory.push( this.checkHand( hand ) );
		}
		
		var handCheck = new Array();
		
		for( var i = this.handHistory.length - 1; 
			 i >= 0 && i > this.handHistory.length - ( RockPaperScissors.MOVEMENT_CATCH_COUNT + 1 );
			 i -- )
		{
			handCheck.push( this.handHistory[ i ] );
		}
		
		repeatCount = 0;
		
		// MOVEMENT_CATCH_COUNT says to system how many frames in the past must be confirmed
		// in a same position to take this as a valid hand
		if( handCheck.length == RockPaperScissors.MOVEMENT_CATCH_COUNT )
		{
			for( i = 1; i < handCheck.length; i++ )
			{
				if( handCheck[ i ] == handCheck[ 0 ] ) repeatCount ++;
			}
		}
			
		if( repeatCount == ( RockPaperScissors.MOVEMENT_CATCH_COUNT - 1 ) )
		{
			// now we got an confirmed user hand
			this.listenCatchedHand( handCheck[ 0 ] );
		}
	}
	
	/**
	  * @desc system mode setter
	*/		
	this.setMode = function( mode )
	{
		switch( mode )
		{
			case RockPaperScissors.MODE_READY:
				this.setModeReady();
				break;
			case RockPaperScissors.MODE_321:
				this.setMode321();
				break;
			case RockPaperScissors.MODE_LISTEN:
				this.setModeListen();
				break;
			case RockPaperScissors.MODE_EVALUATE:
				this.setModeEvaluate();
				break;
		}
	}
	
	/**
	  * @desc Setup system to start a new game
	*/		
	this.setModeReady = function()
	{
		this.lh.resetLog();
		
		this.lh.logScream( "Gimme a <br />\\m/ to start." );
		
		this.mode = RockPaperScissors.MODE_READY;
	}
	
	/**
	  * @desc Setup system countdown
	*/		
	this.setMode321 = function()
	{
		this.lh.resetLog();
		
		this.lh.logScream( "Get ready." );
		
		this.countTID = window.setInterval( "rps.mode321Step();", 1000 );
		
		this.mode = RockPaperScissors.MODE_321;
	}
	
	/**
	  * @desc Execute each step of a countdown
	*/		
	this.mode321Step = function()
	{
		this.lh.resetLog();
				
		if( this.count == 0 )
		{
			this.lh.logScream( "Go." );
			
			window.clearInterval( this.countTID );
			this.setMode( RockPaperScissors.MODE_LISTEN );
		}
		else
		{
			if( this.count == 3 ) this.lh.resetLog();
			
			this.lh.logScream( this.count + ". " );
			this.count --;
		}
	}
	
	/**
	  * @desc Setup system to listen user hand
	*/		
	this.setModeListen = function()
	{
		window.clearTimeout( this.answerTID );
		this.answerTID = window.setTimeout( "rps.listenTimeout();", RockPaperScissors.ANSWER_TIME_OUT );
		window.setTimeout( "rps.cpuChoose();", Math.random() * RockPaperScissors.ANSWER_TIME_OUT );
		
		this.mode = RockPaperScissors.MODE_LISTEN;
	}
	
	/**
	  * @desc Put the CPU hand in a turn.
	*/		
	this.cpuChoose = function()
	{
		if( this.dumbuserHand )
		{
			// user is dumb. Must be punished. CPU saw.
			this.cpuChoice = this.getFulminantAttack( this.dumbuserHand );	
		}
		else
		{
			this.cpuChoice = Math.round( Math.random() * 2 );
		}
			
		if( this.userChoice > -1 )
		{
			this.setMode( RockPaperScissors.MODE_EVALUATE );
		}
	}
	
	/**
	  * @desc Fired when user takes too long time to answer.
	*/		
	this.listenTimeout = function()
	{
		this.userLosetime = true;
		
		window.clearTimeout( this.answerTID );
		
		this.lh.resetLog();
		this.lh.logScream( "You lose.<br />Be faster!" );
		
		this.cpuScore ++;
		
		this.appendResults();

		window.clearTimeout( this.listenTimeout );
		window.setTimeout( "rps.nextRound();", RockPaperScissors.NEXTROUND_TIME_OUT );
	}
	
	/**
	  * @desc Fired when system confirms a valid user hand.
	*/		
	this.listenCatchedHand = function( hand )
	{
		window.clearTimeout( this.answerTID );
		
		this.userChoice = hand;
		
		console.log( "CATCHED! " + hand );
		
		if( this.cpuChoice > -1 )
		{
			this.setMode( RockPaperScissors.MODE_EVALUATE );
		}
	}
	
	/**
	  * @desc Prepare state machine for next round
	*/		
	this.nextRound = function()
	{
		this.count = 3;
		this.dumbuserHand = null;
		this.handHistory = new Array();
		this.cpuChoice = -1;
		this.userChoice = -1;
		this.userLosetime = false;
		this.setMode( RockPaperScissors.MODE_321 );
	}
	
	/**
	  * @desc Update screen with results
	*/		
	this.appendResults = function()
	{
		this.lh.logScream( "Player: " + this.playerScore + " / CPU: " + this.cpuScore );
	}
	
	/**
	  * @desc System looks at USER and CPU hands to decide the winner
	*/		
	this.setModeEvaluate = function()
	{
		this.lh.resetLog();
		this.lh.logScream( "Player: " + this.getHandname( this.userChoice ) + "<br />CPU: " + this.getHandname( this.cpuChoice ) );

		var userWon = (
						( this.userChoice == RockPaperScissors.ROCK && this.cpuChoice == RockPaperScissors.SCISSORS )
						||
						( this.userChoice == RockPaperScissors.PAPER && this.cpuChoice == RockPaperScissors.ROCK )
						||
						( this.userChoice == RockPaperScissors.SCISSORS && this.cpuChoice == RockPaperScissors.PAPER )
					  );
					  
		var cpuWon = (
						( this.cpuChoice == RockPaperScissors.ROCK && this.userChoice == RockPaperScissors.SCISSORS )
						||
						( this.cpuChoice == RockPaperScissors.PAPER && this.userChoice == RockPaperScissors.ROCK )
						||
						( this.cpuChoice == RockPaperScissors.SCISSORS && this.userChoice == RockPaperScissors.PAPER )
					  );		
					  
		if( userWon )
		{
			this.playerScore ++;
			this.lh.logScream( "You win." );
		}
		else if( cpuWon )
		{
			this.cpuScore ++;
			this.lh.logScream( "You lose." );
		}
		else
		{
			this.lh.logScream( "Draw." );
		}
	
		this.appendResults();
		
		window.setTimeout( "rps.nextRound();", RockPaperScissors.NEXTROUND_TIME_OUT );
		
		this.mode = RockPaperScissors.MODE_EVALUATE;
	}
	
	/**
	  * @desc Debug method to debug Helper
	*/		
	this.showResult = function()
	{
		var pointableCount = this.lh.getPointableCountByHand();
				
		if( pointableCount.hands.length == 0 )
		{
			this.lh.logScream( "There is<br />no hands." );
		}
		else
		{
			for( var hand in pointableCount.hands )
			{
				this.lh.logScream( "Hand " + ( parseInt( hand ) + 1 ) + " is<br />" + this.checkHand( pointableCount.hands[ hand ] ) + "." ); 	
			}
		}
	}
	
	/**
	  * @desc Main strategy to detect hands based on pointable count
	*/		
	this.checkHand = function( hand )
	{
		if( hand.pointableCount == 2 )
		{
			return RockPaperScissors.SCISSORS;
		}
		else if( hand.pointableCount > 2 )
		{
			return RockPaperScissors.PAPER;			
		}
		else
		{
			return RockPaperScissors.ROCK;	
		}
	}
	
	/**
	  * @desc CPU uses this method to always win against a dumb user.
	*/		
	this.getFulminantAttack = function( hand )
	{
		switch( hand )
		{
			case RockPaperScissors.ROCK:
				return RockPaperScissors.PAPER;
			case RockPaperScissors.PAPER:
				return RockPaperScissors.SCISSORS;
			case RockPaperScissors.SCISSORS:
				return RockPaperScissors.ROCK;
		}
	}
	
	/**
	  * @desc Used to get a name for each hand position
	*/		
	this.getHandname = function( hand )
	{
		switch( hand )
		{
			case RockPaperScissors.ROCK:
				return "rock";
			case RockPaperScissors.PAPER:
				return "paper";
			case RockPaperScissors.SCISSORS:
				return "scissors";
		}
	}	
}