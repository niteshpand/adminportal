import { Component, OnInit } from '@angular/core';
import { CollapseService } from '../../services/collapse.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  userImage: string = '/assets/Images/user.png';
  constructor(public _collapseService: CollapseService) {}

  ngOnInit(): void {
    let userDetails = JSON.parse(localStorage.getItem('userDetails'));
    this.userImage =
      userDetails?.imagePath == '' || userDetails?.imagePath == null
        ? '/assets/Images/user.png'
        : global.BASE_USERS_IMAGES_PATH + userDetails?.imagePath;
  }
  collapseSidebar() {
    this._collapseService.openSideBar = !this._collapseService.openSideBar;
  }
}
