<div>
    <p>
        Описание заявки: <?=$data['u-description']?>
    </p>
    <table style="width: auto; border: 1px solid;" border="1" cellpadding="5">
        <tbody>
            <tr>
                <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Информация от пользователя</th>
            </tr>
            <?
                foreach ($data as $key => $value) {
                    if (strpos($key, 'u-') !== false) {continue;}
                    switch ($key) {
                        case 'fio':
                            $label = 'Имя';
                            break;
                        case 'phone':
                            $label = 'Телефон';
                            break;
                        case 'email':
                            $label = 'Почта';
                            break;
                        case 'message':
                            $label = 'Сообщение';
                            break;
                        default:
                            $label = '';
                            break;
                    }
            ?>
                    <tr>
                        <th style="text-align:right;width: 200px;">
                            <?
                                if (empty($label)) { echo $key; }
                                else {echo "$label ($key):";}
                            ?>
                        </th>
                        <td><?=$value?></td>
                    </tr>
            <? } ?>

            <? if (!empty($data['u-extdata'])) { ?>
                <tr>
                    <th  style="width: 200px;text-align:right;"> Дополнительные параметры: </th>
                    <td><?=$data['u-extdata']?></td>
                </tr>
            <? } ?>
        </tbody>
    </table>
</div>
<div style="margin-top: 30px">
    <table style="width: auto; border: 1px solid;" border="1" cellpadding="5">
        <tbody>
        <tr>
            <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Источник заявки</th>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Наименование страницы:</th>
            <td align="left"><?=$data['u-title']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Адрес страницы:</th>
            <td align="left"><?=$data['u-url']?></td>
        </tr>
        <? if (!empty($data['u-name'])) {?>
            <tr>
                <th style="width: 200px;text-align:right;">Название формы:</th>
                <td align="left"><?=$data['u-name']?></td>
            </tr>
        <? } ?>

        <? if (!empty($data['u-city']) || !empty($data['u-region']) || !empty($data['u-country'])) { ?>
            <tr>
                <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Геонахождение пользователя</th>
            </tr>
            <? if (!empty($data['u-city'])) { ?>
                <tr>
                    <th  style="width: 200px;text-align:right;">Город:</th>
                    <td><?=$data['u-city']?></td>
                </tr>
            <? } ?>
            <? if (!empty($data['u-region'])) { ?>
                <tr>
                    <th style="width: 200px;text-align:right;">Регион:</th>
                    <td><?=$data['u-region']?></td>
                </tr>
            <? } ?>
            <? if (!empty($data['u-country'])) { ?>
                <tr>
                    <th style="width: 200px;text-align:right;">Страна:</th>
                    <td><?=$data['u-country']?></td>
                </tr>
            <? } ?>
        <? } ?>


        <? if (!empty($data['source_text'])) { ?>
        <tr>
            <th colspan="2" style="text-align: left;border: 1px solid;background: #e6e6e6;">Источник пользователя</th>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Источник:</th>
            <td align="left"><?=$data['source_text']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Поисковый запрос:</th>
            <td align="left"><?=$data['source_query']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Рекламное объявление:</th>
            <td align="left"><?=$data['source_company']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">ID сессии:</th>
            <td align="left"><?=$data['source_idsess']?></td>
        </tr>
        <tr>
            <th style="width: 200px;text-align:right;">Динамические параметры:</th>
            <td align="left"><?=$data['source_utm']?></td>
        </tr>
        <tr>
            <td colspan="2" align="right"> <sup> ip: <?=$data['ipAddress']?>; Дата и время:<strong><?=date('d.m.Y H:i')?></strong> </sup>	</td>
        </tr>
        <? } ?>
        </tbody>
    </table>
</div>