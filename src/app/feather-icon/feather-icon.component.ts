import { Component, Input, OnInit } from '@angular/core';
import * as feather from 'feather-icons';

@Component({
  selector: 'app-feather-icon',
  templateUrl: './feather-icon.component.html',
  styleUrls: ['./feather-icon.component.scss'],
})
export class FeatherIconComponent implements OnInit {
  constructor() {}
  @Input('icon') feathericon: any;
  ngOnInit() {}
  ngAfterViewInit() {
    feather.replace();
  }
}
