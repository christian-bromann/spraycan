<?php

class Image {
    public function __construct($directory, $path) {
        $this->path    = $path;
        $this->geoData = file_get_contents($directory.substr($path,0,count($path)-5).'.txt');
    }
}

$loadedImages = isset($_POST['loaded']) ? preg_split('/,/',$_POST['loaded']) : [];
$ignoredFiles = array('.','..','.DS_Store');
$images       = array();
$hotspot      = isset($_POST['hotspot']) ? $_POST['hotspot'] : 'vs';
$directory    = $hotspot ? 'img/uploads/'.$hotspot.'/' : 'img/uploads/';

if(!is_dir($directory)) {
    echo '';
} else if (isset($loadedImages) && $handle = opendir($directory)) {

    while (false !== ($entry = readdir($handle))) {
        
        if(in_array($entry,$ignoredFiles) || in_array($entry,$loadedImages) || substr($entry,count($entry)-5) === '.txt' || strpos($entry,'.') === false) {
            continue;
        }

        $date = substr($entry,0,count($entry)-5);
        $images[$date] = new Image($directory, $entry);
    }

    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');

    if(count($images) && asort($images)) {
        echo json_encode($images);
    } else {
        echo '';
    }

    closedir($handle);
} else {
    echo '';
}
?>