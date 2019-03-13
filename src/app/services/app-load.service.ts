import { Injectable } from '@angular/core';

import { auth } from '../../environments/environment';
import { OAuthService, JwksValidationHandler, AuthConfig } from 'angular-oauth2-oidc';

@Injectable()
export class AppLoadService {

  constructor(private oauthService: OAuthService) {
      this.oauthService.configure(auth);

      this.oauthService.setupAutomaticSilentRefresh();

      this.oauthService.tokenValidationHandler = new JwksValidationHandler();
      this.oauthService.tryLogin({});
 }

  getLogin()  {

    if(this.oauthService.getAccessToken()) {
      console.log(this.oauthService.getAccessToken());
    } else {
      this.oauthService.initImplicitFlow();
    }
//https://api.medunigraz.at:8088/oauth2/authorize/?client_id=zfPJ2FCJMWgZxm9tvpIHsy5J5W5G4LaZzMs5WZvu&response_type=token
  }
}
