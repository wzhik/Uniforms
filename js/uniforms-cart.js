function UniformsCartClass() {

    /**
     * PROPERTIES
     */
    var thisClass = this;

    // Содержит конфиг
    this.config = {};
    this.body = {};  

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
    this.__GetCurrState = function(jThs) {

        // Если у нажатого элемента присутствуют все необходимые data-атрибуты - значит нажата кнопка
        if (
            (jThs.data('ucart-id') != undefined) &&
            (jThs.data('ucart-name') != undefined) && 
            (jThs.data('ucart-quantity') != undefined)
        ) {
            var productID = jThs.data('ucart-id');
            if (!NoEmpty(productID)) {
                thisClass.__Log('warn', 'id товара-кнопки не определен');
                return false;
            }

            var productName = jThs.data('ucart-name');
            if (!NoEmpty(productName)) {
                thisClass.__Log('warn', 'Название товара-кнопки не определено');
                return false;
            }

            var productQuantity = jThs.data('ucart-quantity');
            if (!NoEmpty(productQuantity)) {
                productQuantity = 1;
            }
            
            var productCost = null;
            if (jThs.data('ucart-cost') != undefined) {
                productCost = parseInt(jThs.data('ucart-cost'));
            }

            var productImg = null;
            if (jThs.data('ucart-img') != undefined) {
                productImg = parseInt(jThs.data('ucart-img'));
            }

            var productVariation = null;
            if (jThs.data('ucart-variation') != undefined) {
                productVariation = jThs.data('ucart-variation');
            }
        } 

        // Может быть нажата кнопка в плитке?
        else if (jThs.parents('.uniforms-cart__product').length) {
            var jTile = jThs.parents('.uniforms-cart__product');

            var productID = jTile.data('ucart-id');
            if (!NoEmpty(productID)) {
                thisClass.__Log('warn', 'id товара-плитки не определен');
                return false;
            }

            var productName = jTile.data('ucart-name');
            if (!NoEmpty(productName)) {
                thisClass.__Log('warn', 'Название товара-плитки не определено');
                return false;
            }

            var productQuantity = 1;
            if (jTile.find('.uniforms-cart__product__quantity').length) {
                productQuantity = parseInt(jTile.find('.uniforms-cart__product__quantity').val());
            } else if(jTile.data('ucart-quantity') != undefined) {
                productQuantity = parseInt(jTile.data('ucart-quantity'));
            }
            
            var productCost = null;
            if (jThs.data('ucart-cost') != undefined) {
                productCost = parseInt(jThs.data('ucart-cost'));
            } else if (jTile.data('ucart-cost') != undefined) {
                productCost = parseInt(jTile.data('ucart-cost'));
            } 

            var productImg = null;
            if (jThs.data('ucart-img') != undefined) {
                productImg = jThs.data('ucart-img');
            } else if (jTile.data('ucart-img') != undefined) {
                productCost = jTile.data('ucart-img');
            } 
            
            var productVariation = null;
            if (jThs.data('ucart-variation') != undefined) {
                productVariation = jThs.data('ucart-variation');
            } else if (jTile.data('ucart-variation') != undefined) {
                productVariation = jTile.data('ucart-variation');
            }
        } 

        // Не удалось определить товар
        else {
            thisClass.__Log('warn', 'Товар не определен');
            return false;
        }
     
        // Подготовим данные на выход
        var productHash = md5(productID + productName + productVariation);

        var out = {
            id:         productID,
            name:       productName,
            cost:       productCost,
            quantity:   productQuantity,
            variation:  productVariation,
            hash:       productHash
        };

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
        var jThs = jQuery(event.target);
        var cart = thisClass.__LoadCartObject();

        var product = thisClass.__GetCurrState(jThs);

        if (NoEmpty(cart[product.hash])) {
            cart[product.hash].quantity = parseInt(cart[product.hash].quantity) + parseInt(product.quantity);
        } else {
            cart[product.hash] = product;
        }

        thisClass.__SaveCartObject(cart);
        thisClass.__Log('log', 'Товар "' + product.name + '" добавлен в корзину');

        thisClass.__SendGoals('add');
        thisClass.body.trigger('uniforms-cart-product-add', cart);
        jThs.trigger('uniforms-cart-product-add', product);
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
        // Если такого товара нет в корзине, тогда его добавим
        else {
            thisClass.Add(event);

        }
    };

    // Возвращает JSON данные о составе корзины. Если productHash пустой вернет всю корзину.
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

        jQuery('.uniforms-cart__product__add-cart').each(function(i, el) {
            var jEl = jQuery(el);

            var currProduct = thisClass.__GetCurrState(jEl);

            if (cart[currProduct.hash] != undefined) {
                jEl.trigger('uniforms-cart-product-add', cart[currProduct.hash]);
            }
        });
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

var uniformsCart = new UniformsCartClass();