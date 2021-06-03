function NoEmpty(string) {
    var out = true;
    if ((string === null)||(string === '')||(typeof(string) === "undefined")) {
        out = false;
    }
    return out;
}

// Класс обрабатывающий функционал форм
function UniformsClass() {

    var uniformsThis = this;
    this.body = jQuery('body');

    // Объект содержащий конфиг всей системы
    this.config = {
        debugMode: false,
        cartMode: false
    };

    // Объект с данными о текущей странице
    this.page = {};

    // Объект формы
    this.form = {};
    this.form.data = {};

    // Этот объект храним в localStorage, периодически обновляем
    this.userData = {};

    // Этот объект содержит переводы
    this.lang = {};


    /*
     Пишет в консоль сообщения если включен режим отладки. Если режим отладки выключен сообщения не выводятся
     lvl     - уровень сообщения log | warn | err
     message - сообщение
     */
    this.__Log = function (lvl, message) {
        if (this.config.debugMode) {
            switch (lvl) {
                case 'log':
                    console.log('Uniforms: ' + message);
                    break;
                case 'warn':
                    console.warn('Uniforms: ' + message);
                    break;
                case 'err':
                    console.error('Uniforms: ' + message);
                    break;
            }
        }
    };

    // Загружает корзину из хранилища и преобразовывает в массив
    this.__LoadObject = function() {
        return JSON.parse(sessionStorage.getItem('uniforms'));
    };

    // Сохраняет объект корзины в хранилище
    this.__SaveObject = function (object) {
        var json = JSON.stringify(object);
        sessionStorage.setItem('uniforms', json);
    };

    // Инициализирует систему при старте
    this.__Init = function () {

        // Повесим обработчики системных событий
        try {
            uniformsThis.body.on('uniforms-userdata-loaded', uniformsThis.__InitLang);
            uniformsThis.body.on('uniforms-config-loaded', uniformsThis.__InitUserData);
        }
        catch (e) {
            console.warn('Uniforms: ' + e + '\n\rUniforms disabled');
        }


        try {
            // Загрузим конфиг с сервера и инициализируемся
            jQuery.getJSON('/uniforms/uniforms-config.json', function (data) {

                // todo Проверить пришли ли данные
                uniformsThis.config = data;
                uniformsThis.__Log('log', 'Файл конфига загружен');
                uniformsThis.body.trigger('uniforms-config-loaded');
            });
        }
        catch (e) {
            console.warn('Uniforms: ' + e + '\n\rНе удалось загрузить файл конфига, используем параметры по умолчанию');
        }


        // Повесим обработчики кнопок и событий отправки
        try {
            uniformsThis.body.on('click', '.uniforms.show',  uniformsThis.__Click);
            uniformsThis.body.on('submit', '.uniforms,.uniforms--popup', uniformsThis.__Click);
            uniformsThis.body.on('click', '.uniforms--popup__closer', uniformsThis.__FormClose);
            uniformsThis.body.on('click', '.uniforms--popup__body-fog', uniformsThis.__FormClose);
        }
        catch (e) {
            console.warn('Uniforms: ' + e + '\n\rUniforms disabled');
        }

        uniformsThis.__InitPageData();

        this.__Log('log', 'Uniforms initialized');

    };

    // Инициализирует данные о странице
    this.__InitPageData = function () {

        this.page.pageUrl = window.location.href;
        this.page.pageTitle =  jQuery('title').html();
    };

    // Либо загружает данные из localStorage, либо получает их заново
    this.__InitUserData = function () {
        var object = uniformsThis.__LoadObject();

        if (!NoEmpty(object)) { object = {}; }

        var currTimeStamp = new Date().getTime();

        if (NoEmpty(object.userData) && (object.userData.lastAccess + 259200000 > currTimeStamp)) {
            uniformsThis.userData = object.userData;
        }

        // Если в localStorage пусто или последний раз пользователь был давно
        else {
            uniformsThis.userData.lastAccess = currTimeStamp;
            uniformsThis.userData.langUser = window.navigator.language || navigator.userLanguage;
            if (uniformsThis.userData.langUser == 'ru-RU') { uniformsThis.userData.langUser = 'ru'; }

            // Определяем местоположение
            if (uniformsThis.config.detectRegion) {
                jQuery.getJSON('https://ru.sxgeo.city/json', function(data){

                    uniformsThis.userData.city = data.city.name_ru;
                    uniformsThis.userData.region = data.region.name_ru;
                    uniformsThis.userData.country = data.country.name_ru;

                    uniformsThis.__SaveObject(object);
                    uniformsThis.__Log('log', 'Местоположение определено');
                });
            }

            object.userData = uniformsThis.userData;
            uniformsThis.__SaveObject(object);
        }


        uniformsThis.body.trigger('uniforms-userdata-loaded');
    };

    // Либо загружает языковые данные из localStorage, либо загружает их с сайта
    this.__InitLang = function () {
        var object = uniformsThis.__LoadObject();
        var currTimeStamp = new Date().getTime();

        if (!NoEmpty(object)) { object = {}; }


        if (NoEmpty(object.lang) && (object.lang.lastChange + 864000000 > currTimeStamp)) {
            uniformsThis.lang = object.lang;
            uniformsThis.__Log('log', 'Языковой пакет загружен');
            uniformsThis.body.trigger('uniforms-lang-loaded');
        } else {
            jQuery.getJSON(uniformsThis.config.langsUrl + 'uniforms-lang-default.json', function(data) {
                // todo проверить пришли ли данные
                uniformsThis.lang = data;

                object.lang = data;

                uniformsThis.__Log('log', 'Языковой пакет обновлен и загружен');
                uniformsThis.__SaveObject(object);
                uniformsThis.body.trigger('uniforms-lang-loaded');
            });
        }
    };

    // Выполняет событийные функции при наступлении события typeEvent
    // typeEvent - open | beforeSubmit | afterSubmit
    this.__ExecuterFunctions = function (typeEvent) {
        if (typeof uniformsEventFunctions != 'object') { return; }

        var formName = uniformsThis.form.data['u-name'];
        var func;
        var logMessage = '';

        switch (typeEvent) {
            case 'open':
                func = uniformsEventFunctions[formName + '_open'];
                logMessage = uniformsThis.lang.logMessageOpenForm + formName;
                break;
            case 'beforeSubmit':
                func = uniformsEventFunctions[formName + '_beforeSubmit'];
                logMessage = uniformsThis.lang.logMessageBeforeSend + formName;
                break;
            case 'afterSubmit':
                func = uniformsEventFunctions[formName + '_afterSubmit'];
                logMessage = uniformsThis.lang.logMessageAfterSend + formName;
                break;
            case 'errorSubmit':
                func = uniformsEventFunctions[formName + '_errorSubmit'];
                logMessage = uniformsThis.lang.logMessageAfterSend + formName;
                break;
        }

        if (typeof func == 'function') {
            func(uniformsThis.form.root);
            uniformsThis.__Log('log', logMessage);
        }
    };

    // Подготавливает все необходимые данные для отправки формы
    // actionType - show | send
    this.__PrepareSubmitData = function (actionType) {

        var out = [];

        if (actionType === 'send') {
            out = uniformsThis.form.root.serializeArray();

            out.push({name: 'u-title', value: uniformsThis.page.pageTitle});
            out.push({name: 'u-url', value: uniformsThis.page.pageUrl});
            out.push({name: 'u-city', value: uniformsThis.userData.city});
            out.push({name: 'u-region', value: uniformsThis.userData.region});
            out.push({name: 'u-country', value: uniformsThis.userData.country});
            out.push({name: 'u-at', value: actionType});
        }

        if (actionType === 'show') {
            out.push({name: 'u-name', value: uniformsThis.form.data['u-name']});
            out.push({name: 'u-subject', value: uniformsThis.form.data['u-subject']});
            out.push({name: 'u-description', value: uniformsThis.form.data['u-description']});
            out.push({name: 'u-pid', value: uniformsThis.form.data['u-pid']});
            out.push({name: 'u-at', value: actionType});
        }

        return out;
    };

    // Инициализируется на вызванном объекте
    this.__Click = function (event) {
        event.preventDefault();

        var target = jQuery(event.target);

        // нажата кнопка показа формы
        if (target.hasClass('uniforms') && target.hasClass('show')) {

            uniformsThis.form.root = target;
            uniformsThis.form.typeObject = 'button';

            uniformsThis.form.data['u-name'] = target.data('u-name');
            uniformsThis.form.data['u-subject'] = target.data('u-subject');
            uniformsThis.form.data['u-description'] = target.data('u-description');
            uniformsThis.form.data['u-pid'] = target.data('u-pid');

            uniformsThis.__ShowForm();
        }

        // нажата кнопка отправки инлайн формы
        else if (target.hasClass('uniforms') && (target.prop('tagName') == 'FORM')) {

            uniformsThis.form.root = target;
            uniformsThis.form.typeObject = 'form-inline';
            uniformsThis.form.data['u-name'] = uniformsThis.form.root.find('[name=u-name]').val();

            uniformsThis.__SubmitForm();
        }

        // нажата кнопка отправки popup формы
        else if (target.hasClass('uniforms--popup__form') && (target.prop('tagName') == 'FORM')) {

            uniformsThis.form.root = target;
            uniformsThis.form.container = target.parents('.uniforms--popup');
            uniformsThis.form.typeObject = 'form-popup';
            uniformsThis.form.data['u-name'] = uniformsThis.form.root.find('[name=u-name]').val();

            uniformsThis.__SubmitForm();
        }
        else {
            uniformsThis.__Log('warn','__Click: Не определено действие для события');
        }
    };

    // По возможности отправляет события в метрику и аналитику
    this.__SendGoals = function (insideEvent) {
        var yaLabelPrefix, gaEvent;
        switch (insideEvent) {
            case 'open':        // открытие формы
                yaLabelPrefix = '_open';
                gaEvent = 'open';
                break;
            case 'submit':      // отправка формы
                yaLabelPrefix = '_submit';
                gaEvent = 'submit';
                break;
            case 'close':       // закрытие формы
                yaLabelPrefix = '_close';
                gaEvent = 'close';
                break;
        }

        if (typeof ym == 'function') {

            ym(/* номер_счетчика */, 'reachGoal', uniformsThis.form.data['u-name'] + yaLabelPrefix);

            this.__Log('warn', 'Событие ' + uniformsThis.form.data['u-name'] + yaLabelPrefix + ' отправлено в Яндекс.Метрику');
        } else {
            this.__Log('warn', 'Код Яндекс.Метрики не найден');
        }

        // найдем счетчик аналитики
        if (typeof ga == 'function' ) {
            ga('send', 'event', 'form', gaEvent, uniformsThis.form.data['u-name'], 1);
        }
        else {
            this.__Log('warn', 'Код Google Analytics не найден');
        }
    };

    // Очищает объект формы
    this.Clean = function () {
        uniformsThis.form.data = {};
    };

    // Загрузит и покажет требуемую форму
    this.__ShowForm = function () {

        uniformsThis.form.root.attr('disabled', 'disabled');

        jQuery.ajax({
            "url": uniformsThis.config.processorUrl,
            "type": "POST",
            "data": uniformsThis.__PrepareSubmitData('show'),
            "dataType": "html",
            "success": function (data) {
                uniformsThis.body.prepend(data);
                uniformsThis.form.container = uniformsThis.body.find('.uniforms--popup');
                uniformsThis.__ExecuterFunctions('open');
                uniformsThis.__SendGoals('open');
                uniformsThis.__Log('log', 'Форма показана');
            }
        });

        uniformsThis.form.root.removeAttr('disabled');
    };

    // Покажет слайд об успешной отправке формы
    this.__ShowSuccessSlide = function() {
        if (uniformsThis.config.useSlides) {
            var successSlide = uniformsThis.form.root.find('.uniforms__result-slide--success');

            if (successSlide.length) {
                successSlide.slideDown(300);
            }
        }
    };

    // Покажет слайд об ошибке при отправке
    this.__ShowErrorSlide = function() {
        if (uniformsThis.config.useSlides) {
            var successSlide = uniformsThis.form.root.find('.uniforms__result-slide--error');

            if (successSlide.length) {
                successSlide.slideDown(300);
            }
        }
    };

    // Отправит форму
    this.__SubmitForm = function () {
        uniformsThis.__Log('log', 'Начинаем отправку формы');

        uniformsThis.__FormBlockElements();

        uniformsThis.__FormValidate();

        uniformsThis.__ExecuterFunctions('beforeSubmit');

        uniformsThis.__FormFog('info');

        jQuery.ajax({
            "url": uniformsThis.config.processorUrl,
            "type": "POST",
            "data": uniformsThis.__PrepareSubmitData('send'),
            "dataType": "json",
            "success": function (data) {
                if (data.status == 1) {
                    uniformsThis.__FormFog('success');
                    uniformsThis.__ExecuterFunctions('afterSubmit');
                    uniformsThis.__SendGoals('submit');
                    uniformsThis.__Log('log', 'Форма  отправлена');
                    uniformsThis.__ShowSuccessSlide();
                    uniformsThis.__EndForm(uniformsThis.config.closePopupFormTimeout);
                } else {
                    uniformsThis.__FormFog('error');
                    uniformsThis.__ExecuterFunctions('errorSubmit');
                    uniformsThis.__Log('warn', 'Форма не отправилась');
                    uniformsThis.__ShowErrorSlide();
                }
            }
        });

        uniformsThis.__FormUnBlockElements();

        return false;
    };

    // Завершит работу с формой.
    // Если это инлайн форма - то очистит поля или перекинет на success-страницу
    // Если это popup форма - закроет форму или перекинет на success-страницу
    this.__EndForm = function (timeout) {

        if (!(parseInt(timeout) && (timeout > 0))) {
            timeout = 5000;
        }

        // Если это popup-форма
        if (uniformsThis.form.typeObject == 'form-popup') {


            setTimeout(uniformsThis.__FormClose, timeout)
        }
        // Если inline-форма
        else {
            if (NoEmpty(uniformsThis.config.successPageUrl)) {
                uniformsThis.__Log('log', 'Пользователь переправлен на success-страницу');
                window.location.href = uniformsThis.config.successPageUrl;
            } else {
                uniformsThis.__FormCleanFields();
                setTimeout(uniformsThis.__FormFogRemove, timeout);
            }
        }
        uniformsThis.Clean();
    };

    // Закроет popup-форму
    this.__FormClose = function () {
        uniformsThis.__SendGoals('close');
        uniformsThis.form.container.remove();
        uniformsThis.__Log('log','popup-форма закрыта');
        uniformsThis.Clean();
    };

    // Очистит поля формы
    this.__FormCleanFields = function () {
        uniformsThis.form.root.find('input[type != hidden]').val('');
        uniformsThis.form.root.find('option:selected').removeAttr('selected');
        uniformsThis.form.root.find('[name=u-extdata]').empty();
    };

    // Заблокирует все активные элементы в форме
    this.__FormBlockElements = function () {
        uniformsThis.form.root.find('input,select,button').each(function(i,el){
            var jEl = jQuery(el);
            if (((jEl.tagName == 'input') && (jEl.attr('type') != 'hidden')) || (jEl.tagName == 'select') || (jEl.tagName == 'button')) {
                jEl.attr('disabled', 'disabled');
                jEl.attr('data-u-disabled', 'disabled');
            }
        });
        uniformsThis.__Log('log', 'форма заблокирована');
    };

    // Разблокирует все элементы в форме
    this.__FormUnBlockElements = function() {
        uniformsThis.form.root.find('*[data-u-disabled=disabled]').each(function(i,el) {
            var jEl = jQuery(el);
            jEl.removeAttr('data-u-disabled').removeAttr('disabled');
        });
        uniformsThis.__Log('log', 'форма разблокирована');
    };

    // Проверяет корректность полей
    this.__FormValidate = function () {

    };

    // Показывает туман формы
    // typeFog  info | error | success  тип тумана может быть информационный, ошибочный, успешный
    this.__FormFog = function(typeFog) {
        var fogClass, fogLabel;

        try {
            uniformsThis.form.fog.remove();
        }
        catch (e) {}


        switch (typeFog) {
            case 'info':
                fogClass = 'uniforms__fog--info';
                fogLabel = uniformsThis.lang.fogLabelInfo;
                break;
            case 'error':
                fogClass = 'uniforms__fog--error';
                fogLabel = uniformsThis.lang.fogLabelError;
                break;
            case 'success':
                fogClass = 'uniforms__fog--success';
                fogLabel = uniformsThis.lang.fogLabelSuccess;
                break;
        }

        uniformsThis.form.fog = uniformsThis.form.root.append('<div class="uniforms__fog ' + fogClass + '"><span class="uniforms__fog__label">' + fogLabel + '</span></div>').find('.uniforms__fog');
    };
    this.__FormFogRemove = function() {
        try {
            uniformsThis.form.fog.remove();
        }
        catch (e) {}
    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.__Init();
}
