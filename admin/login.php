<?php

if ($_SERVER["SERVER_PORT"] != 443) {
    header ('Location: http://google.com');
}

//imports
require_once '../../watch/models/ValidateForms.php';
require_once '../../watch/models/MySQLTools.php';
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    //just display a blank form
    display_form();
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $errors = validate_form();
    if (count($errors)) {
        //redisplay the form
        display_form();
    } else {
        $validate = new ValidateForms();
        $username = $validate->sanitizeUsername($_POST['username']);
        $password = $validate->sanitizePassword($_POST['password']);
        //LOGIN HERE
        $user = new MySQLTools();
        //set the user object username
        $user->setUsername($username);
        //set the user object password
        $user->setPassword($password);
        //attempt to log the user on
//        $user->userAdd();
        $user->userAuth();
        if ($user->isLoggedIn == 1) {
            //if the login was successful
            //create the seesion
            $user->createSession();
            // Redirect the user to the loggedin.php page.
            // Start defining the URL.
            $url = 'https://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']);
            // Check for a trailing slash.
            if ((substr($url, -1) == '/') OR (substr($url, -1) == '\\') ) {
                    $url = substr ($url, 0, -1); // Chop off the slash.
            }
            // Add the page.
            $url .= '/index.php';

            header("Location: $url");
            exit(); // Quit the script.
        } else {
            //try again
            display_form();
        }
    }
} else {
    //bug off
    header('Location: http://google.com');
}

function display_form()
{
    ?>
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
    <html>
    <head>
        <title>watch</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="css/login.css" media="screen">
    </head>

    <body onLoad="login.username.focus()">

    <div id="box">
        <form name="login" action="login.php" method="POST">
            <p>
                <input type="text" name="username" size="30" autocomplete="off" /><br />
                <input type="password" name="password" size="30" autocomplete="off" /><br />
                <input type="submit" name="submit" value="watch" />
            </p>
        </form>
    </div>

    </body>
    </html>
    <?php
}

function validate_form()
{
    $errors = array();
    $validate = new ValidateForms();
    
    //validate username
    if (isset($_POST['username'])) {
        $returnErrors = $validate->validateUsername($validate->sanitizeUsername($_POST['username']));
        if (count($returnErrors)) {
            $errors['username'] = $returnErrors[0];
        }
    }

    //validate password
    if (isset($_POST['password'])) {
		$sanitized = $validate->sanitizePassword($_POST['password']);
        $returnErrors = $validate->validatePassword($sanitized);
        if (count($returnErrors)) {
            $errors['password'] = $returnErrors[0];
        }
    }

    return $errors;
}
