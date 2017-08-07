function UniformsCartClass() {

    /**
     * PROPERTIES
     */
    var thisClass = this;

    // Содержит конфиг
    this.config = {};
    this.body = {};

    this.yandexCounter = '';

    /**
     * PRIVATE METHODS
     */

    // Запускаем корзину
    this.__Start = function () {

        if (typeof jQuery != 'function') {
            console.warn('uniforms-cart: jQuery not found. Disable!');
            return false;
        }

        thisClass.body = jQuery('body');

        jQuery.getJSON('/uniforms/uniforms-config.json', function (data) {

            if (data.configLoaded != 'yes') {
                console.warn('uniforms-cart: config not loaded. Disable!');
                return false;
            }
            else {
                thisClass.config = data;
                thisClass.__Log('log', 'Файл конфига загружен');
                thisClass.__InitCart();
            }
        });
    };

    //  Инициализируем корзину
    this.__InitCart = function() {

        // Если объекта корзины нет в хранилище - создадим пустой объект
        if (localStorage.getItem('uniforms-cart') == null) {
            localStorage.setItem('uniforms-cart', JSON.stringify({}));
        }

        thisClass.body.on('change', '.uniforms-cart__product__quantity', thisClass.Change);
        thisClass.body.on('click', '.uniforms-cart__product__add-cart', thisClass.Add);
        thisClass.body.on('click', '.uniforms-cart__product__remove-cart', thisClass.Remove);

        thisClass.__Log('log','Инициализирована корзина');
        thisClass.body.trigger('uniforms-cart-loaded');
    };

    // Если включен режим отладки, пишет сообщения в консоль
    this.__Log = function (lvl, message) {
        if (thisClass.config.debugMode) {
            message = 'Uniforms-cart: '  + message;
            switch (lvl) {
                case 'log':
                    console.log(message);
                    break;
                case 'warn':
                    console.warn(message);
                    break;
                case 'err':
                    console.error(message);
                    break;
            }
        }
    };

    // Загружует корзину из хранилица и преобразовывает в массив
    this.__LoadCartObject = function() {
        return JSON.parse(localStorage.getItem('uniforms-cart'));
    };

    // Сохраняет объект корзины в хранилице
    this.__SaveCartObject = function (cart) {
        var json = JSON.stringify(cart);
        localStorage.setItem('uniforms-cart', json);
    };

    // Вернет текущее состояние товара
    this.__GetCurrState = function(jProduct) {
        if (!jProduct.hasClass('uniforms-cart__product')) {
            jProduct = jProduct.parents('.uniforms-cart__product');

            if (jProduct.length == 0) {
                thisClass.__Log('warn', 'Карточка товара не определена');
                return false;
            }
        }

        var nameEl = jProduct.find('.uniforms-cart__product__name');
        var costEl = jProduct.find('.uniforms-cart__product__cost');
        var quantityEl = jProduct.find('.uniforms-cart__product__quantity');
        var variationEl = jProduct.find('.uniforms-cart__product__variation');
        var idEl = jProduct.find('.uniforms-cart__product__id');
        var hashEl = jProduct.find('.uniforms-cart__product__hash');

        var out = {};

        if ((nameEl.prop('tagName') == 'SELECT')||(nameEl.prop('tagName') == 'INPUT')||(nameEl.prop('tagName') == 'TEXTAREA')) {
            out.name = nameEl.val().trim();
        }
        else {
            out.name = nameEl.text().trim();
        }

        if ((costEl.prop('tagName') == 'SELECT')||(costEl.prop('tagName') == 'INPUT')||(costEl.prop('tagName') == 'TEXTAREA')) {
            out.cost = costEl.val().trim();
        }
        else {
            out.cost = costEl.text().trim();
        }

        if ((quantityEl.prop('tagName') == 'SELECT')||(quantityEl.prop('tagName') == 'INPUT')||(quantityEl.prop('tagName') == 'TEXTAREA')) {
            out.quantity = quantityEl.val().trim();
        }
        else {
            out.quantity = quantityEl.text().trim();
        }

        if ((idEl.prop('tagName') == 'SELECT')||(idEl.prop('tagName') == 'INPUT')||(idEl.prop('tagName') == 'TEXTAREA')) {
            out.id = idEl.val().trim();
        }
        else {
            out.id = idEl.text().trim();
        }

        if ((variationEl.prop('tagName') == 'SELECT')||(variationEl.prop('tagName') == 'INPUT')||(variationEl.prop('tagName') == 'TEXTAREA')) {
            out.variation = variationEl.val().trim();
        }
        else {
            out.variation = variationEl.text().trim();
        }

        if (hashEl.length != 0) {
            out.hash = hashEl.text().trim();
        }
        else {

            if (NoEmpty(out.variation)) {
                out.hash = md5(out.name + out.variation);
            } else {
                out.hash = md5(out.name);
            }
        }

        return out;
    };

    // Попытается отправить событие в метрику и в аналитику
    this.__SendGoals = function (insideEvent) {
        var yaLabelPrefix, gaEvent, yandexCounter;
        switch (insideEvent) {
            case 'remove':        
                yaLabelEvent = 'cart_remove_product';
                gaEvent = 'remove';
                break;
            case 'send':      
                yaLabelEvent = 'cart_send_order';
                gaEvent = 'send';
                break;
            case 'change':
                yaLabelEvent = 'cart_change_product';
                gaEvent = 'change';
                break;
            case 'add':
                yaLabelEvent = 'cart_add_product';
                gaEvent = 'add';
                break;
            case 'clean':
                yaLabelEvent = 'cart_clean';
                gaEvent = 'clean';
                break;
        }

        // найдем счетчик метрики. Ищем его здесь потому что при инициализации он еще не готов
        try {
            thisClass.yandexCounter = window[document.body.innerHTML.match(/yaCounter[0-9]{1,}/)[0]];
        }
        catch (e){
            this.__Log('warn', 'Код Яндекс.Метрики не найден');
        }

        if (typeof thisClass.yandexCounter == 'object') {
            thisClass.yandexCounter.reachGoal(yaLabelPrefix);
        }
        if (typeof ga == 'function') {
            ga('send', 'event', 'cart', gaEvent, 'uniforms-cart', 1);
        }
    };


    /**
     * PUBLIC METHODS
     */

    // Добавляет товар в корзину
    this.Add = function(event) {
        var jProduct = jQuery(event.target).parents('.uniforms-cart__product');
        var cart = thisClass.__LoadCartObject();

        var product = thisClass.__GetCurrState(jProduct);

        if (NoEmpty(cart[product.hash])) {
            cart[product.hash].quantity = parseInt(cart[product.hash].quantity) + parseInt(product.quantity);
        } else {
            cart[product.hash] = product;
            thisClass.__SendGoals('add');
        }

        thisClass.__SaveCartObject(cart);
        thisClass.__Log('log', 'Товар "' + product.name + '" добавлен в корзину');
        thisClass.body.trigger('uniforms-cart-product-add');
    };

    // Удаляет товар из корзины
    this.Remove = function (event) {
        var jProduct = jQuery(event.target).parents('.uniforms-cart__product');
        var cart = thisClass.__LoadCartObject();

        var product = thisClass.__GetCurrState(jProduct);

        if (NoEmpty(cart[product.hash])) {
            delete (cart[product.hash]);

            // Удалим элемент со страницы
            jProduct.remove();

            thisClass.__SaveCartObject(cart);
            thisClass.__Log('log', 'Товар ' + product.name + ' удален из корзины');
            thisClass.body.trigger('uniforms-cart-product-remove');
            thisClass.__SendGoals('remove');
        } else {
            thisClass.__Log('log', 'Товара ' + product.name + ' нет в корзине');
        }
    };

    // Изменяет товар в корзине
    this.Change = function (event) {
        var jProduct = jQuery(event.target).parents('.uniforms-cart__product');

        var product = thisClass.__GetCurrState(jProduct);

        var cart = thisClass.__LoadCartObject();

        // Если такой товар есть в корзине то изменим его
        if (NoEmpty(cart[product.hash])) {
            cart[product.hash] = product;
            thisClass.__Log('log', 'Товар ' + product.name + ' изменен');
            thisClass.body.trigger('uniforms-cart-product-change');
            thisClass.__SendGoals('change');
        }
        // Если такого товара нет в корзине тогда его добавим
        else {
            thisClass.Add(event);
            thisClass.__SendGoals('add');
        }

        thisClass.__SaveCartObject(cart);
    };

    // Возвращает JSON данные о составе корзины. Если productId пустой вернет всю корзину.
    this.Get = function (productHash) {
        var out;
        out = thisClass.__LoadCartObject();
        if (NoEmpty(productHash)) {
            out = out[productHash];
        }

        return out;
    };

    // Возвращает количество товарных позиций в корзине
    this.QuantityCart = function () {
        var cart = thisClass.__LoadCartObject();
        var i = 0;
        for (var key in cart) {
            i++;
        }
        return i;
    };

    // Очищает все данные корзины
    this.Clean = function() {
        localStorage.setItem('uniforms-cart','{}');
        thisClass.__Log('log', 'Корзина очищена');
        thisClass.__SendGoals('clean');
    };

    // Создает заказ из переданных данных
    this.CreateOrder = function(jsonOrderData) {

        thisClass.order = {
            "message": jsonOrderData.message,
            "address": jsonOrderData.address,
            "type_pay": jsonOrderData.type_pay,
            "buyer" : {
                "name": jsonOrderData.name,
                "phone": jsonOrderData.phone,
                "email": jsonOrderData.email
            },
            "cart": thisClass.Get()
        }
    };

        // Отпраляет все товары, находящиеся в корзине, в виде заказа
    this.SendOrder = function() {

        thisClass.__Log('log', 'отправка заказа');

        var flgResSend = false;

        jQuery.ajax({
            "url": thisClass.config.processorUrl,
            "type": "POST",
            "data": {
                "u-at": "sendorder",
                "u-data": JSON.stringify(thisClass.order),
                "u-title": document.title,
                "u-url" : window.location.href
            },
            "dataType": "json",
            "success": function (data) {
                if (data.status == 1) {
                    thisClass.__Log('log', 'заказ отправлен');
                    thisClass.__SendGoals('send');
                    thisClass.Clean();
                    flgResSend = true;
                } else {
                    thisClass.__Log('log', 'ошибка при отправке заказа ' + data.message);
                }
            }
        });

        return flgResSend;        
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    thisClass.__Start();
}
var UniformsCart;

if ((typeof uniStageSystem != 'undefined')&&(uniStageSystem === true)) {
    // запускаем инициализируем во второй стадии
    jBody.on('second-stage-load',  function () {
        UniformsCart = new UniformsCartClass();
    })
} else {
    UniformsCart = new UniformsCartClass();
}