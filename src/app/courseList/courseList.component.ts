import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, Validators, FormBuilder, FormControl} from "@angular/forms";
import { IPageChangeEvent } from '@covalent/core/paging';

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
//Width wurde nicht übernommen
/*
  columns: ITdDataTableColumn[] = [
    { name: 'Raum',  label: 'Raum', width: 150 },
    { name: 'Kurs_Bezeichnung', label: 'Kurs Bezeichnung', width: { min: 150, max: 250 }},
    //{ name: 'Bedienstete', label: 'Bedienstete', width: 250}, //Im Livebetrieb werden nur die Kurse eines Vortragenden angezeigt
    { name: 'Start', label: 'Start', width: 100},
    { name: 'Ende', label: 'Ende', width: 100},
    { name: 'Aktion', label: 'Aktion', width: 100},
  ];
*/

  columsStudents: ITdDataTableColumn[] = [
      { name: 'ID',  label: 'ID', width: 150 },
      { name: 'Name',  label: 'Name', width: 150 },
      { name: 'Eingeschrieben', label: 'Eingeschrieben', width: 250},
      { name: '', label: ''}
  ];

  @ViewChild('pagingComp') pagingComponent: PagingComponent;

  overlayStarSyntax: boolean = false;

  private raumId : number = 0;
  private startGT : string = "";
  private startLT : string = "";
  private offset : number= 0;

  private coursesArray = [];
  private studentArray = [];
  startedCourseOnlineHolding : CampusOnlineHoldings;
  startedCourse;

  private timeOut;
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
    this.checkCourseIsRunningInRoom();
  }

  startCourse(id: string, roomId: number) {
    let data;

    this.courseService.startCourseForRoom(id, roomId)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            this.startedCourseOnlineHolding = data;
            this.getCourseById();
            this.activateRowInTable();
          },
          (err) => {
            console.log(err);
          }
        );
  }

  finishCourse() {
      let currentTime = new Date();
      let finishedTime: string = currentTime.toISOString().split(".")[0] + "+01:00";
      this.courseService.finishCourse(this.startedCourseOnlineHolding, finishedTime)
          .subscribe(
            (dataReturn) => {
              console.log(dataReturn);
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
          }, 700
      );
  }

  onSearchRoomNameKeyUp() {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                this.getCourses(this.raumId);
          }, 700
      );
  }

  searchCourseInAllRooms() {
    this.raumId = 0;

    let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
    startGTDate.setDate(startGTDate.getDate() - 7);
    startGTDate.setMinutes("00");
    startGTDate.setHours("00");
    let startLTDate = new Date();
    startLTDate.setDate(startLTDate.getDate() + 7);
    startLTDate.setMinutes("59");
    startLTDate.setHours("23");

    this.startGT = startGTDate.toISOString().split(".")[0];
    this.startLT = startLTDate.toISOString().split(".")[0];

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
            if(this.coursesArray.length > 0) {
              this.checkCourseIsRunning();
            } else {
              this.toggleOverlayStarSyntax();
            }
            this.pagingComponent.setPagingDatas(data.count);
          },
          (err) => {
            console.log(err);
          }
        );
  }

  checkCourseIsRunning() {
    let data;
    let counter: number = 0;

    for (let course of this.coursesArray) {
      this.courseService.checkCourseIsRunning(course.id)
        .subscribe(
          (dataReturn) => {
            counter++;
            data = dataReturn;
            if(data.count > 0) {
              this.startedCourse = course;
              this.startedCourseOnlineHolding = data.results[0];
            }

            if(counter == this.coursesArray.length) {
              if(this.startedCourseOnlineHolding) {
                this.getCourseById();
                this.activateRowInTable();
              }
              this.toggleOverlayStarSyntax();
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  checkCourseIsRunningInRoom() {
    let data;
    this.courseService.checkCourseIsRunningInRoom(this.raumId)
      .subscribe(
        (dataReturn) => {
          data = dataReturn;
          if(data.results.length > 0) {
            this.startedCourseOnlineHolding = data.results[0];
            this.getCourseById();
          } else {
            this.searchRoomName.setValue("");
            this.searchCourseName.setValue("");

            let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
            startGTDate.setMinutes(startGTDate.getMinutes() - 15 - startGTDate.getTimezoneOffset());
            let startLTDate = new Date();
            startLTDate.setMinutes(startLTDate.getMinutes() + 15 - startLTDate.getTimezoneOffset());

            this.startGT = startGTDate.toISOString().split(".")[0];
            this.startLT = startLTDate.toISOString().split(".")[0];

            this.getCourses(this.raumId);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getCourseById() {
    let data;
    this.courseService.getCourseById(this.startedCourseOnlineHolding.course_group_term)
      .subscribe(
        (dataReturn) => {
          data = dataReturn;
          this.coursesArray = [];
          this.coursesArray[0] = data;
          this.startedCourse = data;
          this.pagingComponent.setPagingDatas(data.count);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  activateRowInTable() {
    if(!this.startedCourseOnlineHolding.finished) {
      let unSelectedCourseElement;
      let unSelectedCourseElements = document.getElementsByClassName('ng-star-inserted');
      for (var i = 0; i < unSelectedCourseElements.length; i++) {
          unSelectedCourseElement = document.getElementById(unSelectedCourseElements[i].id);
          if(unSelectedCourseElement && unSelectedCourseElement.toString().search("Kurs_")) {
            unSelectedCourseElement.className = 'ng-star-inserted unSelectedCourse';
          }
      }
      let selectedCourseElement = document.getElementById('Kurs_' + this.startedCourseOnlineHolding.course_group_term);
      selectedCourseElement.className = 'ng-star-inserted selectedCourse';
    }
}

  onPageChange(eventLinks: IPageChangeEvent) {
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
