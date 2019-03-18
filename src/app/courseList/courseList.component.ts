import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, Validators, FormBuilder, FormControl} from "@angular/forms";

import {CourseService } from '../services/course.service';
import { ITdDataTableColumn } from '@covalent/core/data-table';
import { TdLoadingService } from '@covalent/core/loading';

import {CampusOnlineHoldings} from '../base/campusonlineholding';
import {PagingComponent} from '../paging/paging.component';

@Component({
  selector: 'courseList',
  templateUrl: './courseList.component.html'
})
export class CourseListComponent implements OnInit {
  columns: ITdDataTableColumn[] = [
    { name: 'Raum',  label: 'Raum', width: 150 },
    { name: 'Kurs_Bezeichnung', label: 'Kurs Bezeichnung'},
    { name: 'Bedienstete', label: 'Bedienstete', width: 250},
    { name: 'Start', label: 'Start', width: 100},
    { name: 'Ende', label: 'Ende', width: 100},
    { name: 'Kurs_starten', label: 'Kurs starten', width: 100},
  ];

  @ViewChild('pagingComp') pagingComponent: PagingComponent;

  overlayStarSyntax: boolean = false;

  private raumId : number = 0;
  private startGT : string = "";
  private startLT : string = "";
  private offset : number= 0;

  private coursesArray = [];
  startedCourse : CampusOnlineHoldings;

  private timeOut;
  private keyUpTime: number = 700;
  private allRoomSearch: boolean  = false;

  searchCourseName = new FormControl();
  searchRoomName = new FormControl();

  constructor(
    formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService,
    private renderer: Renderer2,
    private _loadingService: TdLoadingService
  ) {
    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.raumId = params['raum'];
    });

  }

  ngOnInit() {
    this.toggleOverlayStarSyntax();
    let data;
    this.searchRoomName.setValue("");
    this.searchCourseName.setValue("");

    let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
    startGTDate.setMinutes(startGTDate.getMinutes() - 15);
    let startLTDate = new Date();
    startLTDate.setMinutes(startLTDate.getMinutes() + 15);

    this.startGT = startGTDate.getFullYear() + "-" + (startGTDate.getMonth() + 1) + "-" + startGTDate.getDate();
    this.startGT  += " " + startGTDate.getHours() + ":" + startGTDate.getMinutes() + ":00";

    this.startLT = startLTDate.getFullYear() + "-" + (startLTDate.getMonth() + 1) + "-" + startLTDate.getDate();
    this.startLT  += " " + startLTDate.getHours() + ":" + startLTDate.getMinutes() + ":00";

    this.getCourses(this.raumId);
  }

  startCourseFrom(id: string, roomId: number) {
    let data;

    this.courseService.startCourseForRoom(id, roomId)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            this.startedCourse = data;
            this.activateRowInTable();
          },
          (err) => {
            console.log(err);
          }
        );
  }

  onSearchCourseNameKeyUp() {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                this.getCourses(this.raumId);
          }, this.keyUptime
      );
  }

  onSearchRoomNameKeyUp() {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                this.getCourses(this.raumId);
          }, this.keyUptime
      );
  }

  searchCourseInAllRooms() {
    this.raumId = 0;

    let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
    startGTDate.setMinutes(startGTDate.getMinutes() - 15);
    let startLTDate = new Date();
    startLTDate.setMinutes(startLTDate.getMinutes() + 15);

    this.startGT = startGTDate.getFullYear() + "-" + (startGTDate.getMonth() + 1) + "-" + startGTDate.getDate();
    this.startGT += " " + startGTDate.getHours() + ":" + startGTDate.getMinutes() + ":00";

    this.startLT = startLTDate.getFullYear() + "-" + (startLTDate.getMonth() + 1) + "-" + startLTDate.getDate();
    this.startLT += " " + startLTDate.getHours() + ":" + startLTDate.getMinutes() + ":00";

    this.getCourses(this.raumId);
    this.allRoomSearch = true;
  }

  getCourses(raumNr: number) {
    this.toggleOverlayStarSyntax();
    let data;
    this.courseService.getCourses(this.offset, raumNr, this.startGT, this.startLT, this.searchRoomName.value, this.searchCourseName.value)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            this.pagingComponent.setPagingDatas(data.count);
            this.coursesArray = data.results;
//console.log(this.coursesArray );
            this.checkCourseIsRunning();
            this.toggleOverlayStarSyntax();
          },
          (err) => {
            console.log(err);
          }
        );
  }

  checkCourseIsRunning() {
    let data;
    for (let course of this.coursesArray) {
      this.courseService.checkCourseIsRunning(course.id)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            if(data.count > 0) {
              this.startedCourse = data.results[0];
console.log(this.startedCourse);
              this.activateRowInTable();
            }
          }
        );
    }
  }

  activateRowInTable() {
    if(!this.startedCourse.finished) {
      let unSelectedCourseElement;
      let unSelectedCourseElements = document.getElementsByClassName('ng-star-inserted');
      for (var i = 0; i < unSelectedCourseElements.length; i++) {
          unSelectedCourseElement = document.getElementById(unSelectedCourseElements[i].id);
          if(unSelectedCourseElement && unSelectedCourseElement.toString().search("Kurs_")) {
            unSelectedCourseElement.className = 'ng-star-inserted unSelectedCourse';
          }
      }
      let selectedCourseElement = document.getElementById('Kurs_' + this.startedCourse.course_group_term);
      selectedCourseElement.className = 'ng-star-inserted selectedCourse';
    }
  }

  onPageChange(eventLinks) {
    this.offset = eventLinks.fromRow - 1;
    this.searchCourseInAllRooms();
  }

  toggleOverlayStarSyntax(): void {
      if (this.overlayStarSyntax) {
        this._loadingService.register('overlayStarSyntax');
      } else {
        this._loadingService.resolve('overlayStarSyntax');
      }
      this.overlayStarSyntax = !this.overlayStarSyntax;
    }

}
