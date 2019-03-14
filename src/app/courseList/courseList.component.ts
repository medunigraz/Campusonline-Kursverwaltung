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
  private startedCourseId : string = "";

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
            this.coursesArray = data.results;
            console.log(this.coursesArray);
          },
          (err) => {
            console.log(err);
          }
        );

  }
  startCourseFrom(id: string, roomId: number) {
/*
    this.startedCourseId = '4358775-232710-51671';
    
    let unSelectedCourseElement;
    let unSelectedCourseElements = document.getElementsByClassName('ng-star-inserted');
    for (let element of unSelectedCourseElements) {
        if(element.id) {
          unSelectedCourseElement = document.getElementById(element.id);
          //console.log(unSelectedCourseElement);
          unSelectedCourseElement.className = 'ng-star-inserted unSelectedCourse';
        }
    }
    let selectedCourseElement = document.getElementById('Kurs_' + this.startedCourseId);
    selectedCourseElement.className = 'ng-star-inserted selectedCourse';
*/
    this.courseService.startCourseForRoom(id, roomId)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            console.log(data);
            this.startedCourseId = data.course_group_term;

            let unSelectedCourseElement;
            let unSelectedCourseElements = document.getElementsByClassName('ng-star-inserted');
            for (let element of unSelectedCourseElements) {
                if(element.id) {
                  unSelectedCourseElement = document.getElementById(element.id);
                  //console.log(unSelectedCourseElement);
                  unSelectedCourseElement.className = 'ng-star-inserted unSelectedCourse';
                }
            }
            let selectedCourseElement = document.getElementById('Kurs_' + this.startedCourseId);
            selectedCourseElement.className = 'ng-star-inserted selectedCourse';
            let data;
          },
          (err) => {
            console.log(err);
          }
        );

  }

}
