/**
  * @desc Simple JS Helper methods used in Rock Paper Scissors JS
  * @author: Nandico nandico@gmail.com
*/
function LeapHelper()
{
	// frame reference for current instance
	this.frame = null;
	
	// system z treshold used to ignore head
	this.HAND_Z_THRESHOLD = 200;
	
	/**
	  * @desc Writes a generic output
	*/	
	this.log = function( key, value )
	{
		document.getElementById("output").innerHTML	+= "<pre>" + key + ": " + value + "</pre>";	
	}
	
	/**
	  * @desc Writes a screen output
	*/	
	this.logScream = function( value )
	{
		document.getElementById("output").innerHTML	+= "<h2>" + value + "</h2>";	
	}	
	
	/**
	  * @desc Reset screen log
	*/		
	this.resetLog = function()
	{
		document.getElementById("output").innerHTML = "";
	}
	
	/**
	  * @desc Setter for actual LEAP frame
	*/	
	this.setFrame = function( frame )
	{
		this.frame = frame;
	}
	
	// return the actual system pointable count
	this.getPointablecount = function()
	{
		if( this.frame && this.frame.pointables )
		{
			return this.frame.pointables.length;
		}
		else
		{
			return 0;
		}
	}
	
	/**
	  * @desc Count hands over LEAP sensor
	*/	
	this.getHandscount = function()
	{
		if( this.frame && this.frame.hands )
		{
			return this.frame.hands.length;
		}
		else
		{
			return 0;
		}
	}
	
	/**
	  * @desc Count pointables grouping for each hand
	*/	
	this.getPointableCountByHand = function()
	{
		var pointableCount = new Object();
		
		if( this.frame && this.frame.hands && this.frame.pointables )
		{
			pointableCount.hands = new Array();
				
			for( var hand in this.frame.hands )
			{
				handZ = this.frame.hands[ hand ].palmPosition[ 2 ];
				
				if( handZ < this.HAND_Z_THRESHOLD ) // apply Z-axis treshold to avoid head detection
				{
					var handObject = new Object();
					handObject.id = this.frame.hands[ hand ].id;
					handObject.z = this.frame.hands[ hand ].palmPosition[ 2 ];
					handObject.pointableCount = 0;
	
					for( var pointable in this.frame.pointables )
					{
						if( this.frame.pointables[ pointable ].handId == handObject.id )
						{
							handObject.pointableCount ++;	
						}
					}
					
					pointableCount.hands.push( handObject );
				}
						
			}


		}
		
		return pointableCount;
	}
	
	/**
	  * @desc Get the most proeminent hand over leap sensor
	  * This strategy consider the hand with smaller z-axis position
	*/		
	this.getMoreProeminentHand = function()
	{
		pointableCount = this.getPointableCountByHand();
		closer = 5000;
		selectedHand = null;
	
		for( var hand in pointableCount.hands )
		{
			actualHand = pointableCount.hands[ hand ];
					
			if( actualHand.z < closer )
			{
				selectedHand = pointableCount.hands[ hand ];
				closer = actualHand.z;
			}	
		}
		
		return selectedHand;
	}
}
