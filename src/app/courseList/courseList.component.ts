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
import {StudentService } from '../services/student.service';
import { ITdDataTableColumn } from '@covalent/core/data-table';
import { TdLoadingService } from '@covalent/core/loading';

import {CampusOnlineHoldings, CampusonlineholdingStudent, RunningCourse} from '../base/campusonlineholding';
import {Autocomplete} from '../base/autocomplete';
import {Student} from '../base/student';
import {PagingComponent} from '../paging/paging.component';

export interface User {
  presentation: string;
}

@Component({
  selector: 'courseList',
  templateUrl: './courseList.component.html'
})
export class CourseListComponent implements OnInit {
  @ViewChild('pagingComp', {static: false}) pagingComponent: PagingComponent;

  overlayStarSyntax: boolean = false;

  private raumId : number = 0;
  private vortragendenId: number = 0;
  private startGT : string = "";
  private startLT : string = "";
  private offset : number= 0;

  private coursesArray = [];

  options: Autocomplete[] = [];
  optionsVortragende: Autocomplete[] = [];

  lastStartedCourseOnlineHolding : CampusOnlineHoldings;
  arrStartedCourseOnlineHolding = [];
  private mapStartedCampusOnlineHoldings  = new Map<number, RunningCourse>();
  private emptyCampusonlineHoldingStudent : CampusonlineholdingStudent = {
    manual_entries: [],
    entries: [],
    countStudentInLV: 0,
    countStundentLeaveLV: 0,
    countStudentDiscardLV: 0,
    countManualStudentInLV: 0,
    countManualStundentLeaveLV: 0,
    countManualStudentDiscardLV: 0
  }

  runningCourse: boolean= false;
  cancelCourse: boolean= false;
  finsihCourse: boolean= false;

  private timeOut;
  private allRoomSearch: boolean  = false;

//Variablen für die Suche
  searchCourseName = new FormControl();
  searchRoomName = new FormControl();
  searchVortragenden = new FormControl();
  searchDate = new FormControl();
  minDate: Date = new Date();
  maxDate: Date = new Date();

  searchStudentMatrikelNr = new FormControl();

  filteredOptions: Observable<Autocomplete[]>;
  filteredVortragendeOptions: Observable<Autocomplete[]>;

  constructor(
    formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService,
    private roomService: RoomService,
    private studentService: StudentService,
    private renderer: Renderer2,
    private _loadingService: TdLoadingService,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private dateAdapter: DateAdapter<Date>
  ) {

    this.dateAdapter.setLocale('de-DE');
    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.raumId = params['raum'];
    });
  }

  ngOnInit() {
    this.toggleOverlayStarSyntax();
    this.checkCourseIsRunningInRoom();
    this.searchDate.setValue(new Date());

    this.filteredOptions = this.searchRoomName.valueChanges
      .pipe(
        startWith<string | Autocomplete>(''),
        map(value => typeof value === 'string' ? value : value.presentation),
        map(presentation => presentation ? this._filter(presentation) : this.options.slice())
      );

    this.filteredVortragendeOptions = this.searchVortragenden.valueChanges
      .pipe(
        startWith<string | Autocomplete>(''),
        map(value => typeof value === 'string' ? value : value.presentation),
        map(presentation => presentation ? this._filterVortragende(presentation) : this.optionsVortragende.slice())
      );

    this.minDate.setDate(this.minDate.getDate() - 6)
    this.maxDate.setDate(this.maxDate.getDate() + 7)

    //setInterval(() => { this.getStudentList(); }, 5000 );
  }

  displayFn(room?: Autocomplete): string | undefined {
    return room ? room.presentation : undefined;
  }

  displayFnVortragende(vortragende?: Autocomplete): string | undefined {
    return vortragende ? vortragende.presentation : undefined;
  }

  private _filter(presentation: string): Autocomplete[] {
    const filterValue = presentation.toLowerCase();

    //return this.options.filter(option => option.presentation.toLowerCase().indexOf(filterValue) === 0);
    return this.options.filter(option => option.presentation.toLowerCase().includes(filterValue));
  }

  private _filterVortragende(presentation: string): Autocomplete[]  {
    const filterValue = presentation.toLowerCase();

    return this.optionsVortragende.filter(optionVortragende => optionVortragende.presentation.toLowerCase().includes(filterValue));
  }

//Kurs Namen Suche
  onSearchCourseNameKeyUp() {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                this.offset = 0;
                this.getCourses(this.raumId);
          }, 700
      );
  }
//Vortragenden Suche
  onSearchVortragendenNameChange() {
      let data;
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                if(this.searchVortragenden.value.id) {
                  this.vortragendenId = this.searchVortragenden.value.id
                } else {
                  this.vortragendenId = 0
                }
                this.getCourses(this.raumId);
          }, 700
      );
  }
//Autocomplete Vortragender
  onSearchVortragendenNameKeyUp() {
    let data;
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(
            () => {
              if(this.searchVortragenden.value.length >= 4) {
                this.optionsVortragende = []
                this.getVortragendeForFilter(this.searchVortragenden.value, "")
              }
        }, 400
    );
  }
//Filter Raum Bezeichnung geändert
  onSearchRoomNameChange() {
      let data;
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                if(this.searchRoomName.value.id) {
                  this.raumId = this.searchRoomName.value.id;
                  this.offset = 0;
                  this.getCourses(this.raumId);
                } else {
                  this.raumId = 0;
                  this.getCourses(this.raumId);
                }
          }, 700
      );
  }
//Filter Raum Bezeichnung geändert
  onSearchRoomNameKeyUp() {
      let data;
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                this.options = []
                if(this.searchRoomName.value.length >= 2) {
                  this.getRoomsForFilter(this.searchRoomName.value, "")
                } else if (this.searchRoomName.value.length == 0) {
                  this.raumId = 0;
                  this.getCourses(this.raumId)
                }
          }, 400
      );
  }
//Studierenden Suche nach Matrikelnummer
  onSearchStudentMatrikelNrKeyUp(campusonlineholdingID) {
      let data;
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(
              () => {
                let tmpStartedCampusOnlineHolding = this.mapStartedCampusOnlineHoldings.get(campusonlineholdingID)
                tmpStartedCampusOnlineHolding.campusonlineholdingStudentSearch = []
                this.mapStartedCampusOnlineHoldings.set(campusonlineholdingID, tmpStartedCampusOnlineHolding)
                //AccreditedStudent muss nur einmalig beim ersten Aufruf geholt werden, da es danach gespeichert wird
                if(tmpStartedCampusOnlineHolding.campusonlineholdingAccreditedStudent.length === 0) {
                  this.studentService.getAccreditedStudentListFromCourseonlineholding(tmpStartedCampusOnlineHolding.campusonlineholding)
                    .subscribe(
                      (dataReturn) => {
                        data = dataReturn as any;
                        tmpStartedCampusOnlineHolding.campusonlineholdingAccreditedStudent = data.accredited
                        this.mapStartedCampusOnlineHoldings.set(campusonlineholdingID, tmpStartedCampusOnlineHolding)
                        this.getStudentsForFilter(campusonlineholdingID, this.searchStudentMatrikelNr.value)
                      },
                      (err) => {
                        console.log(err)
                      }
                  );
                } else {
                  this.getStudentsForFilter(campusonlineholdingID, this.searchStudentMatrikelNr.value)
                }

          }, 700
      );
  }
//Datumssuche
  onSearchDateChange() {
    this.offset = 0;

    if (this.searchDate.value) {
      let tmpStart = this.searchDate.value;
      tmpStart.setMinutes(tmpStart.getMinutes() - tmpStart.getTimezoneOffset());
      tmpStart.setMinutes(1);
      this.startGT = tmpStart.toISOString().split(".")[0];

      tmpStart.setMinutes(59);
      tmpStart.setHours(23);
      this.startLT = tmpStart.toISOString().split(".")[0];
    }

    this.searchCourseInAllRooms();
  }
//Ergebnisse der Vortragenden für Filter
  getVortragendeForFilter(searchString: string = "", next: string = "") {
    let data;
    this.courseService.getVortragende(searchString, next)
        .subscribe(
          (dataReturn) => {
            data = dataReturn
            data.results.map(val => this.optionsVortragende.push(val));

            if(data.next) {
              this.getVortragendeForFilter(searchString, data.next);
            } else {
              //console.log(this.options);
            }
          },
          (err) => {
            console.log(err);
          }
        );
  }
//Ergebnisse der Räume für Filter
  getRoomsForFilter(searchString: string = "", next: string = "") {
    let data;
    this.roomService.getRoom(searchString, next)
        .subscribe(
          (dataReturn) => {
            data = dataReturn
            //this.options = data.results;
            data.results.map(val => this.options.push(val));
            if(data.next) {
              //this.getRoomsForFilter(searchString, data.next);
            } else {
              //console.log(this.options);
            }
            if(this.options.length == 1) {
              this.raumId = this.options[0].id
              this.getCourses(this.raumId);
            }
          },
          (err) => {
            console.log(err);
          }
        );
  }
//Ergebnisse der Studierenden für Filter
  getStudentsForFilter(campusonlineholdingID: number, searchString: string = "") {
    if(searchString.length >= 3) {
      let tmpStartedCampusOnlineHolding = this.mapStartedCampusOnlineHoldings.get(campusonlineholdingID)
      tmpStartedCampusOnlineHolding.campusonlineholdingStudentSearch = tmpStartedCampusOnlineHolding.campusonlineholdingAccreditedStudent.filter(x => x.last_name.toLowerCase().includes(searchString.toLowerCase()))
      this.mapStartedCampusOnlineHoldings.set(campusonlineholdingID, tmpStartedCampusOnlineHolding)
    }
  }

//Suche in allen Räumen (Filterfunktionen werden aktifiert)
  searchCourseInAllRooms() {
    if(this.searchRoomName.value == "" || !this.searchRoomName.value) {
      this.raumId = 0;
    }
    if(this.allRoomSearch == false || !this.searchDate.value || this.searchDate.value === null) {
      let startGTDate = new Date();
      let startLTDate = new Date();

      if(!this.searchDate.value|| this.searchDate.value === null) {
        startGTDate.setDate(startGTDate.getDate() - 6);
        startLTDate.setDate(startLTDate.getDate() + 7);
      }
      startGTDate.setMinutes(0);
      startGTDate.setHours(0);

      startLTDate.setMinutes(59);
      startLTDate.setHours(23);

      this.startGT = startGTDate.toISOString().split(".")[0];
      this.startLT = startLTDate.toISOString().split(".")[0];
    }
    this.getCourses(this.raumId);
    this.allRoomSearch = true;
    this.cancelCourse = false;
  }

// Kurs erstellen
  startCourseCheck(startedCourse) {
    if(this.arrStartedCourseOnlineHolding.length > 0) {
      let arrCurrentOnlineHolding = [];
      let startDateNewCourse: Date = new Date();
      let endDateNewCourse: Date = new Date();
      let startDateCurrentCourse: Date = new Date();
      let endDateCurrentCourse: Date = new Date();
      if(startedCourse.start) startDateNewCourse = new Date(startedCourse.start)
      if(startedCourse.end) endDateNewCourse = new Date(startedCourse.end)
      this.mapStartedCampusOnlineHoldings.forEach((startedCampusOnlineHolding, key) => {
        if(startedCampusOnlineHolding.campusonlineholdingData) {
          if(startedCampusOnlineHolding.campusonlineholdingData.start) startDateCurrentCourse = new Date(startedCampusOnlineHolding.campusonlineholdingData.start)
          if(startedCampusOnlineHolding.campusonlineholdingData.end) endDateCurrentCourse = new Date(startedCampusOnlineHolding.campusonlineholdingData.end)
          if(endDateNewCourse.getTime() <= startDateCurrentCourse.getTime() || startDateNewCourse.getTime() >= endDateCurrentCourse.getTime()) {
            arrCurrentOnlineHolding.push(startedCampusOnlineHolding)
          }
        }
      });
      if(arrCurrentOnlineHolding.length > 0) {
        this._dialogService.openConfirm({
          message: 'Es können nur Lehrveranstaltungen parallel abgehalten werden, die im selben Zeitraum eingetragen wurden! Wenn Sie diese Lehrveranstaltung starten, werden alle in diesem Raum gestartete Lehrveranstaltungen vorher beendet! \nWollen Sie wirklich abbrechen?',
          disableClose: false, // defaults to false
          viewContainerRef: this._viewContainerRef, //OPTIONAL
          title: 'Lehrveranstaltung starten', //OPTIONAL, hides if not provided
          cancelButton: 'Nein', //OPTIONAL, defaults to 'CANCEL'
          acceptButton: 'Ja, abbrechen', //OPTIONAL, defaults to 'ACCEPT'
          width: '500px', //OPTIONAL, defaults to 400px
        }).afterClosed().subscribe((accept: boolean) => {
          if (accept) {
            arrCurrentOnlineHolding.forEach((currentOnlineHolding, key) => {
              this.arrStartedCourseOnlineHolding.splice(this.arrStartedCourseOnlineHolding.indexOf(currentOnlineHolding.campusonlineholdingData.id))
              this.mapStartedCampusOnlineHoldings.delete(currentOnlineHolding.campusonlineholding.id)
            });
            this.startCourse(startedCourse)
          } else {
            console.log("nein")
          }
        });
      } else {
        this.startCourse(startedCourse)
      }
    } else {
      this.startCourse(startedCourse)
    }
  }
  startCourse(startedCourse) {
    let data;
    this.courseService.createCampusOnlineHolding(startedCourse.id, startedCourse.room.id)
        .subscribe(
          (dataReturn) => {
            this.finsihCourse = false;
            data = dataReturn;
            this.lastStartedCourseOnlineHolding = data;
            this.courseService.startCourse(data)
              .subscribe(
                (dataReturn2) => {
                  this.cancelCourse = false;
                  this.getCourseDataById();
                },
                (err2) => {
                  console.log(err2);
                }
              );
          },
          (err) => {
            console.log(err);
          }
        );
  }

//Kurs beenden
  finishCourse(courseOnlineHoldingId: number) {
      this.courseService.finishCourse(this.mapStartedCampusOnlineHoldings.get(courseOnlineHoldingId).campusonlineholding)
          .subscribe(
            (dataReturn) => {
              this.finsihCourse = true;
              this.lastStartedCourseOnlineHolding = null;
              let campusHoldingDataId = this.mapStartedCampusOnlineHoldings.get(courseOnlineHoldingId).campusonlineholdingData
              this.arrStartedCourseOnlineHolding.splice(this.arrStartedCourseOnlineHolding.indexOf(campusHoldingDataId), 1)
              this.mapStartedCampusOnlineHoldings.delete(courseOnlineHoldingId)
              this.getCourses(this.raumId);
              this.runningCourse = false;
            },
            (err) => {
              console.log(err);
            }
          );
  }
//Kurs abbrechen
  cancelRunningCourse(courseOnlineHoldingId: number) {
    this._dialogService.openConfirm({
      message: 'Wenn Sie die Lehrveranstaltung abbrechen, werden keine Anwesenheitszeiten für diese Lehrveranstaltung im System gespeichert. \nWollen Sie wirklich abbrechen?',
      disableClose: false, // defaults to false
      viewContainerRef: this._viewContainerRef, //OPTIONAL
      title: 'Lehrveranstaltung abbrechen', //OPTIONAL, hides if not provided
      cancelButton: 'Nein', //OPTIONAL, defaults to 'CANCEL'
      acceptButton: 'Ja, abbrechen', //OPTIONAL, defaults to 'ACCEPT'
      width: '500px', //OPTIONAL, defaults to 400px
    }).afterClosed().subscribe((accept: boolean) => {
      if (accept) {
        this.courseService.cancelCourse(this.mapStartedCampusOnlineHoldings.get(courseOnlineHoldingId).campusonlineholding)
          .subscribe(
            (dataReturn) => {
              this.cancelCourse = true;
              this.lastStartedCourseOnlineHolding = null;
              let campusHoldingDataId = this.mapStartedCampusOnlineHoldings.get(courseOnlineHoldingId).campusonlineholdingData
              this.arrStartedCourseOnlineHolding.splice(this.arrStartedCourseOnlineHolding.indexOf(campusHoldingDataId), 1)
              this.mapStartedCampusOnlineHoldings.delete(courseOnlineHoldingId)
              this.getCourses(this.raumId);
              this.runningCourse = false;
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

//Kurse für die Liste
  getCourses(raumNr: number) {
    this.toggleOverlayStarSyntax();
    let data;
    let searchCourseName = this.searchCourseName.value;
    if(this.searchCourseName.value === null)  {
      searchCourseName = "";
    }
    this.courseService.getCourses(this.offset, raumNr, this.startGT, this.startLT, searchCourseName, this.vortragendenId)
        .subscribe(
          (dataReturn) => {
            data = dataReturn;
            this.pagingComponent.setPagingDatas(data.count);
            this.coursesArray = data.results;

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

//Läuft ein Kurs in der Liste
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
              this.lastStartedCourseOnlineHolding = data.results[0];
              this.arrStartedCourseOnlineHolding.push(course.id)
              this.mapStartedCampusOnlineHoldings.set(this.lastStartedCourseOnlineHolding.id, {
                campusonlineholding: this.lastStartedCourseOnlineHolding,
                campusonlineholdingData: course,
                campusonlineholdingStudent: this.emptyCampusonlineHoldingStudent,
                campusonlineholdingAccreditedStudent: [],
                campusonlineholdingStudentSearch: []
              })

              this.runningCourse = true;
              this.getStudentList();
            }
            if(counter == this.coursesArray.length) {
//              if(this.lastStartedCourseOnlineHolding) {
//                this.getCourseDataById();
//              }
              this.toggleOverlayStarSyntax();
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

//läuft ein Kurs im Raum
  checkCourseIsRunningInRoom() {
    let data;
    this.courseService.checkCourseIsRunningInRoom(this.raumId)
      .subscribe(
        (dataReturn) => {
          data = dataReturn;
          if(data.results.length > 0) {
            this.lastStartedCourseOnlineHolding = data.results[0];
            this.getStudentList();
            this.getCourseDataById();
            this.runningCourse = true;
          }
          this.searchRoomName.setValue("");
          this.searchCourseName.setValue("");

          let startGTDate = new Date(); //Start 2018-01-17T09:30:00+01:00
          startGTDate.setMinutes(startGTDate.getMinutes() - 15 - startGTDate.getTimezoneOffset());
          let startLTDate = new Date();
          startLTDate.setMinutes(startLTDate.getMinutes() + 15 - startLTDate.getTimezoneOffset());

          this.startGT = startGTDate.toISOString().split(".")[0];
          this.startLT = startLTDate.toISOString().split(".")[0];

          this.getCourses(this.raumId);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getCourseDataById() {
    let data;
    this.courseService.getCourseDataById(this.lastStartedCourseOnlineHolding.course_group_term)
      .subscribe(
        (dataReturn) => {
          data = dataReturn;
          this.arrStartedCourseOnlineHolding.push(data.id)
          this.mapStartedCampusOnlineHoldings.set(this.lastStartedCourseOnlineHolding.id, {
            campusonlineholding: this.lastStartedCourseOnlineHolding,
            campusonlineholdingData: data,
            campusonlineholdingStudent: this.emptyCampusonlineHoldingStudent,
            campusonlineholdingAccreditedStudent: [],
            campusonlineholdingStudentSearch: []
          })
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

//Studierendenlisten:
//Studierendenliste pro Course aktualisieren
  getStudentList() {
    let data;
    this.mapStartedCampusOnlineHoldings.forEach((startedCampusOnlineHolding, key) => {
      this.studentService.getStudentListFromCourseonlineholding(startedCampusOnlineHolding.campusonlineholding)
        .subscribe(
          (dataReturn) => {
            let tmpCampusonlineHoldingStudent : CampusonlineholdingStudent = {
                manual_entries: [],
                entries: [],
                countStudentInLV: 0,
                countStundentLeaveLV: 0,
                countStudentDiscardLV: 0,
                countManualStudentInLV: 0,
                countManualStundentLeaveLV: 0,
                countManualStudentDiscardLV: 0
            }
            data = dataReturn as any;
            for(let student of data.entries) {
              let tmpStudent: Student = {
                id: student.id,
                title: student.student.title,
                firstName: student.student.first_name,
                lastName: student.student.last_name,
                state: student.state,
                accredited: student.accredited ? "inGroup" : "notInGroup"
              }
              switch(student.state) {
                case "assigned": {
                  tmpCampusonlineHoldingStudent.countStudentInLV++
                  break;
                }
                case "canceled": {
                  tmpCampusonlineHoldingStudent.countStundentLeaveLV++
                  break;
                }
                case "left": {
                  tmpCampusonlineHoldingStudent.countStudentDiscardLV++
                  break;
                }
              }
              tmpCampusonlineHoldingStudent.entries.push(tmpStudent);
            }

            this.studentService.getManualStudentListFromCourseonlineholding(startedCampusOnlineHolding.campusonlineholding)
              .subscribe(
                (dataReturn) => {
                  data = dataReturn as any;
                  for(let student of data.manual_entries) {
                    let tmpStudent: Student = {
                      id: student.id,
                      title: student.student.title,
                      firstName: student.student.first_name,
                      lastName: student.student.last_name,
                      state: student.state,
                      accredited: student.accredited ? "inGroup" : "notInGroup"
                    }
                    switch(student.state) {
                      case "assigned": {
                        tmpCampusonlineHoldingStudent.countStudentInLV++
                        tmpCampusonlineHoldingStudent.countManualStudentInLV++
                        break;
                      }
                      case "canceled": {
                        tmpCampusonlineHoldingStudent.countStundentLeaveLV++
                        tmpCampusonlineHoldingStudent.countManualStundentLeaveLV++
                        break;
                      }
                      case "left": {
                        tmpCampusonlineHoldingStudent.countStudentDiscardLV++
                        tmpCampusonlineHoldingStudent.countManualStudentDiscardLV++
                        break;
                      }
                    }
                    tmpCampusonlineHoldingStudent.manual_entries.push(tmpStudent);
                  }

                  tmpCampusonlineHoldingStudent.entries.sort(function(a, b){
                      if(a.lastName < b.lastName) { return -1; }
                      if(a.lastName > b.lastName) { return 1; }
                      return 0;
                  })
                  tmpCampusonlineHoldingStudent.manual_entries.sort(function(a, b) {
                      if(a.lastName < b.lastName) { return -1; }
                      if(a.lastName > b.lastName) { return 1; }
                      return 0;
                  })

                  let tmpStartedCampusOnlineHolding = this.mapStartedCampusOnlineHoldings.get(key)
                  tmpStartedCampusOnlineHolding.campusonlineholdingStudent = tmpCampusonlineHoldingStudent
                  this.mapStartedCampusOnlineHoldings.set(key, tmpStartedCampusOnlineHolding)
                },
                (err) => {
                  console.log(err)
                }
            );
          },
          (err) => {
            console.log(err)
          }
      );
    });
  }

  checkoutStudent(student: Student) {
      this._dialogService.openConfirm({
        message: 'Wollen Sie diese Person "' + student.lastName + ' '+ student.firstName + '" tatsächlich aus dieser Lehrveranstaltung entfernen? ',
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Studierende*r entfernen', //OPTIONAL, hides if not provided
        acceptButton: 'Ja, entfernen', //OPTIONAL, defaults to 'ACCEPT'
        cancelButton: 'Nein', //OPTIONAL, defaults to 'CANCEL'
        width: '500px', //OPTIONAL, defaults to 400px
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          //console.log("JA");
          this.studentService.checkoutStudentFromCourseOnlineEntrie(student.id)
            .subscribe(
              (dataReturn) => {
                this.getStudentList();
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          console.log("NEIN");
        }
      //console.log(id);
    });
  }

  checkoutStudentManual(student: Student) {
      this._dialogService.openConfirm({
        message: 'Wollen Sie diese Person "' + student.lastName + ' '+ student.firstName + '" tatsächlich aus dieser Lehrveranstaltung entfernen? ',
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Studierende*r entfernen', //OPTIONAL, hides if not provided
        acceptButton: 'Ja, entfernen', //OPTIONAL, defaults to 'ACCEPT'
        cancelButton: 'Nein', //OPTIONAL, defaults to 'CANCEL'
        width: '500px', //OPTIONAL, defaults to 400px
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          //console.log("JA");
          this.studentService.checkoutManualStudentFromCourseOnlineEntrie(student.id)
            .subscribe(
              (dataReturn) => {
                this.getStudentList();
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          console.log("NEIN");
        }
      //console.log(id);
    });
  }

  leaveStudentManual(student: Student) {
      this._dialogService.openConfirm({
        message: 'Hat diese Person "' + student.lastName + ' '+ student.firstName + '" tatsächlich die Lehrveranstaltung verlassen? ',
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Studierende*r hat LV verlassen', //OPTIONAL, hides if not provided
        acceptButton: 'Ja', //OPTIONAL, defaults to 'ACCEPT'
        cancelButton: 'Nein', //OPTIONAL, defaults to 'CANCEL'
        width: '500px', //OPTIONAL, defaults to 400px
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          //console.log("JA");
          this.studentService.leaveManualStudentFromCourseOnlineEntrie(student.id)
            .subscribe(
              (dataReturn) => {
                this.getStudentList();
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          console.log("NEIN");
        }
      //console.log(id);
    });
  }

  checkinStudent(student, courseOnlineHoldingId: number) {
      this._dialogService.openConfirm({
        message: 'Wollen Sie diese Person "' + student.first_name + ' ' + student.last_name +'" zur Lehrveranstaltung hinzufügen? ',
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: 'Studierende*r hinzufügen', //OPTIONAL, hides if not provided
        acceptButton: 'Ja', //OPTIONAL, defaults to 'ACCEPT'
        cancelButton: 'Nein', //OPTIONAL, defaults to 'CANCEL'
        width: '500px', //OPTIONAL, defaults to 400px
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.studentService.manualCheckinStudent(student.id, this.mapStartedCampusOnlineHoldings.get(courseOnlineHoldingId).campusonlineholding)
            .subscribe(
              (dataReturn) => {
                let tmpStartedCampusOnlineHolding = this.mapStartedCampusOnlineHoldings.get(courseOnlineHoldingId)
                tmpStartedCampusOnlineHolding.campusonlineholdingStudentSearch = []
                this.mapStartedCampusOnlineHoldings.set(courseOnlineHoldingId, tmpStartedCampusOnlineHolding)
                this.searchStudentMatrikelNr.setValue("");
                this.getStudentList();
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          console.log("NEIN");
        }
      //console.log(id);
    });
  }
}
