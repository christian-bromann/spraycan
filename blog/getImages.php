<?php
$hotspot      = isset($_POST['hotspot']) ? $_POST['hotspot'] : '';
$directory    = $hotspot ? 'img/uploads/'.$hotspot.'/' : 'img/uploads/';

class Image {
    public function __construct($directory, $id) {
        $this->id      = $id;
        $this->path    = $directory.substr($id,0,count($id)-5);
        $this->geoData = file_get_contents($this->path.'.txt');
    }
}

function readDirSync($directory,$img) {

    $loadedImages = isset($_POST['loaded']) ? preg_split('/,/',$_POST['loaded']) : [];
    $ignoredFiles = array('.','..','.DS_Store');
    $images       = $img ? $img : array();

    if($handle = opendir($directory)) {

        while (false !== ($entry = readdir($handle))) {

            if(strpos($entry,'.') === false) {
                $images = readDirSync($directory.$entry.'/', $images);
                continue;
            } else if(in_array($entry,$ignoredFiles) || in_array($entry,$loadedImages) || substr($entry,count($entry)-5) === '.txt') {
                continue;
            }

            $date = substr($entry,0,count($entry)-5);
            $images[$date] = new Image($directory, $entry);
        }

    }

    return $images;
    closedir($handle);
}

if(is_dir($directory)) {

    $images = readDirSync($directory,null);

    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');

    if(count($images) && asort($images)) {
        echo json_encode($images);
    } else {
        echo '{}';
    }


}