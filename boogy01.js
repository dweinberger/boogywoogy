/* BoogyWoogy browser 
	v.2 Sept. 30, 2014

	This is an early, prototype demo of some of the basic services of Harvard LibraryCloud, and open metadata server being developed under an Arcardia Foundation grant provided by the Harvard Library Lab. 
	
	BoogyWoogy lets a user search the records of almost all of the 13M items in the Harvard Library collection. Clicking on one of the results fetches other items "like" it in that collection, where what "like" means is chosen by the user by a slider. The results are displayed in a colorful grid.
	
	This demo was written by a hobbyist, so the code should not be taken seriously. In fact, it should be forgiven. And it is using a very early alpha version of the LibraryCloud API. It currently uses a jQuery plugin that I developed to get data out of the complex JSON that the API returns. (The API uses a schema based on standard MODS). The plugin is lousy. At some point, perhaps soon, it will be obviated as the LibraryCloud API, and the platform's enhancement processes, are improved.
	
	The laughable source code is here: https://github.com/dweinberger/boogywoogy.
	
	There's a version of it live at http://hyperorg.com/programs/boogywoogybrowser/boogywoogy01.html
	
	David Weinberger
	Sept. 25, 2014
	self@evident.com

	Dual licensed under the MIT license (below) and GPL license.

	MIT License

	Copyright (c) 2014 David Weinberger

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



*/

// Globals. Yes, globals, dammit. I said I'm a hobbyist!

function Book(img,title,author,subject,year,hollisid,abs,toc){
	this.img = img;
	this.title = title;
	this.author = author;
	this.subject=subject;
	this.year = year;
	this.hollisid=hollisid;
	this.abstract = abs;
	this.toc = toc;
}

function Square(x,y,bookid,direction,searchnumber){
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.searchnumber = searchnumber;
}

var numbOfRows = 13;
var numbOfCols = 13;

var gClickedBox = [-1, -1];
var gHoverbox = [-1, -1];
var gsearchnumber = -1;
var gslidervalue = -1;
var books = new Array();
var gbookline = new Array();
var gbookgrid = [];
var grid = []; 
var searchArray = [];
var gcolorctr = 0;
// background and foreground pairs:
var colors = [["#FFCC66","#800000"],["#66FFCC","#000080"],["#CC66FF","#004080"],
			  ["#66CCFF","#000080"],["#FF6FCF","#800000"],["#000000","#FFFFFF"],
			  ["#FF6666","#520101"],["#FFFF66","#158409"],["#66FF66","#008080"],
			  ["#66FFFF","#000080"],["#6666FF","#000000"],["#800000","#FFFF66"],
			  ["#FF0000","#FFFFFF"],["#008000","#CCFF66"],["#000080","#FFFF66"],
			  ["#800080","#FFCC66"],["#008040","#FFFF00"],["#FF88D2","#4E147D"],
			  ["#00FFFF","#000080"],["#4C4C4C","#FFFFFF"],["#9E9E9E","#370101"]];

function init(){

	// -- Lay out the grid  
	var gridtop = outerdiv.style.top;
	var gridleft = outerdiv.style.left;

	var x,y,i, j, div,id;
	var spacer = 10; // spacer between inner boxes
	// set starting point

	var ptop =  spacer;
	var pleft = gridleft + spacer;
	var ctr = -1;
	for (i=0; i < 13 ; i++){
		for (j=0;j < 13; j ++) {
			ctr++;
		   // create new div
		   div = document.createElement('div');
		   div.setAttribute("class","b tooltip");
		   var id = i + ":" + j;
		   //div.setAttribute("onhover","hoverPopUp('" + id + "')");
		   div.setAttribute("onclick","fetchARow('" + i + "','" + j + "')");
		   div.setAttribute("searchnumber", "-1");
		   div.setAttribute("id",id);
		   div.setAttribute("x",i);
		   div.setAttribute("y",j);
		   //div.innerHTML = ctr;	 
		   // create inner frame?	 
		   outerdiv.appendChild(div);
		   // add info to grid array
		   var box = {};
		   box.x = i;
		   box.y = j;
		   box.bookid = "";
		   box.direction="";
		   grid.push(box);
		   // initialize the bookgrid
		   gbookgrid.push(box);
		   }
	   // create a clear float to wrap the line
	   div = document.createElement("div");
	   $(div).css("clear","both");
	   outerdiv.appendChild(div);
	  }
  
	
	// randomize backgrounds (with associated font colors)	
	colors = randomizeArray(colors);
	
	$('.b').hover(function(e){
		gHoverbox = [$(this).attr("x"), $(this).attr("y")];
	});
	
	
	// tipster for hovering
	
	
	  $('.b').tooltipster({
	  // 	position: "bottom-right",
	  	theme: "tipster-theme-dw",
	  	autoClose: "false"
	  });

	
	
  $("[searchnumb!='-1'] .b").tooltipster('content', function(){
  		if ($("#catcarddiv").is(":visible") == false){
  			var x = gHoverbox[0];
  			var y = gHoverbox[1];
         	var boxnumb = getBoxNumber(x,y);
         	var title = gbookgrid[boxnumb].title.join(": ");
         	var subj = gbookgrid[boxnumb].subject.join("; ");
         	var auth = gbookgrid[boxnumb].author.join("; ");
         	var ddate = gbookgrid[boxnumb].year;
         	var tipcontent = "<div class='tiptitle'>" + title + " (" + ddate + ")</div>" + "<div class='tipauth'><em>by</em> " + auth + "</div>";
         	var tipcontent = tipcontent + "<div class='tipsubj'><em>Subjects</em>: " + subj + "</div>";
         	var i = gbookgrid[boxnumb].searchnumber;
         	var searchtxt = "<div class='tipsearch'>Search #" + (i + 1) + " " + searchArray[i]["degree"];
         	searchtxt = searchtxt + " Subject: \"" + searchArray[i]["subjterm"] +
         				"\" Keyword: \"" + searchArray[i]["keyterm"] + "\"";
         	tipcontent = tipcontent + searchtxt + "</div>";
         	return tipcontent;
  		}
  		
  		});


	//--- set slider values
	
	// STRICTEST subject search for word - Monica Geller
	// STRICT take second subject for subj search - Kevin Bacon
	// SORTOF take first subject for keyword search  - Bill Murray
	// WEAK: take last subject for keyword search - Phoebe Buffay
	// KEVIN BACON: Take first non-stop word of title and do keyword - Nic Cage
	
	$("#slider").bind("slider:changed", function (event, data) {
	// The currently selected value of the slider
		// alert(data.value);
		// set to global
		var slideval = data.value;
		if (slideval < 0.2){
			$("#slidertext").html("STRICTEST");
		//	$("#slidertext").css({"color":"black","font-weight":"300","font-size":"12px"});	
		}
		if ((slideval >= 0.2) && (slideval < 0.4)) {
			$("#slidertext").html("STRICT");
			//$("#slidertext").css({"color":"#404040","font-weight":"400","font-size":"14px"});
		}
		if ((slideval >= 0.4) && (slideval < 0.6)){
			$("#slidertext").html("SORTOF");
			//$("#slidertext").css({"color":"#782C37","font-weight":"600","font-size":"16px"});
		}
		if ((slideval >= 0.6) && (slideval < 0.8)){
			$("#slidertext").html("WEAK");
			//$("#slidertext").css({"color":"#9A5C34","font-weight":"700","font-size":"20px"});
		}
		if (slideval >= 0.8){
			$("#slidertext").html("KEVIN BACON");
			// $("#slidertext").css({"color":"red","fontWeight":"800","font-size":"24px"});
		}
	});
	// set the slider to default
	$("#slider").simpleSlider("setValue", 0.0);
	
	// Go to stacklife (context button)
	$('.b').bind("contextmenu",function(e){
		launchCatCard(this);
		
		return false 
		
		// -- DEBUG 
   		//alert('Context Menu event has fired!');
   		if ($(this).attr("searchnumb") != "-1"){
   			var r = confirm("Explore this item in StackLife?");
   			// get stacklife ID and open the window to it
   			if (r){
   				// get hollis ID
   				var hollisid = $(this).attr("hollis");
				$.ajax({
					type: "POST",
					data: {hollisid  : hollisid },
					 url: './php/getStacklife.php',
					 success: function(r,mode){
					 		var surl = "http://stacklife.harvard.edu/item/n/" + r;
							 window.open(surl,'StackLife from Boogy');        
						},
					error: function(r,mode){
						
						alert("Unable to launch StackLife.");
					}
			  });
   				
   			}
   		}
   		return false; 
});
	// pressing enter submits the search
	$("#searchbox").keypress(function(e){
		if (e.which === 13){
			startSearch();
			$("#searchbox").blur(); // remove focus
			event.preventDefault();
		}
	});
	
	// arrow keys control the detail box (carcard)
	$(document).keydown(function(e){
		//
// 			return false;
// 		}
		// only do this if the new square is filled
		var r = gClickedBox[0];
		var c = gClickedBox[1];
		var box = document.getElementById(r + ":" + c);
		switch (e.which){
		
		case 37: // left
			c = c -1;
			if (c < 0) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 38: // up
			r = r -1;
			if (r < 0) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 39: // right
			c = c + 1;
			if (c > 12) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 40: // down
			r = r + 1;
			if (c > 12) { return}
			box = document.getElementById(r + ":" + c);
			if ($(box).attr("searchnumber") != "-1"){
				launchCatCard(box);
			}
			break;
		case 27: // Escape key
			$("#catcarddiv").hide(200);
			break;
		}
	});
	
	// for debugging:
	//startSearch();
	
}

function startSearch(){
	// pressed the keyword search button
	
	// get the search term
	var searchterm = $("#searchbox").val();
	if (searchterm == ""){ // error check
		alert("Enter a subject to search for");
		return
	}
	var r = false;
	// Do any squares have a horizontal or vertical class? If so, there are books on the grid
	// so we need to do an entire reset
	var horiz = $(".horizontal");
	var vert = $(".vertical");
	if ((horiz.length > 0) || (vert.length > 0)){
		r = confirm("Doing this search will clear the entire grid. Continue? \n[Feature under development. If it doesn't work, reload this page.] ");
		if (r){
			resetGrid();
		}
		else{
			return;
		}
	}
	// track the searches themselves
	searchArray.push({searchnumber : 0, subjterm : "", keyterm: searchterm, degree : "Initial keyword search"});
	
	// get some books, noting that this is the first search
	fetchBooks("-1");
}

function fetchBooks(clickedBox_xy){
	// clickedBox_xy: grid coords of the box the user clicked that got us here
	// if first search, then bookid = -1 and subject = value of searchbox
	
	// get slider value
	var slidervalue = $("#slidertext").text();
	
	
	var term;
	 // first time search?
	if (clickedBox_xy == "-1"){
		term = $("#searchbox").val();
		var typeofsearch = "KEYWORD";
		// get random starting points.
		var aa = Math.floor(Math.random() * 13);
		var bb = Math.floor(Math.random() * 13);
 		clickedBox_xy = [aa,bb];
	}
	// click on a filled-in box
	else {
		var r = clickedBox_xy[0];
		var c = clickedBox_xy[1]
		var booknumb = getBoxNumber(r,c);
		
		// what type of search?
		switch (slidervalue){
			case "STRICTEST":
				if ( ($.isArray(gbookgrid[booknumb]["subject"])) && (gbookgrid[booknumb]["subject"][0] !== undefined  ) ){
					term = gbookgrid[booknumb]["subject"][0];
				}
				else { 	// Sleazy: If LibCloud returns no subject, 
						// just use the search term
					term = $("#searchbox").val();
				}
				typeofsearch = "SUBJECT";
				searchArray.push({searchnumber : gsearchnumber, subjterm : term, keyterm: "", degree : "Strictest"});
				break;
			case "STRICT":
				// get last subject and do subject search
				if ( ($.isArray(gbookgrid[booknumb]["subject"])) && (gbookgrid[booknumb]["subject"][0] !== undefined  ) ){
					var z =  gbookgrid[booknumb]["subject"].length;
					z = z - 1;
					term = gbookgrid[booknumb]["subject"][z];
				}
				else { // if LibCloud returned no subject
					term = $("#searchbox").val();
				}
				typeofsearch = "SUBJECT";
				searchArray.push({searchnumber : gsearchnumber, subjterm : term, keyterm: "", degree : "Strict"});
				break;
			case "SORTOF":
				// get the first subject's first word, do keyword search
				if ( ($.isArray(gbookgrid[booknumb]["subject"])) && (gbookgrid[booknumb]["subject"] !== undefined  ) ){
					term = gbookgrid[booknumb]["subject"][0];
				}
				else { // if LibCloud returned no subject
					term = $("#searchbox").val();
				}
				var p = term.indexOf(" ");
				if (p > -1){
					term = term.substr(0,p);
				}
				typeofsearch = "KEYWORD";
				searchArray.push({searchnumber : gsearchnumber, subjterm : "", keyterm: term, degree : "SortOf"});
				break; 
				
			case "WEAK":
				//  subject search and keyword search
				var title = gbookgrid[booknumb]["title"][0];
				var titleterm = firstNonStopword(title);
				if ( ($.isArray(gbookgrid[booknumb]["subject"])) && (gbookgrid[booknumb]["subject"] !== undefined  ) ){
					var z =  gbookgrid[booknumb]["subject"].length;
					z = z - 1;
					subjterm = gbookgrid[booknumb]["subject"][z];
				}
				else { // if LibCloud returned no subject
					subjterm = "";
				}
				// combine both terms, to be pulled apart in php
				term = subjterm + "|||" + titleterm;
				typeofsearch = "WEAK";
				searchArray.push({searchnumber : gsearchnumber, subjterm : subjterm, keyterm: titleterm, degree : "Weak"});
				break;
			case "KEVIN BACON":
				// get first nonstopword from title
				var title = gbookgrid[booknumb]["title"][0];
				term = firstNonStopword(title);
				// it's all stop words
				if (term == ""){
					term = gbookgrid[booknumb]["subject"][0];
				}
				typeofsearch = "KEYWORD";
				searchArray.push({searchnumber : gsearchnumber, subjterm : "", keyterm: term, degree : "Kevin Bacon"});
				break;
				
				}
				
				
		}
	
	// do the search, get some books, parse the json, get an array of books for this line, display the line
		$.ajax({
			type: "POST",
			data: {searchterm  : term, searchtype : typeofsearch, degree : slidervalue },
			 url: './php/boogy.php',
			 success: function(r,mode){
					gsearchnumber++;
					parseAndLoadBookLine(r);
					layOutLine(clickedBox_xy);           
				},
			error: function(r,mode){
				alert("Oops. Query failed. Click somewhere else.");
			}
	  });
 
}

function parseAndLoadBookLine(resp){
	jbooks = JSON.parse(resp); // turn the response into json
  	jsonIntoRecord(jbooks); // turn it into an array of books; creates global gbookline
}

function jsonIntoRecord(jsn){
	// converts json into an array that will be a line of books (gbookline)
	
	;
	gbookline= []; // init the bookline
	var items = jsn.items;
	
	for (var i=0; i < items.length; i++){
			var tempbook = new Book(); // to hold each book as created from json
			
			// use jquery library to get arrays of items we care about
			var subjarray =  $(items[i]).parseItemJSON("subject");
			tempbook["subject"] = subjarray;
			var autharray =  $(items[i]).parseItemJSON("author");
			tempbook["author"] = autharray;
			var titlearray =  $(items[i]).parseItemJSON("title")
			tempbook["title"] = titlearray;
			var hollisid = $(items[i]).parseItemJSON("hollisID");
			tempbook["hollisid"] = hollisid;
			var ddate = $(items[i]).parseItemJSON("date");
			tempbook["year"] = ddate;
			var aabstract = $(items[i]).parseItemJSON("abstract");
			tempbook["abstract"] = aabstract;
			var toc = $(items[i]).parseItemJSON("tableOfContents");
			tempbook["toc"] = toc;
		
		// add this to gbookline
		gbookline.push(tempbook);	
	}
	
	// randomize the length of the line, just for visual appeal
	if (gbookline.length > 4){
		var randlen = (Math.floor(Math.random() * 5) + 1) + 4; // i know this isn't optimal
		gbookline = gbookline.slice(0,randlen);
	}
	
}
  

function getBoxNumber(r,c){
	// convert row and column into index
	
	var res =  (parseInt(r) * 13) + parseInt(c);
	return parseInt(res)
}

function layOutLine(clickedBox){
	// Display the contents of bookline, i.e., the items returned by the query
	
	// clickedbox = x and y of the box that was clicked
	var r = clickedBox[0];
	var c = clickedBox[1];

	// what direction is the box currently going in?
	var boxnumber = getBoxNumber(r,c);
	var gridbox = gbookgrid[boxnumber];
	var direction = gridbox["direction"];
	switch (direction){
		case "": 
   			direction = "HORIZONTAL";
   			break;
   		case "HORIZONTAL":
   			direction = "VERTICAL";
   			break;
   		case "VERTICAL":
   			direction = "HORIZONTAL"
   			break;
   	}
   
   	// remove catcard
	$("#catcarddiv").hide(200);

	// ----- do the layout	
	
	// get array of which squares to fill
	
	// for each of the items in gbookline
	//	to fit the line of books onto the grid, we alternate the sides of the startbox
	//	we're building on. If there's no room on one side, then we switch to the other.
	var turnA = true; // which side are we building on?
	var newr,newc;
	var edges = [];  // the two squares -- on on either side -- we might fill with an item
	var colorPair = colors[gcolorctr]; // get the color for this box
	gcolorctr++; // increase the counter into the color array
	if (gcolorctr > colors.length){gcolorctr=0;} // start again in the color array if necessary
	
	// go down the gbookline array of fetched items
	for (var i=0; i< gbookline.length; i++){
		// get title and author
		var strtitle = gbookline[i]["title"][0];
		// truncate the displayed title if necessary
		if (strtitle.length > 35){strtitle = strtitle.substr(0,35) + "...";}
		// create a single string out of the title array. It will be shown in the hover box
		var hiddentitle = gbookline[i]["title"].join(" : ");
		var strauthor = gbookline[i]["author"].join("; ");
		// create a single string out of the title array. It will be shown in the hover box
		var displayText = "<span class='title' title='" + hiddentitle + "\n" + strauthor + "'>" + strtitle + "</span>";
		// try going either way alternately until we hit an obstacle
		if (direction == "HORIZONTAL"){
			// get left and right free spaces
			edges = getNextOpenSquare(r,c,"HORIZONTAL");
			// if it's the first search, forcefeed it. Otherwise it leaves a hole
			if ( (i==0) && (gsearchnumber == 0) ){
				edges = [c,c];
			}
			if (turnA){
				if (edges[0] == -1){ // if can't go left, then go right
					newc = edges[1];
				}
				else{
					newc = edges[0];
				}
			}
			else {
				if (edges[1] == -1) { // if can't go right, then go left
					newc = edges[0];
				}
				else {
					newc = edges[1];
				}
			}
			turnA = !turnA; // flip the direction for next move
			// if there's a legit move, do it
			if (newc != -1){
				// get the div box
				var divbox = document.getElementById(r + ":" + newc);
				// put content into the box
				$(divbox).removeClass("vertical");
				$(divbox).addClass("horizontal");
				divbox.setAttribute("searchnumber",gsearchnumber);
				divbox.setAttribute("hollis",gbookline[i]["hollisid"]);
				divbox.style.backgroundColor = colorPair[0];
				divbox.style.color = colorPair[1];
				// get random duration for fade
				var fadetime = Math.floor(Math.random() * ((1100-100)+1) + 100);
				$(divbox).hide().html(displayText).slideToggle(fadetime);
				var booknumber = getBoxNumber(r,newc);
				gbookgrid[booknumber]["direction"] = "HORIZONTAL";
				gbookgrid[booknumber]["subject"] = gbookline[i]["subject"];
				gbookgrid[booknumber]["title"] = gbookline[i]["title"];
				gbookgrid[booknumber]["author"] = gbookline[i]["author"];
				gbookgrid[booknumber]["searchnumber"] = gsearchnumber;
				gbookgrid[booknumber]["hollis"] = gbookline[i]["hollisid"];
				gbookgrid[booknumber]["year"] = gbookline[i]["year"];
				gbookgrid[booknumber]["abstract"] = gbookline[i]["abstract"];
				gbookgrid[booknumber]["toc"] = gbookline[i]["toc"];
			}
				
		}
		if (direction == "VERTICAL"){
			// get next up and down free spaces
			edges = getNextOpenSquare(r,c,"VERTICAL");	
					
			if (turnA){
				if (edges[0] == -1){ // if can't go down, then go up
					newr = edges[1];
				}
				else{
					newr = edges[0];
				}
			}
			else {
				if (edges[1] == -1) { // if can't go up, then go down
					newr = edges[0];
				}
				else {
					newr = edges[1];
				}
			}
			turnA = !turnA; // flip the direction for next move
			// if there's a legit move, do it
			if (newr != -1){
				// get the div box
				var divbox = document.getElementById(newr + ":" + c);
				// put content into the box
				$(divbox).removeClass("horizontal");
				$(divbox).addClass("vertical");
				divbox.setAttribute("searchnumber",gsearchnumber);
				divbox.setAttribute("hollis",gbookline[i]["hollisid"]);
				divbox.style.backgroundColor = colorPair[0];
				divbox.style.color = colorPair[1];
				var fadetime = Math.floor(Math.random() * ((1000-200)+1) + 200);
				$(divbox).hide().html(displayText).fadeIn(fadetime);
				var booknumber = getBoxNumber(newr,c);
				gbookgrid[booknumber]["direction"] = "VERTICAL";
				gbookgrid[booknumber]["subject"] = gbookline[i]["subject"];
				gbookgrid[booknumber]["title"] = gbookline[i]["title"];
				gbookgrid[booknumber]["author"] = gbookline[i]["author"];
				gbookgrid[booknumber]["searchnumber"] = gsearchnumber;
				gbookgrid[booknumber]["hollis"] = gbookline[i]["hollisid"];
				gbookgrid[booknumber]["year"] = gbookline[i]["year"];
				gbookgrid[booknumber]["abstract"] = gbookline[i]["abstract"];
				gbookgrid[booknumber]["toc"] = gbookline[i]["toc"];
			}	
		}
	}
	// Visibly mark the clicked-on box so the user can see it
	divbox = document.getElementById(r + ":" + c);
	// if it's the first one, scroll to it
	if (gsearchnumber == 0){
		//$(divbox).scrollintoview();
	}
	

}

function getNextOpenSquare(r,c,direction){
	// when laying out a line, find the next two boxes (up and down or left and right) that can
	// be filled in. If a box can't be filled in, return -1
	
	var leftc = -1, rightc = -1, upc = -1, downc = -1
	// get search number of starting square so we can skip it
	var startsq = getBoxNumber(r,c);
	var startbox = document.getElementById(r + ":" + c);
	var startsearchnumber = startbox.getAttribute("searchnumber");
	
	//-------- HORIZONTAL
	var i, thisSearchNumber, thisbox;
	if (direction == "HORIZONTAL"){
		// get left by walking up to starting col from the left edge (c = 0) 
		for (i=0; i < c; i++){
			thisbox = document.getElementById(r + ":" + i);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				leftc = i;
			}
		}
		// get rightc by walking from right edge to clicked box
		for (i=12; i > c; i--){
			thisbox = document.getElementById(r + ":" + i);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				rightc = i;
			}
		}
		return [leftc,rightc];
	}
	
	//--------- VERTICAL
	if (direction == "VERTICAL"){
		// get upc by walking down from top edge to starting row 
		for (i=0; i < r; i++){
			thisbox = document.getElementById(i + ":" + c);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				upc = i;
			}
		}
		// get downc by walking up from bottom to starting row
		for (i=12; i > r; i--){
			thisbox = document.getElementById(i + ":" + c);
			thisSearchNumber = thisbox.getAttribute("searchnumber");
			// is this box already taken by this search?
			if (thisSearchNumber != gsearchnumber){
				downc = i;
			}
		}
	}
	return [upc,downc];
}


function fetchARow(x,y){
	// get new books, unless we got here through an arrow key while 
	// the catalog card is open
	
	clickedABox(x,y); // mark the box as clicked
	
	//if ($("#catcarddiv").is(':visible') !== true) {
		fetchBooks([x,y]);
	//}
}

function clickedABox(x,y){
	// clicked on an element so mark it

	// get the div
	var div = document.getElementById(x + ":" + y);
	// turn off border on all non-clicked
	$("div").removeClass("clicked");
	// turn on border
	$(div).addClass("clicked");
	gClickedBox = [x,y];
}

function firstNonStopword(s){
	// get first nonstopword from a string, or ""
	
	// turn it into an Array
	var words = s.split(" ");
	var done = false;
	var i = 0;
	while (done==false){
		word = words[i];
		if (checkStopWord(word) == false){
			term = word;
			done = true;
		}
		else {
			i++;
			if  (i >= words.length){
				done = true;
				term = "";
			}
		}
		
	}

 return term

}


function randomizeArray(o){
	// thanks http://css-tricks.com/snippets/javascript/shuffle-array/
	   for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
	
	
}

function resetQuestion(){
	var r = confirm("Clear the entire grid?");
	if (r){	
		$("#searchbox").val("");
		resetGrid();
	}
}

function resetGrid(){	
	$("#outerdiv").html("");
	gsearchnumber = -1;
	gslidervalue = 0;
	books = new Array();
	gbookline = new Array();
	gbookgrid = [];
	grid = []; 
	searchArray = [];
	gcolorctr = 0;
	$("#cardcatdiv").hide();
	init();
 }
 
function toggleButtons(which){
	// manage the buttons that show instructions and about info.
	
	if (which == "explanation"){ // explan is visible, so turn it off
		if ($("#explanation").is(':visible')){
			$('#explanation').slideUp(300);
			//$('#about').slideDown(300);
			$("#instructionsbutton").removeClass("on");
			$("#instructionsbutton").addClass("off");
		}
		else {
			$('#explanation').slideDown(300);
			$('#about').slideUp(300);
			$("#instructionsbutton").addClass("on");
			$("#instructionsbutton").removeClass("off");
			$("#aboutbutton").removeClass("on");
		}
	}
	if (which == "about"){
		if ($("#about").is(':visible')){
			$('#about').slideUp(300);
			//$('#explanation').slideDown(300);
			$("#aboutbutton").removeClass("on").addClass("off");
			//$("#explanationbutton").addClass("on");
		}
		else {
			$('#about').slideDown(300);
			$('#explanation').slideUp(300);
			$("#aboutbutton").removeClass("off").addClass("on");
			$("#instructionsbutton").addClass("off");
		}
	 }
}

function launchCatCard(box){
	// displays the inplace card with more info.
	
	// turn off qtips
	//$(".qtip").hide();
	
	// -- get the boxnumber
	var pos = $(box).offset();
	var boxtop = pos["top"]; 
	var boxleft = pos["left"];
	var r = parseInt(box.getAttribute("x"));
	var c = parseInt(box.getAttribute("y"));
	var boxnumb = getBoxNumber(r,c);
	// set this as the clicked box
	clickedABox(r,c);
	
	// -- create the content
	var contdiv = document.getElementById("cardcont");
	
	// title
	var title="";
	if (gbookgrid[boxnumb]["title"] !== undefined){
		$("#cardtitle").html(gbookgrid[boxnumb]["title"].join(": "));
	}
	
	// year
	if (gbookgrid[boxnumb]["year"] !== undefined){
		$("#cardyear").html(" [" + gbookgrid[boxnumb]["year"] + "]");
	}
	
	// author
	var author="";
	if (gbookgrid[boxnumb]["author"] !== undefined){
		$("#cardauthor").html(gbookgrid[boxnumb]["author"].join(": "));
	}
	
	// abstract
	if ( (gbookgrid[boxnumb]["abstract"] !== undefined) && (gbookgrid[boxnumb]["abstract"] !=="")){
		if ($.isArray(gbookgrid[boxnumb]["abstract"])){
			var abs = gbookgrid[boxnumb]["abstract"].join("<P>");
		}
		else{
			var abs = gbookgrid[boxnumb]["abstract"];
		}
	
	}
	else{
		abs = "No abstract.";
	}
	$("#cardabstract").html(abs);
	if (abs !== "No abstract."){
		$("#cardabstract").slideDown(abs);
	}
	else{
		$("#cardabstract").slideUp(abs);
	}
	
	// table of contents
	if ( (gbookgrid[boxnumb]["toc"] !== undefined) && (gbookgrid[boxnumb]["toc"] !=="")){
		if ($.isArray(gbookgrid[boxnumb]["toc"])){
			var toc = gbookgrid[boxnumb]["toc"].join("<P>");
		}
		else{
			var toc = gbookgrid[boxnumb]["toc"];
		}
	
	}
	else{
		toc = "No table of contents.";
		
	}
	$("#cardtoc").html(toc);
	if (toc !== "No table of contents.") {
		$("#cardtoc").slideDown(300);
	}
	else {
		$("#cardtoc").slideUp(300);
	}
		
	// -- position it
	// get the position of the outerdiv so we can add it to the offset
	// position left and top based on the position of the clicked on box
	var cardleft,cardtop, cardheight;
	var catcard = document.getElementById("catcarddiv");
	cardheight = $(catcard).height();
	var extraoffset = $("#outerdiv").offset(); // we're positioning absolutely so need offset
	// set left
// 	if (c < 7) {
// 		cardleft = boxleft + (60 - extraoffset["left"]);
// 	}
// 	else {
// 		cardleft = boxleft - (300  + extraoffset["left"]);
// 	}
// 	// anchor it al the way on the right
	cardleft = "830px";
	// set top
	if (r > 7) {
		cardtop = boxtop - ((cardheight - 60) + extraoffset["top"]);
	}
	else {
		cardtop = boxtop - extraoffset["top"];
	}
	
	// get color of the clicked cardheight
	var clickedbox = document.getElementById(r + ":"  + c);
	var targetbgcolor = $(clickedbox).css("background-color");
	var targetcolor = $(clickedbox).css("color");
	
	
	
	// show it
	
	$("#cardtitle").css({ backgroundColor : targetbgcolor, color : targetcolor});
	$(catcard).css({left : cardleft});
	$(catcard).animate({top : cardtop + "px"});
	$(catcard).show(300);
	
	
}

function gotoStacklife(el){
	// el = stacklife button in catcard
	
	// get clicked element
	var clickedbox = document.getElementById(gClickedBox[0] + ":" + gClickedBox[1]);
	var hollisid = $(clickedbox).attr("hollis");
				$.ajax({
					type: "POST",
					data: {hollisid  : hollisid },
					 url: './php/getStacklife.php',
					 success: function(r,mode){
					 		var surl = "http://stacklife.harvard.edu/item/n/" + r;
							 window.open(surl,'StackLife from Boogy');        
						},
					error: function(r,mode){
						
						alert("Unable to launch StackLife.");
					}
			  });
}


  

