# Как этим пользоваться

## UNIFORMS

### Определение геопозиции
В последних изменениях был убран авторизованный доступ к api sxgeo.ru. 
Авторизованная строка доступа выглядит так: https://ru.sxgeo.city/c85ew/json 

### Определение источника пользователя - модуль UniSourceDetector
Модуль расположен по пути /uniforms/classes/uniforms-sourcedetector.php
Модуль должен подключаться и запускаться как можно раньше при первом обращении пользователя к сайту. Поэтому его лучше встраивать в файл index.php от CMS
Пример встраивания модуля:
```php
/* Подключаем и инициализируем определитель заходов */
session_start(); // иногда требуется инициализировать сессию 
require "uniforms/classes/uniforms-sourcedetector.php";
$usd = new UniSourceDetector();
```

По умолчанию модуль отключен. Чтобы задействовать включаем параметр *sourceDetector* в конфиге uniforms


### Конфиг Uniforms
Файл конфига по умолчанию лежит по пути */uniforms/unifroms-config.json*
Этот файл загружается скриптом при инициализации системы.

```JSON
{
  "debugMode": true,                        // ture | false  вкл выкл режим отладки
  "domain": "uniforms.uni-studio.ru",       // домен сайта, если указан неверный будем получать ошибку 400 при отправке
  "successPageUrl": "",                     // если сторока не пустая, то перекинет пользователя на указанный url при успешной отправке
  "useSlides": true,                        // будет показывать слайды успешной отпрвки или ошибки. div`ы слайдов должны быть сверстаны в форме
  "processorUrl": "/ajax/uniforms.php",     // путь к процессору на который отправлять запросы
  "langsUrl": "/uniforms/langs/",           // путь к папке с языковыми файлами
  "jsUrl": "/js/",                          // путь к папке со скриптами (хз зачем)
  "cssUrl": "/css/",                        // путь к папке со стилями (хз звчем)
  "detectRegion": true,                     // true | false включить или выключить определение geo позиции пользователя
  "sourceDetector": false,                  // true | false эта настройка используется серверной стороной, если разрешено попытается получить данные от sourcedetector
  "allowSendUser": false,                   // true | false хз что это !!!
  "closePopupFormTimeout": 3000,            // время закрытие popup-окна в милисекундах
  "configLoaded": "yes"                     // обязательная строчка, с помощью нее проверяется загрузился конфиг или нет
}
```




### Инлайн-формы
тег *form* должен иметь класс **unifroms-inline**




### Поля форм

#### Шаблон поля для ввода
```html
    <div class="uniforms__field-group">
        <label for="lbPhone" class="uniforms__field-group__label">Телефон</label>
        <input type="tel" name="phone" class="uniforms__field-group__input" id="lbPhone">
        <span class="uniforms__field-group__description">Дополнительное описание для поля</span>
        <div class="uniforms__field-group__error"><!-- Сюда выводиться текст ошибки при проверке поля --></div>
    </div>
```

#### Скрытые поля настроек
<input type="hidden" name="u-name">
**u-name**          - уникальное название формы
**u-pid**           - похоже идентификатор конфига, тогда непонятно почему Pid
**u-subject**       - тема письма с формы
**u-description**   - описание формы для письма
**u-extdata**       - дополнительные данные для формы




#### Проверочное поле для защиты от роботов

Чтобы защитится от роботов это поле должно быть пустым. Если на сервер это поле приходит не пустое, то сервер сообщает что все ок, но ни чего не отправляет.

```html
<div class="uniforms__field--hidden">
    <input type="text" name="name" value="">
</div>
```




### Вызов формы

data-поля:
* data-u-name - Уникальное для сайта название формы
* data-u-pid - ID конфигурации
* data-u-subject - тема письма для оператора
* data-u-description - текст описания для письма оператора

<a href="javascript:void(0)" class="uniforms show header__order-call" data-u-name="orderCall" data-u-pid="2" data-u-subject="Заказ обратного звонка">Заказать обратный звонок</a>




### Событийные функции
В файле *uniforms-event-functions.js* пишем функции которые должны выполниться при наступлении события
```javascript
    var uniformsEventFunctions = {
        "nameForm_open": function (jForm) {

        },
        "nameForm_beforeSubmit": function (jForm) {

        },
        "nameForm_afterSubmit": function (jForm) {

        },
        "beautyEnroll_beforeSubmit": function(jForm) {
            console.log('beautyEnroll_beforeSubmit');
            console.log(jForm);
        }
    };
```


--------------------------------------------------------------------------------------------------------------------------------

## UNIFORM-CART



### Разметка карточки товара
Карточка товара представдляет собой сверстанный блок в котором все важные данные размечены особым способом. Разметка данных:

* ID товара - ОБЯЗАТЕЛЬНОЕ ПОЛЕ
    data-ucart-id
    .uniforms-cart__product__id - может быть только как текстовый элемент, поля ввода 

* Название товара - ОБЯЗАТЕЛЬНОЕ ПОЛЕ
    data-ucart-name - с помощью data аттрибута
    .uniforms-cart__product__name - класс элемента

* Стоимость товара - ОБЯЗАТЕЛЬНОЕ ПОЛЕ
    data-ucart-cost
    .uniforms-cart__product__cost

* Количество товара. Это счетчик штук товара добавляемых в корзину
    data-ucart-quantity
    .uniforms-cart__product__quantity

* Вариация товара. Строка с отличием вариации от основного товара. Например, цвет: красный
    data-ucart-variation 
    .uniforms-cart__product__variation

* Хэш товара. Если не задан создается автоматически. Хэш это уникальный идентификатор для каждого товара и его вариации
    data-ucart-hash
    .uniforms-cart__product__hash

* Кнопка добавления товара в корзину
    .uniforms-cart__product__add-cart

* Кнопка удаления товара из корзины
    .uniforms-cart__product__remove-cart

Пример разметки карточки блюда:
```HTML
    <div class="uniforms-cart__product page--restaurant__dish" data-ucart-id="2" data-ucart-name="Блюдо1" data-ucart-cost="750" data-ucart-quantity="1">
        <div class="page--restaurant__dish__image-block">
            <img src="<?php echo $dishImage ?>" alt="<?php the_title() ?>" class="page--restaurant__dish__image">
        </div>
        <div class="page--restaurant__dish__text-block">
            <span class="page--restaurant__dish__name"><?php the_title() ?></span>
            <?php if (!empty($dishDescription)) { ?>
                <p class="page--restaurant__dish__description"><?php echo wp_trim_words($dishDescription, 13) ?></p>
            <?php } ?>
            <span class="page--restaurant__dish__out">Выход: <?php echo $dishOut?></span>
        </div>
        <div class="page--restaurant__dish__bottom-block">
            <span class="page--restaurant__dish__cost"><?php echo $dishCost?>&nbsp;&#8381;</span>
            <?php if ($dishOrdered) { ?>
                <button class="uniforms-cart__product__add-cart page--restaurant__dish__add-cart">В заказ</button>
                <div class="page--restaurant__dish__label-in-cart">В корзине</div>
            <?php } ?>
        </div>
    </div>
```


### События корзины
События случаются, когда в корзине происходят какие то изменения. События всплывают на элементе *body*
В событиях *добавления* и *удаления* товара передается jQuery объект карточки товара. Эти события нужны чтобы своими скриптами расширять функционал корзины и интегрировать модуль в конкретный сайт.

* Добавление товара в корзину
    uniforms-cart-product-add

* Удаление товара из корзины
    uniforms-cart-product-remove

* Изменение в количестве товаров в корзине
    uniforms-cart-product-change

* Товары присутствующие на странице и в корзине помечены
    uniforms-cart-checked-products
