function UniformsCartClass() {

    /**
     * PROPERTIES
     */
    var thisClass = this;

    // Содержит конфиг
    this.config = {};



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

            // todo Проверить пришли ли данные
            thisClass.config = data;
            thisClass.__Log('log', 'Файл конфига загружен');
            thisClass.__InitCart();
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

        window.UniformsCart = thisClass; // Запишем себя в глобальную переменную чтобы можно было управлять извне
        // отправим событие что функционал корзины загрузился
        thisClass.body.trigger('uniforms-cart-loaded');
        thisClass.__Log('log','Инициализирована корзина');
    };

    // Если включен режим отладки, пишет сообщения в консоль
    this.__Log = function (lvl, message) {
        if (Uniforms.config.debugMode) {
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
        var costEl = jProduct.find('.uniforms-cart__product__name');
        var quantityEl = jProduct.find('.uniforms-cart__product__name');
        var variationEl = jProduct.find('.uniforms-cart__product__name');
        var idEl = jProduct.find('.uniforms-cart__product__name');

        var out = {};

        if ((nameEl.tagName == 'select')||(nameEl.tagName == 'input')||(nameEl.tagName == 'textarea')) {
            out.name = nameEl.val();
        }
        else {
            out.name = nameEl.text();
        }

        if ((costEl.tagName == 'select')||(costEl.tagName == 'input')||(costEl.tagName == 'textarea')) {
            out.cost = costEl.val();
        }
        else {
            out.cost = costEl.text();
        }

        if ((quantityEl.tagName == 'select')||(quantityEl.tagName == 'input')||(quantityEl.tagName == 'textarea')) {
            out.quantity = quantityEl.val();
        }
        else {
            out.quantity = quantityEl.text();
        }

        if ((idEl.tagName == 'select')||(idEl.tagName == 'input')||(idEl.tagName == 'textarea')) {
            out.id = idEl.val();
        }
        else {
            out.id = idEl.text();
        }

        if ((variationEl.tagName == 'select')||(variationEl.tagName == 'input')||(variationEl.tagName == 'textarea')) {
            out.variation = variationEl.val();
        }
        else {
            out.variation = variationEl.text();
        }

        if (NoEmpty(out.variation)) {
            out.hash = md5(out.name + out.variation);
        } else {
            out.hash = md5(out.name);
        }

        return out;
    };


    /**
     * PUBLIC METHODS
     */

    // Добавляет товар в корзину
    this.Add = function(event) {
        var jProduct = jQuery(event.target).parents('.uniforms-cart__product');
        var cart = thisClass.__LoadCartObject();

        var product = thisClass.__GetCurrState(jProduct);

        if (NoEmpty(cart[hash])) {
            cart[hash].quantity += product.quantity;
        } else {
            cart[hash] = product;
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
            thisClass.__SaveCartObject(cart);
            thisClass.__Log('log', 'Товар ' + product.name + ' удален из корзины');
            thisClass.body.trigger('uniforms-cart-product-remove');
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
            thisClass.body('uniforms-cart-product-change');
        }
        // Если такого товара нет в корзине тогда его добавим
        else {
            thisClass.Add(event);
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
        thisClass.__Log('log', 'Корзина очищена')
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

        jQuery.ajax({
            "url": thisClass.config.processorUrl,
            "type": "POST",
            "data": {
                "u-at": "sendorder",
                "data": JSON.stringify(thisClass.order)
            },
            "dataType": "json",
            "success": function (data) {
                if (data.status == 1) {
                    thisClass.__Log('log', 'заказ отправлен');
                    thisClass.SendGoals()

                } else {
                    thisClass.__Log('log', 'ошибка при отправке заказа ' + data.message);
                }
            }
        });
        thisClass.Clean();
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


