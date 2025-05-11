<?php
header('Content-Type: application/json');
$historyFile = 'history.json';

if (file_exists($historyFile)) {
    echo file_get_contents($historyFile);
} else {
    echo json_encode([]);
}
?>
