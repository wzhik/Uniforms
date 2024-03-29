<div class="uniforms uniforms--popup">
    <div class="uniforms--popup__body-fog"></div>
    <div class="uniforms--popup__wrapper-form">
        <div class="uniforms--popup__closer" title="Закрыть форму">&times;</div>
        <form  class="uniforms--popup__form">
            <legend class="uniforms__h">Заголовок формы</legend>
            <span class="uniforms__description">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</span>
            <fieldset>
                <input type="hidden" name="u-name" value="<?php echo $request['u-name']?>">
                <input type="hidden" name="u-pid" value="<?php echo $request['u-pid']?>">
                <input type="hidden" name="u-subject" value="<?php echo $request['u-subject']?>">
                <input type="hidden" name="u-description" value="<?php echo $request['u-description']?>">
                <input type="hidden" name="u-extdata" value="">
                
                <div class="uniforms__field-group">
                    <label for="lbPhone" class="uniforms__field-group__label">Телефон</label>
                    <input type="tel" name="phone" class="uniforms__field-group__input" id="lbPhone" placeholder="Телефон" value="">
                    <div class="uniforms__field-group__error"></div>
                   
                </div>
                <div class="uniforms__field-group">
                    <label for="lbPhone" class="uniforms__field-group__label">Телефон</label>
                    <input type="email" name="email" class="uniforms__field-group__input" id="lbEmail" placeholder="Электронная почта" value="">
                    <div class="uniforms__field-group__error"></div>                   
                </div>

                <div class="uniforms__agremeent">
                    <input required="" name="pd" checked="checked" autocomplite="off" type="checkbox" class="uniforms__agremeent__checkbox">
                    <p class="uniforms__agremeent__text">Я даю свое <a href="/consent-processing-personal/" target="_blank" rel="noopener">согласие на обработку моих персональных данных</a>.</p>
                </div>

                <div class="uniforms__submit-block">
                    <button class="uniforms__button-submit" type="submit">Отправить</button>
                </div>
            </fieldset>
        </form>
    </div>
</div>
