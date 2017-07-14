(function() {

    this.body = jQuery('body');

    var uniformsCartThs = this;

    // Инициализирует корзину
    this.__InitCart = function() {
        if (localStorage.getItem('uniforms-cart') == null) {
            localStorage.setItem('uniforms-cart', JSON.stringify({}));
        }

        uniformsCartThs.body.on('click', '.uniforms-cart.add',     uniformsCartThs.Add);
        uniformsCartThs.body.on('click', '.uniforms-cart.remove',  uniformsCartThs.Remove);
        uniformsCartThs.body.on('click', '.uniforms-cart.change',  uniformsCartThs.Change);

        window.UniformsCart = uniformsCartThs; // Запишем себя в глобальную переменную чтобы можно было управлять извне
        // отправим событие что функционал корзины загрузился
        uniformsCartThs.body.trigger('uniforms-cart-loaded');
        uniformsCartThs.__Log('log','Инициализирована корзина');
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
        var cart = uniformsCartThs.__LoadCartObject();

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

        uniformsCartThs.__Log('log', 'Товар ' + hash + ' добавлен в корзину');
        uniformsCartThs.__SaveCartObject(cart);
        uniformsCartThs.body.trigger('uniforms-cart-product-add');
    };

    // Удаляет товар из корзины
    this.Remove = function (event) {
        var product = jQuery(event.target).data('uniformscartproduct');
        var cart = uniformsCartThs.__LoadCartObject();

        if (NoEmpty(cart[product.hash])) {
            delete (cart[product.hash]);
            uniformsCartThs.__SaveCartObject(cart);
            uniformsCartThs.__Log('log', 'Товар ' + product.hash + ' удален из корзины');
            uniformsCartThs.body.trigger('uniforms-cart-product-remove');
        } else {
            uniformsCartThs.__Log('log', 'Товара ' + product.hash + ' нет в корзине');
        }
    };

    // Изменяет товар в корзине
    this.Change = function (event) {
        var curr = jQuery(event.target);

        var product = curr.data('uniformscartproduct');

        if (NoEmpty(product.hash)) {
            var cart = uniformsCartThs.__LoadCartObject();
            if (NoEmpty(cart[product.hash])) {

                if (NoEmpty(product.quantity)) { cart[product.hash]['quantity'] = product.quantity; }
                if (NoEmpty(product.cost)) { cart[product.hash]['cost'] = product.cost; }
                uniformsCartThs.__SaveCartObject(cart);
                uniformsCartThs.__Log('log', 'Товар ' + product.hash + ' изменен');
                uniformsCartThs.body('uniforms-cart-product-change');
            }
        }
    };

    // Возвращает JSON данные о составе корзины. Если productId пустой вернет всю корзину.
    this.Get = function (productHash) {
        var out;
        out = uniformsCartThs.__LoadCartObject();
        if (NoEmpty(productHash)) {
            out = out[productHash];
        }

        return out;
    };

    // Возвращает количество товарных позиций в корзине
    this.QuantityCart = function () {
        var cart = uniformsCartThs.__LoadCartObject();
        var i = 0;
        for (var key in cart) {
            i++;
        }
        return i;
    };

    // Очищает все данные корзины
    this.Clean = function() {
        localStorage.setItem('uniforms-cart','{}');
        uniformsCartThs.__Log('log', 'Корзина очищена')
    };

    // Отпраляет все товары, находящиеся в корзине, в виде заказа
    this.Send = function() {
        uniformsCartThs.Clean();
    };


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    uniformsCartThs.__InitCart();
})();

