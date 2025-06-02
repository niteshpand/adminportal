import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from 'src/app/shared/services/http.service';
import { MustMatchValidator } from 'src/app/shared/validations/validation.validator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  submitted: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private _toaster: ToastrService,
    private _httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.setLoginForm();
    this.setRegisterForm();
  }

  setLoginForm() {
    this.loginForm = this._fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  setRegisterForm() {
    this.registerForm = this._fb.group(
      {
        firstName: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(10),
          ]),
        ],
        lastName: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(10),
          ]),
        ],
        email: [
          '',
          Validators.compose([Validators.required, Validators.email]),
        ],
        userTypeId: [1],
        password: [
          '',
          Validators.pattern(
            '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/g'
          ),
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: MustMatchValidator('password', 'confirmPassword') }
    );
  }

  get ctrl() {
    return this.registerForm.controls;
  }
  login() {
    if (this.loginForm.get('username').value === '') {
      this._toaster.error('username is required !! ', 'Login');
    } else if (this.loginForm.get('password').value === '') {
      this._toaster.error('Password is required !!', 'Login');
    } else {
      if (this.loginForm.valid) {
        //Call API
        this._httpService
          .post(
            environment.BASE_API_PATH + 'UserMaster/Login/',
            this.loginForm.value
          )
          .subscribe((res) => {
            console.log(res);
            if (res.isSuccess) {
              alert('Login Success');
            }
          });
      }
    }
  }

  register(formData: FormGroup) {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    this._httpService
      .post(environment.BASE_API_PATH + 'UserMaster/Save', formData.value)
      .subscribe((res) => {
        if (res.isSuccess) {
          this._toaster.success(
            'Registration is successfully done !! ',
            'Registration'
          );
          this.registerForm.reset({
            firstName: [
              '',
              Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(10),
              ]),
            ],
            lastName: [
              '',
              Validators.compose([
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(10),
              ]),
            ],
            email: [
              '',
              Validators.compose([Validators.required, Validators.email]),
            ],
            userTypeId: [1],
            password: [
              '',
              Validators.pattern(
                '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/g'
              ),
            ],
            confirmPassword: ['', Validators.required],
          });
          this.submitted = false;
        } else {
          this._toaster.error(res.errors[0], 'Registration');
        }
      });
  }
}
