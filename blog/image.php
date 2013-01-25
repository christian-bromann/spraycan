<?php
if (isset($GLOBALS["HTTP_RAW_POST_DATA"]))
{
	$imageData=$GLOBALS['HTTP_RAW_POST_DATA'];
	$filteredData=substr($imageData, strpos($imageData, ",")+1);
	$unencodedData=base64_decode($filteredData);
	$fp = fopen( 'img/uploads/'.time().'.png', 'w+' );
	
	fwrite( $fp, $unencodedData);
	fclose( $fp );
}