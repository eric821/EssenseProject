<?php

    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');

    //Load Config
    require_once 'config/config.php';

    //Load Helpers
    require_once 'helpers/url_helper.php';
    require_once 'helpers/session_helper.php';
    require_once 'libraries/hp_library/HTMLPurifier.auto.php';

    //Autoload core libraries
    spl_autoload_register(function ($className)
    {
        require_once 'libraries/' . $className . '.php';
    });