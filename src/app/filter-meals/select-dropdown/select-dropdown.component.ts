import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';


@Component({
  selector: 'app-select-dropdown',
  templateUrl: './select-dropdown.component.html',
  styleUrls: ['./select-dropdown.component.scss']
})
export class SelectDropdownComponent implements OnInit, OnChanges {
  @Input("options") options: string[] = [];
  @Input("multiselect") multiselect = true
  @Input("defaultOption") defaultOption: any = null

  @Output() optionsChange = new EventEmitter<string[]>();

  checkedList: Option[];
  showDropDown: boolean;
  list: Option[]

  constructor() {
    this.options = []
    this.checkedList = [];
    this.showDropDown = false;
    this.list = []
  }

  ngOnInit(): void {
    this.updateList();
    if (this.defaultOption) {
      this.list.forEach(opt => opt.checked = this.defaultOption == opt.name)
      this.checkedList.push({ name: this.defaultOption, checked: true});
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateList();
  }

  private updateList() {
    this.list = this.options.map(option => new Option(option, this.checkedList.findIndex(opt => opt.name == option) !== -1));
  }

  onSelectionChanged(option: Option) {
    if (option.checked) {
      this.checkedList.push(option);
    } else {
      const index = this.checkedList.indexOf(option);
      this.checkedList.splice(index, 1);
    }

    //share checked list
    this.shareCheckedList();
  }

  onSingleOptionSelected(option: Option) {
    option.checked = true
    console.log(option)
    this.checkedList.splice(0, this.checkedList.length)
    this.list.forEach(opt => opt.checked = option.name == opt.name)
    this.checkedList.push(option);
    this.optionsChange.emit([option.name])
  }

  shareCheckedList() {
    this.optionsChange.emit(this.checkedList.map(option => option.name));
  }

  getSelectorLabel(): string {
    return this.checkedList.map(option => option.name).join(', ')
  }
}

class Option {
  name: string
  checked: boolean


  constructor(name: string, checked: boolean) {
    this.name = name;
    this.checked = checked;
  }
}
