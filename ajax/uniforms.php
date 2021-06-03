<?php

define('TRUE_IN', true);

session_start();

require getenv('DOCUMENT_ROOT').'/uniforms/classes/uniforms.class.php';

$uniforms = new UniformsClass(array(
    'token' => '',      // токен текущего сайта, получаем на сервере uniforms
    'default' => array(
        'recipients'        => array('noreply@uni-studio.ru'),
        'mailSubject'       => 'Дефолтная тема письма',
        'mailDescription'   => 'Дефолтное описание',
    ),
    'sender' => array(
        'type'          => 'hosting', // hosting | phpmailer | none - способ отправки писем,  средствами хостинга, через phpmailer, не отправлять
        // настройки при отправке через phpmailer        
        //'smtp'          => 'smtp.yandex.ru',
        //'login'         => 'webmaster-usoft@yandex.ru',
        //'pass'          => 'rnvvwxuxrpxvzpmg',
        //'senderEmail'   => 'webmaster-usoft@yandex.ru',
        //'senderName'    => 'konsultantplus.com',
    ),
    'profiles' => array(
        1 => array(
            'recipients' => array('noreply@uni-studio.ru'),
            'mailSubject'       => 'Тестовая заявка',
            'mailDescription'   => 'Тестовое описание',
        ),
        'cart' => array(
            'recipients' => array('noreply@uni-studio.ru'),
            'mailSubject' => 'Заказ товаров'
        )
    )
));
