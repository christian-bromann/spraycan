<?php
if (isset($_POST['screenshot']))
{
	$imageData=$_POST['screenshot'];
	$filteredData=substr($imageData, strpos($imageData, ",")+1);
	$unencodedData=base64_decode($filteredData);
	$fp = fopen( 'img/uploads/'.time().'.png', 'w+' );
	
	fwrite( $fp, $unencodedData);
	fclose( $fp );
	header("HTTP/1.1 200 OK");
} else {
	header("HTTP/1.1 404 Not Found");
}
