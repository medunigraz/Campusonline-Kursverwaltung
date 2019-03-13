import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import {CourseService } from '../services/course.service';

@Component({
  selector: 'courseList',
  templateUrl: './courseList.component.html'
})
export class CourseListComponent implements OnInit {
  private raumId : number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService
  ) {
    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.raumId = params['raum'];
    });

  }

  ngOnInit() {
    let data;

    this.courseService.getCourseFromRoom(this.raumId)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            console.log(data);
          },
          (err) => {
            console.log(err);
          }
        );

  }

}
