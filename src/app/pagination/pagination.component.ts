import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnChanges {

  @Input('totalElements') totalElements = 0
  @Output("paginationChange") paginationChange = new EventEmitter<Pagination>();

  pageCountOptions = ['5', '10', '15', '30', '40', '50', '100']
  pages: number[] = [1];
  pagination: Pagination = { page: 1, count: 10}

  constructor() { }

  ngOnInit(): void {
    console.log("total elements " + this.totalElements)
    this.resetPages();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.resetPages()
  }


  private resetPages() {
    const pageNumbers = Math.ceil(this.totalElements / this.pagination.count)
    console.log("pageNumbers " + pageNumbers)
    this.pages = Array(pageNumbers).fill(1).map((value, index) => value + index)
  }

  setPage(page: number) {
    this.pagination.page = page;
    this.publishPaginationChange();
  }

  private publishPaginationChange() {
    this.paginationChange.emit(PaginationComponent.copy(this.pagination))
  }

  private static copy(value: any): any {
    return JSON.parse(JSON.stringify(value))
  }

  onPageCountChanged(pageCountList: string[]) {
    this.pagination.page = 1;
    this.pagination.count = parseInt(pageCountList[0])
    this.resetPages()
    this.publishPaginationChange();
  }
}

export interface Pagination {
  page: number;
  count: number
}
