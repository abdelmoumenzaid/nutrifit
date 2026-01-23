<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
  <#if section="header">
    <div class="kcLogoRow">
      <div class="kcLogo">
        <div class="recipe-bowl-container">
          <div class="recipe-bowl">🍲</div>
          <span class="logo-text">NutriCoach</span>
        </div>
      </div>
    </div>
  <#elseif section="form">
    <div id="kc-form-wrapper">
      <div id="kc-form">
        <form id="kc-form-login" class="kcForm" action="${url.loginAction}" method="post">
          <div class="form-group">
            <input 
              tabindex="1" 
              id="username" 
              class="form-control" 
              name="username" 
              value="${(login.username!'')}" 
              type="text" 
              autofocus 
              autocomplete="off"
              placeholder="Email ou username"
            />
          </div>

          <div class="form-group">
            <div class="password-wrapper">
              <input 
                tabindex="2" 
                id="password" 
                class="form-control" 
                name="password" 
                type="password" 
                autocomplete="off"
                placeholder="Mot de passe"
              />
              <button type="button" class="password-toggle" onclick="togglePassword()">
                <span class="eye-icon">👁️</span>
              </button>
            </div>
          </div>

          <#if realm.rememberMe && !usernameEditDisabled??>
            <div class="checkbox">
              <label>
                <input 
                  tabindex="3" 
                  id="rememberMe" 
                  name="rememberMe" 
                  type="checkbox"
                  <#if login.rememberMe??>checked</#if>
                />
                Se souvenir de moi
              </label>
            </div>
          </#if>

          <div id="kc-form-buttons">
            <input 
              type="submit" 
              class="btn btn-primary" 
              name="login" 
              id="kc-login" 
              value="Se connecter"
              tabindex="4"
            />
          </div>
        </form>
      </div>

      <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
        <div id="kc-registration">
          <span>Pas encore de compte? 
            <a tabindex="5" href="${url.registrationUrl}">Créer un compte</a>
          </span>
        </div>
      </#if>

      <#if realm.resetPasswordAllowed>
        <div id="kc-forgot-password">
          <span>
            <a tabindex="5" href="${url.loginRestartFlowUrl}?restart=true">Mot de passe oublié?</a>
          </span>
        </div>
      </#if>
    </div>

  <#elseif section="info">
    <div id="kc-info">
      <div id="kc-info-wrapper">
        <div class="kc-info-message">
          <#if realm.internationalizationEnabled && supportedLocales?size gt 1>
            <div id="kc-locale" class="dropdown">
              <div id="kc-locale-wrapper" class="dropdown-toggle" data-toggle="dropdown">
                <a href="#">${locale.current}</a>
              </div>
              <ul class="dropdown-menu" role="menu">
                <#list supportedLocales as locale>
                  <li><a href="${locale.url}">${locale.label}</a></li>
                </#list>
              </ul>
            </div>
          </#if>
        </div>

        <#if client.baseUrl?has_content>
          <div id="kc-content">
            <div id="kc-content-wrapper">
              <#if pageRedirectUri?has_content>
                <p><a id="backToApplicationLink" href="${pageRedirectUri}">« Retour à l'application</a></p>
              </#if>
            </div>
          </div>
        </#if>
      </div>
    </div>

  </#if>

  <script>
    function togglePassword() {
      const input = document.getElementById('password');
      const button = document.querySelector('.password-toggle');
      
      if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<span class="eye-icon">🙈</span>';
      } else {
        input.type = 'password';
        button.innerHTML = '<span class="eye-icon">👁️</span>';
      }
    }

    // Focus sur premier input
    document.getElementById('username').focus();
  </script>

</@layout.registrationLayout>
