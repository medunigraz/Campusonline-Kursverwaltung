import { Component, OnInit, ViewChild, Renderer2, ElementRef, ViewContainerRef  } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, Validators, FormBuilder, FormControl} from "@angular/forms";
import { IPageChangeEvent } from '@covalent/core/paging';
import { TdDialogService } from '@covalent/core/dialogs';

import { Subscription, Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import {CourseService } from '../services/course.service';
import {RoomService } from '../services/room.service';
import { ITdDataTableColumn } from '@covalent/core/data-table';
import { TdLoadingService } from '@covalent/core/loading';

import {CampusOnlineHoldings} from '../base/campusonlineholding';
import {Room} from '../base/room';
import {PagingComponent} from '../paging/paging.component';

export interface User {
  presentation: string;
}

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

  options: Room[];

  startedCourseOnlineHolding : CampusOnlineHoldings;
  startedCourse;
  private runningCourse: boolean= false;

  private timeOut;
  private allRoomSearch: boolean  = false;

  searchCourseName = new FormControl();
  searchRoomName = new FormControl();
  searchDate = new FormControl();


  filteredOptions: Observable<Room[]>;

  constructor(
    formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService,
    private roomService: RoomService,
    private renderer: Renderer2,
    private _loadingService: TdLoadingService,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef
  ) {
    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.raumId = params['raum'];
    });

  }

  ngOnInit() {
    this.toggleOverlayStarSyntax();
    this.checkCourseIsRunningInRoom();

    this.filteredOptions = this.searchRoomName.valueChanges
      .pipe(
        startWith<string | Room>(''),
        map(value => typeof value === 'string' ? value : value.presentation),
        map(presentation => presentation ? this._filter(presentation) : this.options.slice())
      );

    this.getRoomsForFilter("");
    //setInterval(() => { this.getStudentList(); }, 20000 );
  }


  displayFn(room?: Room): string | undefined {
    return room ? room.presentation : undefined;
  }

  private _filter(presentation: string): Room[] {
    const filterValue = presentation.toLowerCase();

    //return this.options.filter(option => option.presentation.toLowerCase().indexOf(filterValue) === 0);
    return this.options.filter(option => option.presentation.toLowerCase().includes(filterValue));
  }

  getStudentList() {
    let test = new Date;
    console.log(test.toString());
  }

  startCourse(id: string, roomId: number) {
    let data;

    this.courseService.createCampusOnlineHolding(id, roomId)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            console.log(data);
            this.startedCourseOnlineHolding = data;

            this.courseService.startCourse(this.startedCourseOnlineHolding)
              .subscribe(
                (dataReturn2) => {
                  console.log(dataReturn2);
                },
                (err2) => {
                  console.log(err2);
                }
              );

            this.getCourseById();
          },
          (err) => {
            console.log(err);
          }
        );
  }

  finishCourse() {
      this.courseService.finishCourse(this.startedCourseOnlineHolding)
          .subscribe(
            (dataReturn) => {
              console.log(dataReturn);
            },
            (err) => {
              console.log(err);
            }
          );
  }

  cancelCourse() {
    this._dialogService.openConfirm({
      message: 'Wollen Sie diesen Kurs wirklich abbrechen? Der Kurs wird danach aus dem System entfernt! ',
      disableClose: false, // defaults to false
      viewContainerRef: this._viewContainerRef, //OPTIONAL
      title: 'Kurs abbrechen', //OPTIONAL, hides if not provided
      cancelButton: 'Nein', //OPTIONAL, defaults to 'CANCEL'
      acceptButton: 'Ja', //OPTIONAL, defaults to 'ACCEPT'
      width: '500px', //OPTIONAL, defaults to 400px
    }).afterClosed().subscribe((accept: boolean) => {
      if (accept) {
        console.log("JA");
        this.courseService.cancelCourse(this.startedCourseOnlineHolding)
          .subscribe(
            (dataReturn) => {
              console.log(dataReturn);
            },
            (err) => {
              console.log(err);
            }
          );
      } else {
        console.log("NEIN");
      }
    });
  }

  onSearchCourseNameKeyUp() {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                this.offset = 0;
                this.getCourses(this.raumId);
          }, 700
      );
  }

  getRoomsForFilter(filter: string) {
    let data;
    this.roomService.getRoom(filter)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
//            console.log(data.results);
            this.options = data.results;
          },
          (err) => {
            console.log(err);
          }
        );
  }

  onSearchRoomNameChange() {
      let data;
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                if(this.searchRoomName.value) {
                  this.roomService.getRoomById(this.searchRoomName.value.id)
                    .subscribe(
                      (dataReturn) => {
                        data = dataReturn;
                        this.raumId = data.properties.campusonline.id;
                        this.offset = 0;
                        this.getCourses(this.raumId);
                      },
                      (err) => {
                        console.log(err);
                      }
                    );
                } else {
                  this.raumId = 0;
                  this.getCourses(this.raumId);
                }
          }, 700
      );
  }

  onSearchDateChange() {
    this.offset = 0;
    this.searchCourseInAllRooms();
  }

  searchCourseInAllRooms() {
    if(this.searchRoomName.value == "") {
      this.raumId = 0;
    }

    console.log(this.searchDate.value);
    if(this.searchDate.value) {
        this.searchDate.value.setHours(0);
        this.startGT = this.searchDate.value.toISOString().split(".")[0];
        this.searchDate.value.setHours(23);
        this.searchDate.value.setMinutes(59);
        this.startLT = this.searchDate.value.toISOString().split(".")[0];

        this.getCourses(this.raumId);
    } else {
      let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
      startGTDate.setDate(startGTDate.getDate() - 6);
      startGTDate.setMinutes(0);
      startGTDate.setHours(0);
      let startLTDate = new Date();
      startLTDate.setDate(startLTDate.getDate() + 7);
      startLTDate.setMinutes(59);
      startLTDate.setHours(23);

      this.startGT = startGTDate.toISOString().split(".")[0];
      this.startLT = startLTDate.toISOString().split(".")[0];
    }

    this.getCourses(this.raumId);
    this.allRoomSearch = true;
  }

  getCourses(raumNr: number) {
    this.toggleOverlayStarSyntax();
    let data;
    this.courseService.getCourses(this.offset, raumNr, this.startGT, this.startLT, this.searchCourseName.value)
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
              this.runningCourse = true;
            }

            if(counter == this.coursesArray.length) {
              if(this.startedCourseOnlineHolding) {
                this.getCourseById();
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
            this.runningCourse = true;
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

  checkoutStudent() {
    console.log("CHECKOUT");
  }

}
