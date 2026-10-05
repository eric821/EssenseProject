<?php

    //DB Params
    define('DB_HOST', getenv("DB_HOST"));
    define('DB_USER', getenv("DB_USERNAME"));
    define('DB_PASS', getenv("DB_PASSWORD"));
    define('DB_NAME', getenv("DB_DATABASE"));

    //App Root
    define('APPROOT',dirname(dirname(__FILE__)));

    //URL Root
    define('URLROOT', 'http://localhost:8080/');

    //Site Name
    define('SITENAME', 'Essense Project');

    //App Version
    define('APPVERSION', '1.0.0');

    //Models Dir
    const MODELS = APPROOT . "/models/";
    

