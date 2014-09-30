var gcont = "GGG";
var gid = "#id2"
function init(){
	var cont = "NO";
	
	  $('.tooltip').tooltipster({
	  	position: "bottom-right",
	  	theme: "my-custom-theme"
	  });
	
	// $('#id1').tooltipster('show', function() {
//         this.tooltipster('content',"CCC"));
//    });
   
	
	
  $('#id1').tooltipster('content', function(){
  		if ($("#id2").is(":visible")){
  		return $(id2).html();
  		}
  		else{
  			return "INVIS";
  		}
  		});
  

}



// 
// //http://www.tutorialspoint.com/jqueryui/jqueryui_tooltip.htm
// function init_old(){
// // $( ".tip" ).tooltip({ content: "Awesome title!" });
// 
//     var a =["A","B"];
// 
//   //  $(function(e) {
// //    		
// //    		if (1 == 1){
// //    			var x  = $(e).attr("x");
// //    			var cont="GOT";
// //    		}
// //    		
// //             $( ".tip" ).tooltip({
// //                content: cont,
// //                track:true
// //             }),
// //             $( "#tooltip-4" ).tooltip({
// //                disabled: true
// //             });
// //          });
// 
// 
// 
// $(document).tooltip({
// 	   var cont = "NO";
//    // if ($(el).attr("x") == "X"){
//    if ( 1 == 1){
//     	var cont = "YES";
//     }
//  //  open: function(e, ui) {
// //     var el = e.toElement/* || e.relatedTarget*/;
// //     
// //  	}
//     items: '.tip',
//     content: "ASDF"
//     //console.log(el.offsetWidth, el.scrollWidth);
//    // if (el.offsetWidth === el.scrollWidth) {
//     //  ui.tooltip.hide();
//    // }
//   
// });
// 
// 
// }