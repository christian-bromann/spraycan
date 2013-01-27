<?php
var_export($_POST);
if (isset($_POST['screenshot']) && isset($_POST['geodata']))
{
    $timestamp     = time();
    $imageData     = $_POST['screenshot'];
    $filteredData  = substr($imageData, strpos($imageData, ",")+1);
    $unencodedData = base64_decode($filteredData);
    
    $fpPNG = fopen( 'img/uploads/'.$timestamp.'.png', 'w+' );
    fwrite( $fpPNG, $unencodedData);

    $fpTXT = fopen( 'img/uploads/'.$timestamp.'.txt', 'w+' );
    fwrite( $fpTXT, $_POST['geodata']);   

    fclose( $fpPNG );
    fclose( $fpTXT );

    header("HTTP/1.1 200 OK");
} else {
    header("HTTP/1.1 404 Not Found");
}
