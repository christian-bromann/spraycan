<?php

class Image {
    public function __construct($path) {
        $this->path     = $path;
        $this->geoData = file_get_contents('img/uploads/'.substr($path,0,count($path)-5).'.txt');
    }
}

$loadedImages = preg_split('/,/',$_POST['loaded']);
$ignoredFiles = array('.','..','.DS_Store');
$images       = array();

if (isset($loadedImages) && $handle = opendir('img/uploads')) {

    while (false !== ($entry = readdir($handle))) {
        
        if(in_array($entry,$ignoredFiles) || in_array($entry,$loadedImages) || substr($entry,count($entry)-5) === '.txt') {
            continue;
        }

        $date = substr($entry,0,count($entry)-5);
        $images[$date] = new Image($entry);
    }

    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');

    if(count($images) && asort($images)) {
        echo json_encode($images);
    } else {
        echo '{}';
    }

    closedir($handle);
} else {
    header("HTTP/1.0 500 Internal Server Error");
}
?>