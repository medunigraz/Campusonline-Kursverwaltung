import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

import {CampusOnlineHoldings} from '../base/campusonlineholding';
import { environment } from '../../environments/environment';

@Injectable()
export class CourseService {
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

  getCourses(offset: number, roomNr: number, startGT: string, startLT: string, courseName: String): Observable<Object> {

    let paramsUrl = "?offset=" + offset + "&start__gte=" + startGT + "&start__lte=" + startLT;
    if(roomNr != 0) {
      paramsUrl += "&room=" + roomNr;
    }

    if(courseName != "") {
      paramsUrl += "&title__icontains=" + courseName;
    }

    let url = this.apiURL + "campusonline/course-group-term/" + paramsUrl;

    return this.http.get(url, this.headers);
  }

  getCourseById(courseId: string){
      let url = this.apiURL + "campusonline/course-group-term/" + courseId + "/";

      return this.http.get(url, this.headers);
  }

  createCampusOnlineHolding(courseId: string, roomId: number) {
    let url = this.apiURL + "attendance/campusonlineholding/";
    var parameter = JSON.stringify({"course_group_term": courseId, "room": roomId, "entries": [], "state": "running"});

    return this.http.post(url, parameter, this.headers);
  }

  startCourse(course: CampusOnlineHoldings) {
    let url = this.apiURL + "attendance/campusonlineholding/"+course.id+"/transition/";
    console.log(url);
    return this.http.request("START", url, this.headers);
  }

  checkCourseIsRunning(courseId: string) {
      let paramsUrl = "?course_group_term=" + courseId;
      let url = this.apiURL + "attendance/campusonlineholding/" + paramsUrl;

      return this.http.get(url, this.headers);
  }

  checkCourseIsRunningInRoom(roomId: number) {
      let paramsUrl = "?room=" + roomId;
      let url = this.apiURL + "attendance/campusonlineholding/" + paramsUrl;

      return this.http.get(url, this.headers);

  }

  finishCourse(course: CampusOnlineHoldings) {
    let url = this.apiURL + "attendance/campusonlineholding/"+course.id+"/transition/";

    console.log("START URL");
    console.log(url);
    return this.http.request("END", url, this.headers);
  }

  cancelCourse(course: CampusOnlineHoldings) {
    let url = this.apiURL + "attendance/campusonlineholding/"+course.id+"/transition/";
    console.log(url);
    return this.http.request("CANCEL", url, this.headers);
  }
}
