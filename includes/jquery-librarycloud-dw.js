// thank you http://blog.teamtreehouse.com/writing-your-own-jquery-plugins

(function ( $ ) {

	function getObjects(obj, key, val) {
	// finds all objects with keyword with a particular value
	// thank you, Box9: http://stackoverflow.com/questions/4992383/use-jquerys-find-on-json-object
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key){// && obj[key] == val) {
            objects.push(obj);
        }
       //  if (i === "point" && obj["point"] == "start") {
//         	objects.push({start : obj["$"]});
//         }
    }
    return objects;
	}
	
	$.fn.parseItemJSON = function( action,returntype ) {
		// turns results from an item in a results list from
		// the LibraryCloud item API into an array of useful results
		// Returns arrays for: 
		// 		subject, author, title
		// Returns single value for:
		//		hollisID, date
		
		if (action == "datefailed"){
			var originItem = this[0]["mods"]["originInfo"];
			
			var flatarray = $.map(originItem, function recurs(n) {
				return ($.isArray(n["$"]) ? $.map(n, recurs): n);
			});
			// var greparray = $.grep(originItem, function(obj) {
// 				if (3 == 3) {
// 					
//     			return obj }// != undefined;
// 				});
			var dates = getObjects(originItem, "dateIssued", "$");
			var x = 3;
		
		}
		
		// -- DATE
		if (action == "date"){
			var strdate="";
			var dateArray = []; // the dateIssued we want is always [?] an array
			var originItem = this[0]["mods"]["originInfo"];
			if (originItem == undefined){
				return "";
			}
			// originInfo may have dateIssued Array
			if (originItem["dateIssued"] !== undefined){
				dateArray = originItem["dateIssued"];
			}
			else { // no immediate dateIssued, so look one level down
				if (originItem[0]["dateIssued"] !== undefined){
					dateArray = originItem[0]; // if not in 0, just give up already
					if ( (dateArray["dateIssued"] !== undefined)){
						strdate = dateArray["dateIssued"];
						if ($.isArray(strdate)){
							strdate = strdate[0]["$"];
							
						}
						
					}
				}
			}
			
			
			
			// first, flatten the array
			var dateArray = $.map(dateArray, function recurs(n) {
				return ($.isArray(n["$"]) ? $.map(n, recurs): n);
			});
			//var result = $.grep(dateArray, function(e){ return e.$ === "$"; });
			if ($.isArray(dateArray)){
				// is the first item an array? If not, it's the date
				if ($.isArray(dateArray[0]) == false){
					// some have "script: " keyword as [0]. Avoid them.
					if ((strdate === "") && (dateArray[0]["script"] == undefined)){
						strdate = dateArray[0];
					}
				}
				else{ // we have to look at the pairs in the Array
					if (dateArray[0]["$"] !== undefined){
						strdate = dateArray[0]["$"];
					}
				}
			// if it's an array of objects, look at them all
			if (typeof dateArray[0]	== 'object'){
				$.each(dateArray, function(i,val){
					if (val["$"]){
						strdate = val["$"];
					}
				})
			}
			// looking for starting and end point dates
			if (dateArray[0]["start"] !== undefined){
				strdate = dateArray[0]["$"] + "-" + dateArray[1]["$"];
			} 
		}
			return strdate;
		}
		
		// -- SUBJECT
		if (action === "subject"){
			var subjarray = new Array();
			var item = this[0]["mods"]["subject"];
			if (item == undefined){
				return [];
			}
			if ($.isArray(item)){
				// first, flatten the array
				item = $.map(item, function recurs(n) {
    				return ($.isArray(n["topic"]) ? $.map(n, recurs): n);
				});
					for (var j=0; j < item.length; j++){
						var datepair = item[j];
						// is there a "topic" keyword?
						if (datepair["topic"] !== undefined){
							subjarray.push(datepair["topic"])
						}
					}
				}
				else { // subjectInfo is not an array
					var topic = item["topic"];
					subjarray.push(topic);
				} // end subject
		
		return subjarray;
		
		}
		
		// --- AUTHOR
		if (action === "author"){
			var item = this[0]["mods"]["name"];
			if (item == undefined){
				return [];
			}
			if ($.isArray(item)){
				var autharray = new Array();
				for (var j=0; j < item.length; j++){
					var authpair = item[j];
					// is there a "name" keyword and is it personal?
					if ((authpair["namePart"] !== undefined) && (authpair["type"] == "personal")){
						// namePart can also be an array. If so, we want the 0 element, which should be the name
						if ($.isArray(authpair["namePart"])){
							autharray.push(authpair["namePart"][0]);
						}
						else { // namePart is not itself an array
							autharray.push(authpair["namePart"]);
						}
					}
				}	
			  }
			else { // name is not an array
				var autharray = new Array();
				var name = item["namePart"];
				autharray.push(name);
			} 
			return autharray;	
		}
		
		
		// --- TITLE
		if (action === "title"){
			var item = this[0]["mods"]["titleInfo"];
			if (item == undefined){
				return [];
			}
			if ($.isArray(item)){
				var titlearray = new Array();
				for (var j=0; j< item.length; j++){
					var titlepair = item[j];
					// is there a "title" keyword?
					if (titlepair["title"] !== undefined){
						titlearray.push(titlepair["title"])
					}
				}
			}
			else { // titleInfo is not an array
				var titlearray = new Array();
				var title = item["title"];
				titlearray.push(title);
			} 
			return titlearray;
		}
		
		// --- HOLLIS ID
		if (action.toUpperCase === "HOLLISID"){
			var item = this[0]["mods"]["recordInfo"]["recordIdentifier"];
			if (item == undefined){
				return "";
			}
			else {
				return item;
			}
		}
	
	

	};
	
}( jQuery ));
