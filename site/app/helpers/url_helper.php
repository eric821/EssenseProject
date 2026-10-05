<?php
/**
 * Created by PhpStorm.
 * User: mike.richardson
 * Date: 11/20/2018
 * Time: 1:58 PM
 */

    //simple page redirect

    function redirect($page)
    {
        header('location: ' . URLROOT . '/' . $page );
    }