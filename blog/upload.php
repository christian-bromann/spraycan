<?php

header('Access-Control-Allow-Origin: *');

if (isset($_POST['screenshot']) && isset($_POST['geodata']))
{
    $timestamp     = time();
    $imageData     = $_POST['screenshot'];
    $hotspot       = $_POST['hotspot'];
    $filteredData  = substr($imageData, strpos($imageData, ",")+1);
    $unencodedData = base64_decode($filteredData);
    $uploadDir     = $hotspot ? dirname(__FILE__).'/img/uploads/'.$hotspot : dirname(__FILE__).'/img/uploads';
    
    if (!file_exists($uploadDir) and !is_dir($uploadDir)) {
        mkdir($uploadDir);
    }

    $fpPNG = fopen( $uploadDir.'/'.$timestamp.'.png', 'w+' );
    fwrite( $fpPNG, $unencodedData);

    $fpTXT = fopen( $uploadDir.'/'.$timestamp.'.txt', 'w+' );
    fwrite( $fpTXT, $_POST['geodata']);   

    fclose( $fpPNG );
    fclose( $fpTXT );

    header("HTTP/1.1 200 OK");
    echo "{}";
} else {
    header("HTTP/1.1 404 Not Found");
}
