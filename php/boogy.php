<?php
	
ini_set('display_errors','On');
error_reporting(E_ALL);

function debugPrint($s){
	if (1==2){
		error_log($s);
	}
}

$origsearchterm = $_REQUEST['searchterm'];
$searchtype = $_REQUEST['searchtype'];
$degree = $_REQUEST['degree'];

debugPrint("term: $origsearchterm type: $searchtype degree: $degree");

$searchterm = str_replace(" ", "\\ ", $origsearchterm );
$searchterm = urlencode($searchterm);

debugPrint("searchterm after str replace: $searchterm");
// sample:
// http://api.lib.harvard.edu/v2/items.json?subject=peanuts


if ($searchtype == "KEYWORD"){
	$queryurl = "http://api.lib.harvard.edu/v2/items.json?q=" . $searchterm;
	debugPrint("KEYWORD: $queryurl");
}
if ($searchtype == "SUBJECT"){
	$queryurl = "http://api.lib.harvard.edu/v2/items.json?subject=" . $searchterm;
	debugPrint("SUBJECT query: $queryurl");
}

// the WEAK search is a subject search and a keyword search. The two terms
// are combined with ||| separating them.

if ($searchtype == "WEAK"){
	debugPrint("In WEAK query, origsearchterm= . $origsearchterm");
	$terms = explode("|||",$origsearchterm);
	$subjterm = $terms[0];
	$keyterm = $terms[1];
	$keyterm = str_replace(" ", "\\ ", $keyterm );
	$keyterm = urlencode($keyterm);
	$subjterm = str_replace(" ", "\\ ", $subjterm );
	$subjterm = urlencode($subjterm);
	// sample:
	// http://api.lib.harvard.edu/v2/items.json?q=lamarck&subject=evolution
	$queryurl = "http://api.lib.harvard.edu/v2/items.json?q=" . $keyterm . "&subject=" . $subjterm;
	debugPrint("weak query: $queryurl");
}


	$ch = curl_init(); 
	curl_setopt($ch, CURLOPT_URL, $queryurl);
	// Return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	// $output contains the output string 
	$ret = curl_exec($ch); 
	$recorddecoded = json_decode($ret);
	
	
	curl_close($ch);

echo json_encode($recorddecoded);

?>