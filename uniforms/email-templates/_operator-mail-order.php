<div>
    <p>
        Описание заявки: <?php echo $data['u-description']?>
    </p>
    <table style="width: auto; border: 1px solid;border-collapse:collapse;margin-bottom:30px;" border="1" cellpadding="5">
        <tbody>
            <tr>
                <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Информация от пользователя</th>
            </tr>

            <?php if (!empty($data['u-data']['buyer']['fio'])) { ?>
            <tr>
                <th style="text-align:right;">
                    Имя
                </th>
                <td><?php echo $data['u-data']['buyer']['fio'] ?></td>
            </tr>
            <?php } ?>

            <?php if (!empty($data['u-data']['buyer']['phone'])) { ?>
            <tr>
                <th style="text-align:right;">
                    Телефон
                </th>
                <td><?php echo $data['u-data']['buyer']['phone'] ?></td>
            </tr>
            <?php } ?>

            <?php if (!empty($data['u-data']['buyer']['email'])) { ?>
            <tr>
                <th style="text-align:right;">
                    E-mail
                </th>
                <td><?php echo $data['u-data']['buyer']['email'] ?></td>
            </tr>
            <?php } ?>

            <?php if (!empty($data['u-data']['delivery'])) { ?>
                <tr>
                    <th style="text-align:right;">
                        Доставка
                    </th>
                    <td><?php echo $data['u-data']['delivery'] ?></td>
                </tr>
            <?php } ?>
            <?php if (!empty($data['u-data']['address'])) { ?>
                <tr>
                    <th style="text-align:right;">
                        Адрес доставки
                    </th>
                    <td><?php echo $data['u-data']['address'] ?></td>
                </tr>
            <?php } ?>
            <?php if (!empty($data['u-data']['type_pay'])) { ?>
                <tr>
                    <th style="text-align:right;">
                        Способ оплаты
                    </th>
                    <td><?php echo $data['u-data']['type_pay'] ?></td>
                </tr>
            <?php } ?>
            <?php if (!empty($data['u-data']['message'])) { ?>
            <tr>
                <th style="text-align:right;">
                    Сообщение
                </th>
                <td><?php echo $data['u-data']['message'] ?></td>
            </tr>
            <?php } ?>
        </tbody>
    </table>

    <table style="width: auto; border: 1px solid;border-collapse:collapse;" border="1" cellpadding="5">
        <tbody>
            <tr>
                <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Заказ пользователя</th>
            </tr>
            <tr>
                <th style="text-align: center;font-weight: bold;">Наименование товара</th>
                <th style="text-align: center;font-weight: bold;">Количество</th>
            </tr>
            <?php foreach ($data['u-data']['cart'] as $cart_item) { ?>
                <tr>
                    <td align="left">
                        <span style="display: block;"><?php echo trim($cart_item['name'])?></span>
                        <?php if (!empty($cart_item['variation'])) { ?><span style="font-size: 80%"><?php echo $cart_item['variation']?></span> <?php } ?>
                    </td>
                    <td align="center">
                        <span><?php echo $cart_item['quantity'] ?></span>
                    </td>
                </tr>
            <?php } ?>

            <?php if (!empty($data['u-extdata]'])) { ?>
                <tr>
                    <th  style="width: 200px;text-align:right;"> Дополнительные параметры: </th>
                    <td><?php echo $data['u-extdata]']?></td>
                </tr>
            <?php } ?>
        </tbody>
    </table>
</div>
<div style="margin-top: 30px">
    <table style="width: auto; border: 1px solid;border-collapse:collapse;" border="1" cellpadding="5">
        <tbody>
        <tr>
            <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Источник заявки</th>
        </tr>
        <tr>
            <th style="width: 200px;text-align:left;">Наименование страницы:</th>
            <td align="left"><?php echo $data['u-title']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:left;">Адрес страницы:</th>
            <td align="left"><?php echo $data['u-url']?></td>
        </tr>

        <?php if (!empty($data['u-city']) || !empty($data['u-region']) || !empty($data['u-country'])) { ?>
            <tr>
                <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Геонахождение пользователя</th>
            </tr>
            <?php if (!empty($data['u-city'])) { ?>
                <tr>
                    <th  style="width: 200px;text-align:right;">Город:</th>
                    <td><?php echo $data['u-city']?></td>
                </tr>
            <?php } ?>
            <?php if (!empty($data['u-region'])) { ?>
                <tr>
                    <th style="width: 200px;text-align:right;">Регион:</th>
                    <td><?php echo $data['u-region']?></td>
                </tr>
            <?php } ?>
            <?php if (!empty($data['u-country'])) { ?>
                <tr>
                    <th style="width: 200px;text-align:right;">Страна:</th>
                    <td><?php echo $data['u-country']?></td>
                </tr>
            <?php } ?>
        <?php } ?>


        <? if (!empty($data['sd-source'])) { ?>
            <tr>
                <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Источник пользователя</th>
            </tr> 
            <tr>
                <th style="width: 200px;text-align:right;">ID сессии:</th>
                <td align="left"><?php echo $data['sd-sessionID'] ?></td>
            </tr>
            <tr>
                <th style="width: 200px;text-align:right;">Время первого входа:</th>
                <td align="left"><?php echo $data['sd-timeEnter'] ?></td>
            </tr>      
            <tr>
                <th style="width: 200px;text-align:right;">Источник:</th>
                <td align="left"><?php echo $data['sd-source'] ?></td>
            </tr>


            <?php if (!empty($data['sd-keywords'])) { ?>
                <tr>
                    <th style="width: 200px;text-align:right;">Ключевые слова:</th>
                    <td align="left"><?php echo $data['sd-keywords'] ?></td>
                </tr>
            <?php } ?>

            <?php if (count($data['sd-utm'])) { ?>
                <tr>
                    <th style="width: 200px;text-align:right;">UTM метки:</th>
                    <td align="left">
                        <?php
                            foreach($data['sd-utm'] as $name => $value) { ?>
                                <p><strong><?php echo $name?>:</strong> <?php echo $value ?></p>
                        <?php } ?>
                    </td>
                </tr>
            
            <?php } ?>
        
            <?php if (count($data['sd-fullQuery'])) { ?>
                <tr>
                    <th style="width: 200px;text-align:right;">Полный массив запроса:</th>
                    <td align="left">
                        <?php
                            foreach($data['sd-fullQuery'] as $name => $value) { ?>
                                <?php if ($name == 'query') { ?>
                                    <p><strong><?php echo $name?>:</strong> <?php print_r($value) ?></p>
                                <?php } else { ?>
                                    <p><strong><?php echo $name?>:</strong> <?php echo $value ?></p>
                                <?php } ?>
                        <?php } ?>
                    </td>
                </tr>
            <?php } ?>
            
            <tr>
                <td colspan="2" align="right"> <sup> ip: <?php echo $data['sd-IPAddress'] ?>; Дата и время отправки заявки:<strong><?=date('d.m.Y H:i')?></strong></sup></td>
            </tr>
        <? } ?>
        </tbody>
    </table>
</div>