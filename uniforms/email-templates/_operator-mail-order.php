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

            <?php if (!empty($data['u-data']['buyer']['email'])) { ?>
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
                    <th align="left">
                        <span style="display: block;"><?php echo trim($cart_item['name'])?></span>
                        <?php if (!empty($cart_item['variation'])) { ?><span style="font-size: 80%"><?php echo $cart_item['variation']?></span> <?php } ?>
                    </th>
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


        <?php if (!empty($data['source_text'])) { ?>
        <tr>
            <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Источник пользователя</th>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Источник:</th>
            <td align="left"><?php echo $data['source_text']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Поисковый запрос:</th>
            <td align="left"><?php echo $data['source_query']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Рекламное объявление:</th>
            <td align="left"><?php echo $data['source_company']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">ID сессии:</th>
            <td align="left"><?php echo $data['source_idsess']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Динамические параметры:</th>
            <td align="left"><?php echo $data['source_utm']?></td>
        </tr>
        <tr>
            <td colspan="2" align="right"> <sup> ip: <?php echo $data['ipAddress']?>; Дата и время:<strong><?php echo date('d.m.Y H:i')?></strong> </sup>	</td>
        </tr>
        <?php } ?>
        </tbody>
    </table>
</div>