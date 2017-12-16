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
        thisClass.body.trigger('uniforms-cart-loaded', thisClass);
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

        var out = {};

        // ID продукта
        if (NoEmpty(jProduct.attr('data-ucart-id'))) {
            out.id = jProduct.data('ucart-id');
        }
        else {
            var idEl = jProduct.find('.uniforms-cart__product__id');
            if ((idEl.prop('tagName') == 'SELECT')||(idEl.prop('tagName') == 'INPUT')||(idEl.prop('tagName') == 'TEXTAREA')) {
                out.id = idEl.val().trim();
            }
            else {
                out.id = idEl.text().trim();
            }
        }
        if (!NoEmpty(out.id) || !NoEmpty(parseInt(out.id)) ) {
            thisClass.__Log('warn', 'ID товара не определен');
        }

        // название продукта
        if (NoEmpty(jProduct.attr('data-ucart-name'))) {
            out.name = jProduct.data('ucart-name');
        }
        else {
            var nameEl = jProduct.find('.uniforms-cart__product__name');
            if ((nameEl.prop('tagName') == 'SELECT')||(nameEl.prop('tagName') == 'INPUT')||(nameEl.prop('tagName') == 'TEXTAREA')) {
                out.name = nameEl.val().trim();
            }
            else {
                out.name = nameEl.text().trim();
            }
        }
        if (!NoEmpty(out.name)) {
            thisClass.__Log('warn', 'название товара не определено');
        }

        // стоимость продукта
        if (NoEmpty(jProduct.attr('data-ucart-cost'))) {
            out.cost = jProduct.data('ucart-cost');
        }
        else {
            var costEl = jProduct.find('.uniforms-cart__product__cost');
            if ((costEl.prop('tagName') == 'SELECT')||(costEl.prop('tagName') == 'INPUT')||(costEl.prop('tagName') == 'TEXTAREA')) {
                out.cost = costEl.val().trim();
            }
            else {
                out.cost = costEl.text().trim();
            }
        }
        if (!NoEmpty(out.cost) || !NoEmpty(parseInt(out.cost)) ) {
            thisClass.__Log('warn', 'стоимость товара не определена');
        }

        // количество едениц продукта
        if (NoEmpty(jProduct.attr('data-ucart-quantity'))) {
            out.quantity = jProduct.data('ucart-quantity');
        }
        else {
            var quantityEl = jProduct.find('.uniforms-cart__product__quantity');
            if ((quantityEl.prop('tagName') == 'SELECT')||(quantityEl.prop('tagName') == 'INPUT')||(quantityEl.prop('tagName') == 'TEXTAREA')) {
                out.quantity = quantityEl.val().trim();
            }
            else {
                out.quantity = quantityEl.text().trim();
            }
        }

        if (!NoEmpty(parseInt(out.quantity)) ) {
            thisClass.__Log('warn', 'количество товара не число');
        }

        // вариация продукта
        if (NoEmpty(jProduct.attr('data-ucart-variation'))) {
            out.variation = jProduct.data('ucart-variation');
        }
        else {
            var variationEl = jProduct.find('.uniforms-cart__product__variation');
            if ((variationEl.prop('tagName') == 'SELECT')||(variationEl.prop('tagName') == 'INPUT')||(variationEl.prop('tagName') == 'TEXTAREA')) {
                out.variation = variationEl.val().trim();
            }
            else {
                out.variation = variationEl.text().trim();
            }
        }

        // хэш продукта
        if (NoEmpty(jProduct.attr('data-ucart-hash'))) {
            out.hash = jProduct.data('ucart-hash');
        }
        else {
            out.hash = jProduct.find('.uniforms-cart__product__hash').text().trim();
        }

        // Создадим хэш если не задан
        if (!NoEmpty(out.hash)) {
            if (NoEmpty(out.variation)) {
                out.hash = md5(out.name + out.variation);
            } else
                {
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
        }

        thisClass.__SaveCartObject(cart);
        thisClass.__Log('log', 'Товар "' + product.name + '" добавлен в корзину');
        jProduct.addClass('uniforms-cart__product--added');

        thisClass.__SendGoals('add');
        thisClass.body.trigger('uniforms-cart-product-add', jProduct);
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
            jProduct.removeClass('uniforms-cart__product--added');
            thisClass.body.trigger('uniforms-cart-product-remove', jProduct);
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
            jProduct.data('ucart-quantity', product.quantity);
            jProduct.attr('data-ucart-quantity', product.quantity);
            thisClass.__Log('log', 'Товар ' + product.name + ' изменен');

            thisClass.__SaveCartObject(cart);
            thisClass.__SendGoals('change');

            thisClass.body.trigger('uniforms-cart-product-change');
        }
        // Если такого товара нет в корзине тогда его добавим
        else {
            thisClass.Add(event);

        }
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

    this.GetFormatedCost = function (cost_number) {
        cost_number = cost_number + '';
        var s1 = cost_number.substr(-3, 3);
        var s2 = cost_number.substr(0, (cost_number.length-3) );
        return s2 + ' ' + s1;
    };


    // Очищает все данные корзины
    this.Clean = function() {
        localStorage.setItem('uniforms-cart','{}');
        thisClass.__Log('log', 'Корзина очищена');
        thisClass.__SendGoals('clean');
    };

    // Помечает на странице все существующие в корзине товары
    this.CheckAddedProducts = function() {
        var cart = thisClass.__LoadCartObject();

        jQuery('.uniforms-cart__product').each(function(i, el) {
            var jProduct = jQuery(el);

            var dataProduct = thisClass.__GetCurrState(jProduct);
            if (typeof cart[dataProduct.hash] != 'undefined') {
                jProduct.addClass('uniforms-cart__product--added');
            }

        });

        thisClass.body.trigger('uniforms-cart-checked-products');
    };

    // Создает заказ из переданных данных
    this.CreateOrder = function(jsonOrderData) {

        thisClass.order = {
            "message": jsonOrderData.message,
            "address": jsonOrderData.address,
            "type_pay": jsonOrderData.type_pay,
            "delivery": jsonOrderData.delivery,
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
                    thisClass.body.trigger('uniforms-cart-order-sent');
                } else {
                    thisClass.__Log('log', 'ошибка при отправке заказа ' + data.message);
                    thisClass.body.trigger('uniforms-cart-order-sent-error');
                }
            },
            "error": function (data) {
                thisClass.__Log('log', 'ошибка при отправке заказа ' + data.message);
                thisClass.body.trigger('uniforms-cart-order-sent-error');
            }
        });

        return flgResSend;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    thisClass.__Start();
}

var UniformsCart;

jQuery(document).ready(function () {
    UniformsCart = new UniformsCartClass();
});
