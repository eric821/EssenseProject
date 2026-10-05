<?php
/**
 * Created by PhpStorm.
 * User: mike.richardson
 * Date: 11/20/2018
 * Time: 2:05 PM
 */
    session_start();

    //Flash Messages
    // EXAMPLE - flash('register_succses', 'You are now registered!');
    function flash($name = '', $message = '', $class = 'alert alert-success')
    {
        if(!empty($name))
        {
            if(!empty($message) && empty($_SESSION[$name]))
            {
                if(!empty($_SESSION[$name]))
                {
                    unset($_SESSION[$name]);
                }

                if(!empty($_SESSION[$name. '_class']))
                {
                    unset($_SESSION[$name. '_class']);
                }

                $_SESSION[$name] = $message;
                $_SESSION[$name. '_class'] = $class;
            }
            elseif(empty($message) && !empty($_SESSION[$name]))
            {
                $class = !empty($_SESSION[$name. '_class']) ? $_SESSION[$name. '_class'] : '';
                echo '<div class= "'.$class.'" id="msg-flash">'.$_SESSION[$name].'</div>';
                unset($_SESSION[$name]);
                unset($_SESSION[$name. '_class']);
            }
        }
    }