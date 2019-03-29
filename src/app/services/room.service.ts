import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable()
export class RoomService {
  private headers;
  private apiURL : string = environment.apiURL;

  constructor (private http: HttpClient, private oauthService: OAuthService) {
    this.headers = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' +this.oauthService.getAccessToken()
          })
        };
  }

  getRoom(next: string = "") {
    let url;
    if(next == "") {
      url = this.apiURL + "api/autocomplete/?m=geo.Room";
    } else {
      url = next;
    }  
    return this.http.get(url, this.headers);
  }

  getRoomById(id: number) {
    let url = this.apiURL + "geo/rooms/" + id;

    return this.http.get(url, this.headers);
  }

}
