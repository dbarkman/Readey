<?php

//get the session
session_name('PHPSESSID');

//imports
require_once '../../ReadeyFramework/includes/includes.php';

if (isset($_SESSION['created'])) {
    $sessionCreated = $_SESSION['created'];
    $username = $_SESSION['username'];
} else {
    $sessionCreated = 0;
	$username = null;
}

$functions = new Functions();
$functions->checkSession($sessionCreated);
$functions->checkUniqueRand($username);

echo 'logged in...';