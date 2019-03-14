import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';


@Injectable()
export class CourseService {
  private headers;
  constructor (private http: HttpClient, private oauthService: OAuthService) {
    this.headers = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' +this.oauthService.getAccessToken()
          })
        };

  }

  getCourseFromRoom(room: number): Observable<Object> {
    let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
    startGTDate.setMinutes(startGTDate.getMinutes() - 15);
    let startLTDate = new Date();
    startLTDate.setMinutes(startLTDate.getMinutes() + 15);

    let startGTString : string = startGTDate.getFullYear() + "-" + (startGTDate.getMonth() + 1) + "-" + startGTDate.getDate();
    startGTString += " " + startGTDate.getHours() + ":" + startGTDate.getMinutes() + ":00";

    let startLTString : string = startLTDate.getFullYear() + "-" + (startLTDate.getMonth() + 1) + "-" + startLTDate.getDate();
    startLTString += " " + startLTDate.getHours() + ":" + startLTDate.getMinutes() + ":00";

    let paramsUrl = "?room=" + room + "&start__gt=" + startGTString + "&start__lt=" + startLTString;
    let url = "https://api.medunigraz.at:8088/v1/campusonline/course-group-term/" + paramsUrl;

    return this.http.get(url, this.headers);
  }

  startCourseForRoom(courseId: string, roomId: number) {
    let url = "https://api.medunigraz.at:8088/v1/attendance/campusonlineholding/";
    var parameter = JSON.stringify({"course_group_term": courseId, "room": roomId, "entries": []});

    return this.http.post(url, parameter, this.headers);
  }

  getCourseFromAllRooms(): Observable<Object> {
    let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
    startGTDate.setDate(startGTDate.getDate() - 7);
    let startLTDate = new Date();
    startLTDate.setDate(startLTDate.getDate() + 7);

    let startGTString : string = startGTDate.getFullYear() + "-" + (startGTDate.getMonth() + 1) + "-" + startGTDate.getDate();
    startGTString += " " + startGTDate.getHours() + ":" + startGTDate.getMinutes() + ":00";

    let startLTString : string = startLTDate.getFullYear() + "-" + (startLTDate.getMonth() + 1) + "-" + startLTDate.getDate();
    startLTString += " " + startLTDate.getHours() + ":" + startLTDate.getMinutes() + ":00";

    let paramsUrl = "?start__gt=" + startGTString + "&start__lt=" + startLTString;
    let url = "https://api.medunigraz.at:8088/v1/campusonline/course-group-term/" + paramsUrl;

    return this.http.get(url, this.headers);
  }
}
