function mouse_position_xy(evt)
{
	var x =  evt.clientX;
   	var y =  evt.clientY;
	var result = new Object();
	result.x=x;
	result.y=y;
    	return result;
}

function touch_position_xy(canvas, evt, index)
{
	var x = 0;
	var y = 0;
	if ( canvas != null ) 
    	{
		var rect = canvas.getBoundingClientRect();
		x =  (evt.targetTouches[index].pageX - rect.left);
    		y =  (evt.targetTouches[index].pageY - rect.top);
    	} else {
		x =  evt.targetTouches[index].pageX;
   		y =  evt.targetTouches[index].pageY;
    	}

    	var result = new Object();
    	result.x=x;
    	result.y=y;
    	return result;
}

//**********************************************************************************************************************
// Interactive Canvas
//**********************************************************************************************************************

function canvas_inter(document, parent_id, canvas_id, socket, height, width)
{
	this.id=null;
	this.parent=null;
	this.context=null;
	this.canvas=null;
  	this.document=null;
	this.width=1;
	this.height=1;
	this.socket=null;
	this.drag=false;

	this.id       = canvas_id;
        this.document = document;
	this.parent   = document.getElementById(parent_id);
	this.canvas   = document.getElementById(canvas_id);

        this.context  = this.canvas.getContext('2d');
	this.socket   = socket;
	this.context.globalAlpha=1.0;

	this.set_size(height, width);
	this.add_events(height, width);
}

canvas_inter.prototype.set_size = function(height_orig, width_orig)
{
        var context = this.context;
	var canvas  = this.canvas;

        canvas.style.width  = width_orig;
        canvas.style.height = height_orig;

        canvas.width  = width_orig;
        canvas.height = height_orig;

        context.clearRect(0, 0, canvas.width, canvas.height);
}

canvas_inter.prototype.test = function(height, width)
{
	var context = this.context;
	var canvas  = this.canvas;

        context.clearRect(0, 0, canvas.width, canvas.height);

	var i=0;
	for (i=0; i<(width+2); i=i+50)
	{
		context.beginPath();
		context.moveTo(i,0);
		context.lineTo(i,height);
		context.strokeStyle = '#F00F0f0f';
		context.stroke();
	}
	var i=0;
	for (i=0; i<(height+2); i=i+50)
	{
		context.beginPath();
		context.moveTo(0,i);
		context.lineTo(width, i);
		context.strokeStyle = '#F00F0F0f';
		context.stroke();
	}
}

canvas_inter.prototype.reset = function()
{
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

canvas_inter.prototype.draw = function(json_data)
{
    var data = JSON.parse(json_data);
    if (data.type == 'set')
    {
		this.reset(); // Reset Map befor drawing new map
		var dim = data.dim;
		this.set_size(dim);
    }
}

canvas_inter.prototype.mousedown = function(x, y)
{
	var id = null;
	if (this.visible==false)
	{
	} else {
		if (this.drag==false)
		{
			id = detector_map.find(x, y);
			if ( id != null ) {
				this.drag=true;
				console.log("Drag id ok!!! ", this.id);
			}
		}
	}
	this.id = id;
	return id;
}

canvas_inter.prototype.display_image = function(image, context, width, height)
{
    context.drawImage(image, 0, 0, width, height );
}


canvas_inter.prototype.add_events = function(height, width)
{
	var document = this.document;
	var canvas   = this.canvas;
	var parent   = this.parent;

	var drag = false;

	var last_x = 0;
	var last_y = 0;

	this.canvas.ontouchmove=function(evt)
	{
        	var pos1 = touch_position_xy(canvas, evt, 0);
		var touches = evt.changedTouches;
		if ( touches.length==1)
		{
			if ( drag == true)
			{
				var pos = touch_position_xy(parent, evt, 0);
    				evt.preventDefault();
                		parent.scrollTop  +=  (last_y - pos.y);
                		parent.scrollLeft +=  (last_x - pos.x);
                		last_x = pos.x;
                		last_y = pos.y;
                		canvas.style.cursor="grab";
			} else {
				canvas.style.cursor="grab";
			}
        	}
    	}

	this.canvas.onmousemove=function(evt)
	{
		if (drag == true ) {
			var pos = mouse_position_xy(evt);
			var diffy = last_y - pos.y; 
			var diffx = last_x - pos.x; 
            		parent.scrollTop  +=  diffy;
            		parent.scrollLeft +=  diffx;
			console.log("DX ", diffx, " DY ", diffy);
            		last_x = pos.x;
            		last_y = pos.y;
		}
		canvas.style.cursor="grab";
	}

	this.canvas.ondblclick=function(evt) {
			console.log("Double Click");
	}

	var double_tapped = false;

	this.canvas.ontouchstart=function(evt)
	{
		var touches = evt.changedTouches;
            	var pos1 = touch_position_xy(canvas, evt, 0);
		if ( touches.length == 1) 
        	{
    	    		evt.preventDefault();
			if (!double_tapped)
			{
				console.log("Touch double tap");
				double_tapped = true;
			} else {
				// Double tap action
				console.log("double tap timed out");
				return;
			}

            		var pos = touch_position_xy(null, evt, 0);
            		last_x1 = pos1.x;
            		last_y1 = pos1.y;
            		drag = true;
		}
		else if (touches.length==2)
                {
		}
    	}

	this.canvas.onmousedown=function(evt)
	{
		console.log("Mouse down:- ",  drag);
		var pos1 = mouse_position_xy(evt);
		last_x1 = pos1.x;
		last_y1 = pos1.y;
		if ( drag == false )
		{
			canvas.style.cursor="grab";
			drag = true;
		}
	}

	this.canvas.onmouseleave=function(evt) {
		drag=false;
	}

	this.canvas.onmouseout=function(evt) {
		drag=false;
	}

	this.canvas.ontouchend=function(evt) {
    		evt.preventDefault();
            	drag = false; // Disable drag
    	}

	this.canvas.onmouseup=function(evt) {
		drag = false;
		canvas.style.cursor="default";
	}
}
