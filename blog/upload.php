<?php

header('Access-Control-Allow-Origin: *');

if (isset($_POST['screenshot']) && isset($_POST['geodata']))
{
    $timestamp     = time();
    $imageData     = $_POST['screenshot'];
    $filteredData  = substr($imageData, strpos($imageData, ",")+1);
    $unencodedData = base64_decode($filteredData);
    
    $fpPNG = fopen( dirname(__FILE__).'/img/uploads/'.$timestamp.'.png', 'w+' );
    fwrite( $fpPNG, $unencodedData);

    $fpTXT = fopen( dirname(__FILE__).'/img/uploads/'.$timestamp.'.txt', 'w+' );
    fwrite( $fpTXT, $_POST['geodata']);   

    fclose( $fpPNG );
    fclose( $fpTXT );

    header("HTTP/1.1 200 OK");
    echo "{}";
} else {
    header("HTTP/1.1 404 Not Found");
}
