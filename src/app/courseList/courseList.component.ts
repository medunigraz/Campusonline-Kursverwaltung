import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import {CourseService } from '../services/course.service';
import { ITdDataTableColumn } from '@covalent/core/data-table';

@Component({
  selector: 'courseList',
  templateUrl: './courseList.component.html'
})
export class CourseListComponent implements OnInit {
  columns: ITdDataTableColumn[] = [
    { name: 'Raum',  label: 'Raum', width: 150 },
    { name: 'Kurs_Bezeichnung', label: 'Kurs Bezeichnung', width: { min: 150, max: 250 }},
    { name: 'Kurs_Typ', label: 'Kurs Typ'},
    { name: 'Bedienstete', label: 'Bedienstete', width: 250},
    { name: 'Start', label: 'Start', width: 100},
    { name: 'Ende', label: 'Ende', width: 100},
    { name: 'Kurs_starten', label: 'Kurs starten', width: 100},
  ];

  private raumId : number = 0;
  private coursesArray = [];
  private startedCourseId;

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
            //console.log(data);
          },
          (err) => {
            console.log(err);
          }
        );

  }
  startCourseFrom(id: string) {
    console.log(id);
  }

}
