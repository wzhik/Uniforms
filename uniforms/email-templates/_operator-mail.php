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
                    if ((strpos($key, 'u-') !== false) || (strpos($key, 'sd-') !== false)) {continue;}
                    switch ($key) {
                        case 'fio':
                            $label = 'Имя';
                            break;
                        case 'phone':
                            $label = 'Телефон';
                            break;
                        case 'contact':
                            $label = 'Контакт';
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
                <td colspan="2" align="right"> <sup> ip: <?php echo $data['sd-IPAddress'] ?>; Дата и время отправки заявки:<strong><?=date('d.m.Y H:i:s')?></strong></sup></td>
            </tr>
        <? } ?>
        </tbody>
    </table>
</div>