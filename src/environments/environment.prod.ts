import { AuthConfig } from 'angular-oauth2-oidc';

//let baseURL = 'https://api.medunigraz.at:8088/';
let baseURL = 'https://api-test.medunigraz.at/';

export const environment = {
  production: true,
  apiURL: baseURL + 'v1/'
};

export const auth: AuthConfig = {
//  'clientId': 'zfPJ2FCJMWgZxm9tvpIHsy5J5W5G4LaZzMs5WZvu', //https://api.medunigraz.at:8088/
  'clientId': 'jv74QwVn5T3VislAPYY0N4TIDzvSeJtuNKENVXWP', //https://api-test.medunigraz.at
  //'redirectUri': 'http://localhost:4200/',  
  'redirectUri': 'https://eanwesenheit.medunigraz.at/',
  'loginUrl': baseURL + 'oauth2/authorize/',
  'postLogoutRedirectUri': '',
  'scope': 'media',
  'resource': '',
  'rngUrl': '',
  'oidc': false,
  'requestAccessToken': true,
  'options': null,
  'clearHashAfterLogin': true,
  'tokenEndpoint': baseURL + 'oauth2/token/',
  'responseType': 'token',
  'showDebugInformation': true,
  // 'silentRefreshRedirectUri': 'http://localhost:4200/silent-refresh.html',
  'silentRefreshRedirectUri': 'https://eanwesenheit.medunigraz.at/silent-refresh.html',
  'silentRefreshMessagePrefix': '',
  'silentRefreshShowIFrame': false,
  'silentRefreshTimeout': 20000,
  'dummyClientSecret': null,
  'requireHttps': false,
  'strictDiscoveryDocumentValidation': false,
  'customQueryParams': null,
  'silentRefreshIFrameName': 'angular-oauth-oidc-silent-refresh-iframe',
  'timeoutFactor': 0.75,
  'sessionCheckIntervall': 3000,
  'sessionCheckIFrameName': 'angular-oauth-oidc-check-session-iframe',
  'disableAtHashCheck': false,
  'skipSubjectCheck': false
}
