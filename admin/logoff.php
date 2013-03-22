<?php

require_once '../../watch/models/database_session_fns.php';

session_name('PHPSESSID');

unset($_SESSION);
session_destroy();

setcookie ('PHPSESSID', NULL, -1, '/');

//send the user to the login screen
//start defining the URL.
$url = 'https://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']);
// Check for a trailing slash.
if ((substr($url, -1) == '/') OR (substr($url, -1) == '\\') ) {
        $url = substr ($url, 0, -1); // Chop off the slash.
}
// Add the page.
$url .= '/index.php';

header("Location: $url");
exit(); // Quit the script.
