<?php
error_reporting(E_ALL ^ E_NOTICE);

$loadedImages = preg_split('/,/',$_POST['loaded']);
$ignoredFiles = ['.','..','.DS_Store'];
$newImages    = [];
$geoData      = [];

if (isset($loadedImages) && $handle = opendir('img/uploads')) {
    
    while (false !== ($entry = readdir($handle))) {
        
        if(in_array($entry,$ignoredFiles) || in_array($entry,$loadedImages) || substr($entry,count($entry)-5) === '.txt') {
            continue;
        }

        array_push($geoData, file_get_contents('img/uploads/'.substr($entry,0,count($entry)-5).'.txt'));
        array_push($newImages, $entry);
    }

    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');

    if(count($newImages)) {
        echo '{"images": ["'.join('","',$newImages).'"],';
        echo ' "geoData":["'.join('","',str_replace("\"","'",$geoData)).'"]}';
    } else {
        echo '{}';
    }

    closedir($handle);
} else {
    header("HTTP/1.0 500 Internal Server Error");
}