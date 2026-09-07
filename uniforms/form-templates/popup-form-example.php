<div class="uniforms uniforms--popup">
    <div class="uniforms--popup__body-fog"></div>
    <div class="uniforms--popup__wrapper-form">
        <div class="uniforms--popup__closer" title="Закрыть форму">&times;</div>
        <form  class="uniforms--popup__form">
            <legend class="uniforms__h">Заголовок формы</legend>
            <span class="uniforms__description">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</span>
            <fieldset>
                <input type="hidden" name="u-name" value="<?=$request['u-name']?>">
                <input type="hidden" name="u-pid" value="<?=$request['u-pid']?>">
                <input type="hidden" name="u-subject" value="<?=$request['u-subject']?>">
                <input type="hidden" name="u-description" value="<?=$request['u-description']?>">
                <input type="hidden" name="u-extdata" value="">
                
                <div class="uniforms__field">
                    <label for="lbPhone">Телефон</label>
                    <input type="tel" name="phone" id="lbPhone" placeholder="Телефон" required>                    
                </div>
                <div class="uniforms__field">
                    <label for="lbEmail">E-mail</label>
                    <input type="email" name="email" id="lbEmail" placeholder="Электронная почта" >          
                </div>

                <div class="uniforms__agreement">
                    <input required name="pd" autocomplite="off" type="checkbox">
                    <p>Я даю свое <a href="/consent-processing-personal/" target="_blank" rel="noopener">согласие на обработку моих персональных данных</a>.</p>
                </div>

                <div class="uniforms__submit">
                    <button type="submit">Отправить</button>
                </div>
            </fieldset>
        </form>
    </div>
</div>