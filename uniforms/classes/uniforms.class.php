<?php
/**
* @author Wzhik <design@uni-studio.ru>
*
*
**/

if (!TRUE_IN) { exit; }

// TODO ОБЩИЕ
// * Что делать если нужно отправить письмо пользователю
// * Отправка данных на сервер uniforms
// * Хранение данных клиента в сессии, передавать клиентские данные на сервер при инициализации сессии и определении географии
//

class UniformsClass {

    private $config = array();          // исходные настройки объекта
    private $finalyConfig = array();    // здесь соберется конечная конфигурация для отправки
    private $sourceData = array();      // данные об источнике входа пользователя
    private $request = array();         // полученные от фронтенда данные

    function __construct(array $arrInit) {

        $this->Init($arrInit);

        $this->GetRequest();

        $this->ValidateRequest();

        $this->ChangeAction();
    }


    /**
     * Обрабатывает запросы на отображение формы
     */
    private function ShowForm() {

        if ( empty($this->request['u-name']) ) {
            $this->SendBadRequest();
        }

        $templatePath = $this->config['uniformsRootPath'].'form-templates/' . $this->request['u-name'] . '.php';

        if (!file_exists($templatePath)) {
            $this->SendBadRequest('template not found');
        }

        $request = $this->request;

        ob_start();

        require $templatePath;

        $template = ob_get_clean();

        $this->SendHTML($template);
    }



    /**
     *  Выберет тип действия
     */
    private function ChangeAction() {
        switch ($this->request['u-at']) {
            case 'show':
                $this->ShowForm();
                break;
            case 'send':
                $this->ProcessForm();
                break;
            case 'sendorder':
                $this->ProcessSendOrder();
                break;
            default:
                header("HTTP/1.0 400 Bad Request");
                break;
        }
    }


    /**
     * Загружает конфигурацию из файла uniforms-config.json
     * @param array $arrInit
     */
    private function Init(array $arrInit) {

        $uniformsRootPath = __DIR__.'/../';
        $this->config = json_decode(file_get_contents($uniformsRootPath.'uniforms-config.json'), true);

        // Если файл конфига не загркзился или не валидный
        if ($this->config == null ) {
            $this->SendJSON(json_encode(array(
                'status' => 'error',
                'message' => 'Uniforms: uniforms-config.json corrupt or not exist',
            )));
        }

        $this->config['uniformsRootPath'] = $uniformsRootPath;

        // Загрузим конфигурацию
        if (isset($arrInit['profiles'])) { $this->config['profiles'] = $arrInit['profiles']; }
        if (isset($arrInit['forms'])) { $this->config['forms'] = $arrInit['forms']; }
        if (isset($arrInit['default'])) { $this->config['default'] = $arrInit['default']; }
        if (isset($arrInit['sender'])) { $this->config['sender'] = $arrInit['sender']; }
        if (isset($arrInit['token'])) {$this->config['token'] = $arrInit['token']; }

        // todo БЛОК DEFAULT ДОЛЖЕН БЫТЬ ОБЯЗАТЕЛЬНЫМ НЕОБХОДИМО ПРОВЕРИТЬ ЧТОБЫ БЫЛИ ЗАДАНЫ ДЕФОЛТНАЯ ТЕМА И ПОЛУЧАТЕЛЕИ
        // todo Необходимо проверить все необходимые параметры в блоке sender


        // Если разрешен в конфиге, то подключим определитель источника
        if ($this->config['sourceDetector']) {
            $path = $this->config['uniformsRootPath'].'/classes/uniforms-sourcedetector.php';
            if (file_exists($path)) {
                $this->config['sourceDetectorPath'] = $path;
                $this->config['sourceDetectorStatus'] = true;
                $this->LoadSourceData(); // Получим данные от источника
            }
            else {
                $this->config['sourceDetectorStatus'] = false;
            }
        }
        else {
            $this->config['sourceDetectorStatus'] = false;
        }
    }


    /**
     *  Обработка формы
     *  Подготавливает и проверяет всю необходимую информация для отправки письма
     *
     */
    private function ProcessForm() {

        try {
            $this->ValidateRequest();
        }
        catch (ErrorException $e) {
            $this->SendJSON(json_encode(array('status' => '0', 'message' => $e->getMessage())));
            exit;
        }

        $this->FinalyConfig();

        $this->ServerSend();

        $this->MailSend();
    }


    /**
     * Отправит заявку на сервер uniforms
     */
    private function ServerSend() {
        // Если не задан token то ни чего не отправляем на сервер
        if (!isset($this->config['token'])) { return false; }

        $arRAW = $this->request;
        $arRAW['client-ip-address'] = $_SERVER['REMOTE_ADDR'];
        $arRAW['client-domain'] = $_SERVER['SERVER_NAME'];
        $uniserverData = array(
            'token'     =>  $this->config['token'],
            'pid'       =>  $_POST['u-pid'],
            'phone'     =>  isset($_POST['phone']) ? $_POST['phone'] : '',
            'email'     =>  isset($_POST['email']) ? $_POST['email'] : '',
            'name'      =>  isset($_POST['fio']) ? $_POST['fio'] : '',
            'city'      =>  isset($_POST['u-city']) ? $_POST['u-city'] : '',
            'region'    =>  isset($_POST['u-region']) ? $_POST['u-region'] : '',
            'country'   =>  isset($_POST['u-country']) ? $_POST['u-country'] : '',
            'data'      =>  $arRAW,
        );

        file_get_contents('http://uniforms-server.uni-studio.ru/api/request?' . http_build_query($uniserverData));
    }


    /**
     * Отправит на фронт JSON-объект
     * @param $json
     */
    private function SendJSON($json) {
        header('HTTP/1.0 200');
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: '.date('r',time()-86400));
        header('Content-type: application/javascript; charset=utf-8');
        echo $json;
        exit;

    }


    /**
     * Отправит на фронт HTML
     * @param $html
     */
    private function SendHTML($html) {
        header('HTTP/1.0 200');
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: '.date('r',time()-86400));
        header('Content-type: text/html; charset=utf-8');
        echo $html;
        exit;
    }


    /**
     * Отправит заголовок 400: Bad request
     * @param string $message
     */
    private function SendBadRequest($message = '') {
        if (!empty($message)) {
            header("HTTP/1.0 400 Bad Request. " . $message);
        }
        else {
            header("HTTP/1.0 400 Bad Request");
        }
        exit;
    }


    /**
     *  Попытается подключить класс детектора и получить от него данные
     */
    private function LoadSourceData() {

        // Если не удалось подключить определитель источника то завершаемся
        if (!$this->config['sourceDetectorStatus']) { return; }

        require_once $this->config['sourceDetectorPath'];

        $sourceDetector = new UniSourceDetector();
        $this->sourceData = $sourceDetector->GetAll();

        if (strpos($this->sourceData['sd-source'], 'Переход по рекламе') !== false) {
            $this->sourceData['sd-source-type'] = 'ad';
        }
        if (strpos($this->sourceData['sd-source'], 'Переход из источника') !== false) {
            $this->sourceData['sd-source-type'] = 'referral';
        }
        if (strpos($this->sourceData['sd-source'], 'Переход из поиска') !== false) {
            $this->sourceData['sd-source-type'] = 'organic';
        }
        if (strpos($this->sourceData['sd-source'], 'Переход с сайта') !== false) {
            $this->sourceData['sd-source-type'] = 'referral';
        }
        if (strpos($this->sourceData['sd-source'], 'прямой заход') !== false) {
            $this->sourceData['sd-source-type'] = 'direct';
        }
    }


    /**
     * Отправляет письма
     * @return bool
     * @internal param array $config
     * @internal param $html
     * @internal param $recipients
     */
    private function MailSend() {

        // Сформируем текст письма
        switch ($this->request['u-at']) {
            case 'send':
                $mailHTML = $this->MailSend__GetTemplate('_operator-mail');
                break;
            case 'sendorder':
                $mailHTML = $this->MailSend__GetTemplate('_operator-mail-order');
                break;
            default:
                $this->SendJSON(json_encode(array('status' => 0, 'message' => 'action not select')));
                break;
        }

        if ($this->config['sender']['type'] == 'hosting') {

            $headers  = 'MIME-Version: 1.0' . "\r\n";
            $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";

            // Если пользователь заполнил имя и почту то, добавим путь для ответа, чтобы можно было ответить напрямую пользователю
            if (!empty($this->request['name']) && (!empty($this->request['email']))) {
                $headers .= 'Reply-to: =?utf-8?b?' . base64_encode($this->request['name']). '?= <' .$this->request['email']. ">\r\n";
            }

            $res = (int)mail(implode(',', $this->finalyConfig['form']['recipients']), $this->finalyConfig['form']['subject'], $mailHTML, $headers);

            if ($res) {
                $resultSend = json_encode(array('status' => 1));
            } else {
                $err = error_get_last();
                $resultSend = json_encode(array('status' => 0, 'message' => $err['message']));
            }
        }

        if ($this->config['sender']['type'] == 'phpmailer') {

            $phpmailerPath = $this->config['uniformsRootPath'] . '/classes/PHPMailerAutoload.php';
            if (!file_exists($phpmailerPath)) {
                $this->SendBadRequest('PHPMailer not found');
            }

            require $phpmailerPath;

            $mailer = new PHPMailer;
            $mailer->isSMTP();
            $mailer->CharSet = 'UTF-8';
            $mailer->Host = $this->config['sender']['smtp'];
            $mailer->SMTPAuth = true;
            $mailer->setFrom($this->config['sender']['senderEmail'], $this->config['sender']['senderName']);
            $mailer->Username = $this->config['sender']['login'];
            $mailer->Password = $this->config['sender']['pass'];
            $mailer->SMTPSecure = 'ssl';
            $mailer->Port = 465;


            foreach ($this->finalyConfig['form']['recipients'] as $item) {
                $mailer->addAddress($item);     // Add a recipient
            }

            // Если пользователь заполнил имя и почту то, добавим путь для ответа, чтобы можно было ответить напрямую пользователю
            if (!empty($this->request['name']) && (!empty($this->request['email']))) {
                $mailer->addReplyTo($this->request['email'], $this->request['name']);
            }
            $mailer->isHTML(true);

            $mailer->Subject = $this->finalyConfig['form']['subject'];
            $mailer->Body = $mailHTML;


            if ((int)$mailer->send()) {
                $resultSend = json_encode(array('status' => '1'));
            } else {

                $resultSend = json_encode(array('status' => '0', 'message' => $mailer->ErrorInfo));
            }
        }

        // Не отправляем письма
        if ($this->config['sender']['type'] == 'none') {
            $resultSend = json_encode(array('status' => '1'));
        }

        $this->SendJSON($resultSend);
    }

    /**
     * Вернет строку с заполненым данными $templateData шаблоном html из файла с именем $template
     * @param $template
     * @return string
     */
    private function MailSend__GetTemplate($template) {

        // Сливаем массивы
        $data = $this->request + $this->sourceData;
        $data['u-description'] = $this->finalyConfig['form']['description'];



        // Готовим шаблон письма
        ob_start();

        $templatePath = $this->config['uniformsRootPath'].'email-templates/'.$template.'.php';
        if (!file_exists($templatePath)) {
            $this->SendBadRequest('Template email not found');
        }

        require $templatePath;

        $template = ob_get_contents();

        ob_end_clean();

        return $template;

    }

    /**
     * Проверит валидность переданных данных
     */
    private function ValidateRequest() {

        if (($this->config['domain'] != $_SERVER['HTTP_HOST'])&&('www.'.$this->config['domain'] != $_SERVER['HTTP_HOST'])) {
            $this->SendBadRequest('unknown domain');
        }

        if ($this->request['u-at'] == 'send') {
            // todo проверить email
            // todo проверить телефон

            if (empty($this->request['email']) && empty($this->request['phone']) && empty($this->request['contact'])) {
                $this->SendBadRequest('empty contact data');
            }
        }

        if ($this->request['u-at'] == 'sendorder') {

            if (empty($this->request['u-data']['buyer']['phone']) && empty($this->request['u-data']['buyer']['email'])) {
                $this->SendBadRequest('empty contact data');
            }
        }
    }

    /**
     * Загрузит входные данные
     */
    private function GetRequest() {
        $this->request = $_POST;
        if (isset($this->request['u-data'])) {
            $this->request['u-data'] = json_decode($this->request['u-data'], true);

        }
    }

    /**
     * Сформирует конечный конфиг для отправки
     */
    private function FinalyConfig() {
        // Заказ из корзины
        if ($this->request['u-at'] == 'sendorder') {
            $this->finalyConfig['form']['subject'] = "[{$this->config['domain']}] " . $this->config['profiles']['cart']['mailSubject'];
            $this->finalyConfig['form']['recipients'] = $this->config['profiles']['cart']['recipients'];
        }

        else {


            // ПОИСК ПОЛУЧАТЕЛЕЙ
            if (isset($this->config['forms']) && ( !empty($this->request['u-name']) && count($this->config['forms'][$this->request['u-name']]) ) ) {

                // ПОИСК ПОЛУЧАТЕЛЕЙ
                // если есть в секции именной формы есть настройка получателей
                if (!empty($this->config['forms'][$this->request['u-name']]['recipients'])) {
                    $this->finalyConfig['form']['recipients'] = $this->config['forms'][$this->request['u-name']]['recipients'];
                } // если в именной секции нет получателей
                else {
                    // ищем получателей по номеру профиля
                    if (is_numeric($this->request['u-pid']) && count($this->config['profiles'][$this->request['u-pid']]['recipients'])) {
                        $this->finalyConfig['form']['recipients'] = $this->config['profiles'][$this->request['u-pid']]['recipients'];
                    } // берем получателей из дефолтной секции
                    else {
                        $this->finalyConfig['form']['recipients'] = $this->config['default']['recipients'];
                    }
                }
            } else {
                if (is_numeric($this->request['u-pid']) && count($this->config['profiles'][$this->request['u-pid']]['recipients'])) {
                    $this->finalyConfig['form']['recipients'] = $this->config['profiles'][$this->request['u-pid']]['recipients'];
                } else {
                    $this->finalyConfig['form']['recipients'] = $this->config['default']['recipients'];
                }
            }


            // ПОИСК ТЕМЫ
            // Если форма не передала тему сообщения
            if (!isset($this->request['u-subject'])) {
                // Если в именной секции есть настройка темы
                if (isset($this->request['u-name']) && !empty($this->config['forms'][$this->request['u-name']]['mailSubject'])) {
                    $this->finalyConfig['form']['subject'] = $this->config['forms'][$this->request['u-name']]['mailSubject'];
                } else {
                    if (is_numeric($this->request['u-pid']) && !empty($this->config['profiles'][$this->request['u-pid']]['mailSubject'])) {
                        $this->finalyConfig['form']['subject'] = $this->config['profiles'][$this->request['u-pid']]['mailSubject'];
                    } else {
                        $this->finalyConfig['form']['subject'] = $this->config['default']['mailSubject'];
                    }
                }
            } else {
                $this->finalyConfig['form']['subject'] = $this->request['u-subject'];
            }
            // Добавим префикс к теме
            $this->finalyConfig['form']['subject'] = "[{$this->config['domain']}] " . $this->finalyConfig['form']['subject'];

            // ПОИСК ОПИСАНИЯ
            // Если форма не передала описание
            if (!isset($this->request['u-description'])) {
                // Если в именной секции есть настройка описания
                if (isset($this->request['u-name']) && !empty($this->config['forms'][$this->request['u-name']]['mailDescription'])) {
                    $this->finalyConfig['form']['description'] = $this->config['forms'][$this->request['u-name']]['mailDescription'];
                } else {
                    if (is_numeric($this->request['u-pid']) && !empty($this->config['profiles'][$this->request['u-pid']]['mailDescription'])) {
                        $this->finalyConfig['form']['description'] = $this->config['profiles'][$this->request['u-pid']]['mailDescription'];
                    } else {
                        if (!empty($this->config['default']['mailDescription'])) {
                            $this->finalyConfig['form']['description'] = $this->config['default']['mailDescription'];
                        } else {
                            $this->finalyConfig['form']['description'] = '';
                        }
                    }
                }
            } else {
                $this->finalyConfig['form']['description'] = $this->request['u-description'];
            }

        }
    }

    /**
     * Обработает заказ из корзины
     */
    private function ProcessSendOrder() {
        try {
            $this->ValidateRequest();
        }
        catch (ErrorException $e) {
            $this->SendJSON(json_encode(array('status' => '0', 'message' => $e->getMessage())));
        }

        $this->FinalyConfig();

        $this->MailSend();
    }
}