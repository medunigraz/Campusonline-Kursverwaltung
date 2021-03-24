import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

import {CampusOnlineHoldings} from '../base/campusonlineholding';
import { environment } from '../../environments/environment';

@Injectable()
export class StudentService {
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

  getStudentListFromCourseonlineholding(course: CampusOnlineHoldings) {
    let url = this.apiURL + "attendance/campusonlineholding/"+course.id+"/?expand=entries.student";
    return this.http.get(url, this.headers);
  }

  getManualStudentListFromCourseonlineholding(course: CampusOnlineHoldings) {
    let url = this.apiURL + "attendance/campusonlineholding/"+course.id+"/?expand=manual_entries.student";
    return this.http.get(url, this.headers);
  }

  getAccreditedStudentListFromCourseonlineholding(course: CampusOnlineHoldings) {
    let url = this.apiURL + "attendance/campusonlineholding/"+course.id+"/?expand=accredited";
    return this.http.get(url, this.headers);
  }

  manualCheckinStudent(studentId: number, course: CampusOnlineHoldings) {
    let url = this.apiURL + "attendance/manualcampusonlineentry/";
    var parameter = JSON.stringify({"student": studentId, "holding": course.id, "room": course.room});

    return this.http.post(url, parameter, this.headers);
  }
  //DISCARD von Studierenden, die übers Terminal sich angemeldet haben
  checkoutStudentFromCourseOnlineEntrie(id: number) {
    let url = this.apiURL + "attendance/campusonlineentry/" + id + "/transition/";
    console.log(url);
    return this.http.request("DISCARD", url, this.headers);

  }
  //DISCARD von Studierenden, die manuel hinzugefügt wurden
  checkoutManualStudentFromCourseOnlineEntrie(id: number) {
    let url = this.apiURL + "attendance/manualcampusonlineentry/" + id + "/transition/";
    console.log(url);
    return this.http.request("DISCARD", url, this.headers);

  }
  //LEFT von Studierenden, die manuel hinzugefügt wurden
  leaveManualStudentFromCourseOnlineEntrie(id: number) {
    let url = this.apiURL + "attendance/manualcampusonlineentry/" + id + "/transition/";
    console.log(url);
    return this.http.request("LEAVE", url, this.headers);

  }

  getStudent(searchString: string = "", next: string = "") {
    let url;

    if(next == "") {
      url = this.apiURL + "api/autocomplete/?m=campusonline.Student&q="+searchString;
    } else {
      url = next;
    }
    return this.http.get(url, this.headers);
  }

}
