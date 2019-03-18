import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { IPageChangeEvent } from '@covalent/core/paging';

@Component({
  selector: 'paging',
  templateUrl: './paging.component.html'
})
export class PagingComponent implements OnInit {

  @Output('onPageChange') onPageChange: EventEmitter<IPageChangeEvent> = new EventEmitter();

  eventLinks: IPageChangeEvent;

  countArray: number = 0;
  countPages: number = 0;
  pageSize: number = 20;

  constructor() {
//    console.log("PagingConstructor");
  }

  ngOnInit() {
//    console.log("PagingInit");
  }

  setPagingDatas(count: number) {
    this.countArray = count;
    this.countPages = Math.ceil(this.countArray / 20);
  }

  changeLinks(event: IPageChangeEvent): void {
    this.eventLinks = event;
    this.onPageChange.emit(event);
  }
}
