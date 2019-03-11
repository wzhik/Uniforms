<?php

define('TRUE_IN', true);

session_start();

require getenv('DOCUMENT_ROOT').'/uniforms/classes/uniforms.class.php';

$uniforms = new UniformsClass(array(
    'token' => '****************************',
    'default' => array(
        'recipients'        => array('design@uni-studio.ru'),
        'mailSubject'       => 'Дефолтная тема письма',
        'mailDescription'   => 'Дефолтное описание',
    ),
    'sender' => array(
        'type' => 'hosting',
    ),
    'profiles' => array(
        1 => array(
            'recipients' => array('design@uni-studio.ru'),
            'mailSubject'       => 'Тестовая заявка',
            'mailDescription'   => 'Тестовое описание',
        ),
    ),
));
