<?php
/**
 * @author Wzhik <design@uni-studio.ru>
 * @link https://github.com/wzhik/Uniforms On Github
 * @package Uniforms/UniSourceDetector
 */

class UniSourceDetector {

    const NAME_IN_STORAGE = 'unisourcedetector';
    const DEBUG = true;             // Режим отладки
    private $pathDebugLog;          // путь к журналу отладки (сейчас задается в конструкторе)
    private $timeoutCookie = 900;   // Срок жизни печеньки


    private $dataLoaded = false;

    // Исходные данные
    private $rawRef;
    private $rawQuery;
    private $rawURL;
    private $userIP;

    // Обработанные данные
    private $arrQuery = array();
    private $arrRef = array();
    private $sessionId;
    private $searchEngine;
    private $timeEnter;
    private $source;
    private $keywords;
    private $utm = array();

    // Массивы хостов поисковых систем
    private $yandexHosts        = array('yandex.ru','www.yandex.ru','yabs.yandex.ru');                                  // возможные хосты поисковика яндекса
    private $liveinternetHosts  = array('www.liveinternet.ru', 'liveinternet.ru',);
    private $sputnikHosts       = array('www.sputnik.ru', 'sputnik.ru',);
    private $mailHosts          = array('go.mail.ru','mail.ru','www.mail.ru',);
    private $bingHosts          = array('www.bing.com','bing.com',);
    private $ramblerHosts       = array('nova.rambler.ru','rambler.ru','www.rambler.ru',);
    private $googleHosts        = array('www.google.ru','google.ru','www.google.com','google.com',);
    private $yahooHosts         = array('search.yahoo.com','yahoo.com','r.search.yahoo.com');

    function __construct() {
        $this->pathDebugLog = getenv("DOCUMENT_ROOT");
        // Если нет cookie инициализируем данные
        if (!array_key_exists(self::NAME_IN_STORAGE, $_COOKIE)) {
            $this->GetSourceData();
            $this->ProcSourceData();
        }
        else {
            if (!$this->dataLoaded) {
                $this->LoadFromCookie();
            }
        }
        return $this;
    }


    //
    // Публичные методы
    //

    // Вернет массив данных о входе
    public function GetAll() {
        return array(           
            'sd-sessionID'     => $this->sessionId,
            'sd-searchEngine'  => $this->searchEngine,
            'sd-timeEnter'     => $this->timeEnter,
            'sd-source'        => $this->source,
            'sd-keywords'      => $this->keywords,
            'sd-IPAddress'     => $this->userIP,
            'sd-utm'           => $this->utm,
            'sd-fullQuery'     => $this->arrQuery,
        );
    }

    // Вернет строку определенного источника входа
    public function GetSource() {
        return $this->source;
    }

    // вернет ключевые слова
    public function GetKeywords() {
        return $this->keywords;
    }

    //
    // Основные методы
    //
    // Получает исходные данные
    private function GetSourceData() {
        $this->rawRef = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
        $this->rawQuery = $_SERVER['QUERY_STRING'];
        if ($_SERVER['HTTPS']) {
            $this->rawURL = "https://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
        }
        else {
            $this->rawURL = "http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
        }
        $this->userIP = $_SERVER['REMOTE_ADDR'];
        $this->sessionId = md5(uniqid(rand(), true));
        $this->timeEnter = date('d.m.Y H:i:s');
    }

    // Обрабатывает исходные данные
    private function ProcSourceData() {

        // Разбираем реферальную строку
        $tmp = parse_url($this->rawRef);
        $this->arrRef['host'] = isset($tmp['host']) ? $tmp['host'] : '';
        $this->arrRef['path'] = isset($tmp['path']) ? $tmp['path'] : '';
        $this->arrRef['query'] = isset($tmp['query']) ? $this->StringQueryToArray($tmp['query']) : array();

        // Разбираем строку запроса
        $tmp = parse_url($this->rawURL);
        $this->arrQuery['host'] = $tmp['host'];
        $this->arrQuery['path'] = $tmp['path'];
        $this->arrQuery['query'] = isset($tmp['query']) ? $this->StringQueryToArray($tmp['query']) : array();

        // Получим UTM
        $this->GetUTM();

        // Определяем поисковую систему
        $this->DetectSearchEngine();

        // Определяем источник входа
        $this->DetectSource();

        // Сохраняем в cookie
        $this->SaveInCookie();

        // Запишем в лог
        $this->SaveInLog();
    }



    //
    // Вспомогательные методы
    //

    // Строку запроа преобразует в ассоциативный массив
    private function StringQueryToArray($str) {
        $out = array();

        if (strlen($str) > 0) {

            $pairs = explode('&', urldecode(urldecode($str)));
            foreach ($pairs as $pair) {
                list($key, $val) = explode('=', $pair);
                $out[$key] = $val;
            }
        }

        return $out;
    }

    // Определяем поисковую систему
    private function DetectSearchEngine() {

        $flgExec = false;

        $refHost = $this->arrRef['host'];

        if (in_array($refHost, $this->yandexHosts)) {
            $flgExec = true;
            $this->searchEngine = 'yandex.ru';
        }
        if (!$flgExec && in_array($refHost, $this->bingHosts)) {
            $flgExec = true;
            $this->searchEngine = 'bing.com';
        }
        if (!$flgExec && in_array($refHost, $this->liveinternetHosts)) {
            $flgExec = true;
            $this->searchEngine = 'liveinternet.ru';
        }
        if (!$flgExec && in_array($refHost, $this->sputnikHosts)) {
            $flgExec = true;
            $this->searchEngine = 'sputnik.ru';
        }
        if (!$flgExec && in_array($refHost, $this->mailHosts)) {
            $flgExec = true;
            $this->searchEngine = 'mail.ru';
        }
        if (!$flgExec && in_array($refHost, $this->ramblerHosts)) {
            $flgExec = true;
            $this->searchEngine = 'rambler.ru';
        }
        if (!$flgExec && in_array($refHost, $this->googleHosts)) {
            $flgExec = true;
            $this->searchEngine = 'google.com';
        }
        if (!$flgExec && in_array($refHost, $this->yahooHosts)) {
            $flgExec = true;
            $this->searchEngine = 'yahoo.com';
        }

        if (!$flgExec) {
            $this->searchEngine = '';
            return false;
        }
        return true;
    }

    // Определение источника входа
    private function DetectSource() {

        $flgExec = false;

        if (array_key_exists('yclid', $this->arrQuery['query'])) {
            $this->source = 'Переход по рекламе Yandex';
            // попытаемся взять из реферальной ссылки
            if (!empty($this->arrRef['query']['q'])) {
                $this->keywords = $this->arrRef['query']['q'];
            }
            // или из utm метки
            elseif (!empty($this->arrQuery['query']['utm_term'])) {
                $this->keywords = $this->arrQuery['query']['utm_term'];
            }
            $flgExec = true;
        }

        // Если есть utm метки
        if (!$flgExec && isset($this->arrQuery['query']['utm_source']) && !empty($this->arrQuery['query']['utm_source'])) {
            switch ($this->arrQuery['query']['utm_source']) {
                case 'google':
                    $this->source = 'Переход по рекламе Google';
                    $this->keywords = $this->arrQuery['query']['utm_term'];
                    break;
                case 'yandex':
                    $this->source = 'Переход по рекламе Yandex';
                    $this->keywords = $this->arrQuery['query']['utm_term'];
                    break;
                default:
                    $this->source = 'Переход из источника ' . $this->arrQuery['query']['utm_source'];
                    $this->keywords = $this->arrQuery['query']['utm_term'];
                    break;
            }
            $flgExec = true;
        }

        // Прямой заход
        if (!$flgExec && empty($this->rawRef)) {
            $this->source = 'прямой заход';
            $flgExec = true;
        }

        // Если запрос с поисковика
        if (!$flgExec && !empty($this->searchEngine)) {
            $flgExec = true;

            switch ($this->searchEngine) {
                case 'yandex.ru':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    $this->keywords = $this->arrRef['query']['text'];
                    break;
                case 'liveinternet.ru':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    $this->keywords = $this->arrRef['query']['q'];
                    break;
                case 'sputnik.ru':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    $this->keywords = $this->arrRef['query']['q'];
                    break;
                case 'mail.ru':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    $this->keywords = $this->arrRef['query']['q'];
                    break;
                case 'rambler.ru':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    $this->keywords = $this->arrRef['query']['query'];
                    break;
                case 'google.com':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    break;
                case 'yahoo.com':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    break;
                case 'bing.com':
                    $this->source = 'Переход из поиска ' . $this->searchEngine;
                    $this->keywords = $this->arrRef['query']['q'];
                    break;
            }
        }

        // Если переход с сайта
        if (!$flgExec && (count($this->arrRef) > 0)) {
            $this->source = 'Переход с сайта ' . $this->arrRef['host'] . $this->arrRef['path'];
        }
    }

    // Сохранение в cookie
    private function SaveInCookie() {
        setcookie(self::NAME_IN_STORAGE, serialize(array(
            'arrQuery'      => $this->arrQuery,
            'arrRef'        => $this->arrRef,
            'sessionId'     => $this->sessionId,
            'searchEngine'  => $this->searchEngine,
            'timeEnter'     => $this->timeEnter,
            'source'        => $this->source,
            'keywords'      => $this->keywords,
            'arrUTM'        => $this->utm,
            'userIP'        => $this->userIP,
        )), time() + $this->timeoutCookie, '/');
    }

    // Загружаем из cookie
    private function LoadFromCookie() {
        $arr = unserialize($_COOKIE[self::NAME_IN_STORAGE]);
        $this->arrQuery = $arr['arrQuery'];
        $this->arrRef = $arr['arrRef'];
        $this->sessionId = $arr['sessionId'];
        $this->searchEngine = $arr['searchEngine'];
        $this->timeEnter = $arr['timeEnter'];
        $this->source = $arr['source'];
        $this->keywords = $arr['keywords'];
        $this->utm = $arr['arrUTM'];
        $this->userIP = $arr['userIP'];
    }

    // Сохраняет лог отладочной информации если разрешено в настройках класса
    private function SaveInLog() {
        if (self::DEBUG) {
            $str  = 'Дата местная: '        .$this->timeEnter . "\n";
            $str .= 'Реферальная ссылка: '  .$this->rawRef . "\n";
            $str .= 'Строка запроса: '      .$this->rawURL . "\n";
            $str .= 'Поисковая система: '   .$this->searchEngine. "\n";
            $str .= 'Источник входа: '      .$this->source. "\n";
            $str .= 'Session ID: '          .$this->sessionId . "\n";
            $str .= 'IP адрес: '            .$this->userIP . "\n";
            $str .= 'Ключевые слова: '      .$this->keywords. "\n";
            $str .= 'arrQuery: '            .serialize($this->arrQuery)."\n";
            $str .= 'arrRef: '              .serialize($this->arrRef)."\n";

            $str .= "\n\n";

            $filePath = $this->pathDebugLog . '/unisourcedetector.log';
            file_put_contents($filePath, $str, FILE_APPEND);
        }
    }

    // Выберем UTM метки в отдельный массив
    private function GetUTM() {
        foreach($this->arrQuery['query'] as $name => $value) {
            if (strpos($name, 'utm_') === false) { continue; }
            $this->utm[$name] = $value;
        }
    }
}

