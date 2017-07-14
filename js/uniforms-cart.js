function UniformsCartClass() {
    var thisClass = this;

    // Инициализирует корзину
    this.__InitCart = function() {
        if (typeof jQuery != 'function') {
            console.warn('uniforms-cart: jQuery not found. Disable!');
            return false;
        }

        thisClass.body = jQuery('body');

        if (localStorage.getItem('uniforms-cart') == null) {
            localStorage.setItem('uniforms-cart', JSON.stringify({}));
        }

        thisClass.body.on('click', '.uniforms-cart.add',     thisClass.Add);
        thisClass.body.on('click', '.uniforms-cart.remove',  thisClass.Remove);
        thisClass.body.on('click', '.uniforms-cart.change',  thisClass.Change);

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

    // Добавляет товар в корзину
    this.Add = function(event) {
        var curr = jQuery(event.target);
        var cart = thisClass.__LoadCartObject();

        var product = curr.data('uniformscartproduct');

        var hash;


        if (NoEmpty(product.variation)) {
            hash = md5(product.name + product.variation);
        } else {
            hash = md5(product.name);
        }
        product.hash = hash;

        if (NoEmpty(cart[hash])) {
            cart[hash].quantity += product.quantity;
        } else {
            cart[hash] = product;
        }

        thisClass.__Log('log', 'Товар ' + hash + ' добавлен в корзину');
        thisClass.__SaveCartObject(cart);
        thisClass.body.trigger('uniforms-cart-product-add');
    };

    // Удаляет товар из корзины
    this.Remove = function (event) {
        var product = jQuery(event.target).data('uniformscartproduct');
        var cart = thisClass.__LoadCartObject();

        if (NoEmpty(cart[product.hash])) {
            delete (cart[product.hash]);
            thisClass.__SaveCartObject(cart);
            thisClass.__Log('log', 'Товар ' + product.hash + ' удален из корзины');
            thisClass.body.trigger('uniforms-cart-product-remove');
        } else {
            thisClass.__Log('log', 'Товара ' + product.hash + ' нет в корзине');
        }
    };

    // Изменяет товар в корзине
    this.Change = function (event) {
        var curr = jQuery(event.target);

        var product = curr.data('uniformscartproduct');

        if (NoEmpty(product.hash)) {
            var cart = thisClass.__LoadCartObject();
            if (NoEmpty(cart[product.hash])) {

                if (NoEmpty(product.quantity)) { cart[product.hash]['quantity'] = product.quantity; }
                if (NoEmpty(product.cost)) { cart[product.hash]['cost'] = product.cost; }
                thisClass.__SaveCartObject(cart);
                thisClass.__Log('log', 'Товар ' + product.hash + ' изменен');
                thisClass.body('uniforms-cart-product-change');
            }
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

    thisClass.__InitCart();
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


