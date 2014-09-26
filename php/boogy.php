<?php
	
ini_set('display_errors','On');
error_reporting(E_ALL);

function debugPrint($s){
	if (1==1){
		error_log($s);
	}
}

$origsearchterm = $_REQUEST['searchterm'];
$searchtype = $_REQUEST['searchtype'];
$degree = $_REQUEST['degree'];

debugPrint("term: $origsearchterm type: $searchtype degree: $degree");

// replace problematic characters
$s1 = str_replace(array('\\','|', '/', '-','*',',','?','%'), "", $origsearchterm);
// replace the multiple contiguous spaces left (or urlencode gives  multipole +
$s2 = preg_replace('#\s+#', ' ', $s1);
// make it safe for web passage
$searchterm = urlencode($s2);

debugPrint("searchterm after str_replace: $searchterm");
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