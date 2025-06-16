import { Component, OnInit } from '@angular/core';
import { CollapseService } from '../../services/collapse.service';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../interface/menu.interface';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  userImage: string = '/assets/Images/user.png';
  logoImage: string = '/assets/Images/logo.png';
  fullName: string = '';
  emailId: string = '';
  menuItems: Menu[] = [];

  constructor(private _menuService: MenuService) {}
  ngOnInit(): void {
    let userDetails = JSON.parse(localStorage.getItem('userDetails'));
    // this.fullName = `${userDetails} ${userDetails}`;
    // this.emailId = `${userDetails.email}`;
    this.userImage =
      userDetails?.imagePath == '' || userDetails?.imagePath == null
        ? '/assets/Images/user.png'
        : global.BASE_USERS_IMAGES_PATH + userDetails?.imagePath;
    this.menuItems = this._menuService.MENUITEMS;
  }
  toggleNavActive(menuItem){}
}
