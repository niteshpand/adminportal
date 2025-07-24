import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from 'src/app/shared/services/http.service';
import { DbOperation } from 'src/app/shared/utility/db-operation';
import Swal from 'sweetalert2';
import {
  CharFieldValidator,
  NoWhitespaceValidator,
} from 'src/app/shared/validations/validation.validator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
})
export class ColorComponent implements OnInit {
  addForm: FormGroup;
  buttonText: string;
  dbops: DbOperation;
  objRows: any[] = [];
  objRow: any;
  @ViewChild('nav') elnav: any;
  formErrors = {
    name: '',
    code: '',
  };

  validationMessage = {
    name: {
      required: 'Name is required',
      minlength: 'Name cannot be less than 3 char long',
      maxlength: 'Name cannot be less than 10 char long',
      validCharField: 'Name must be contains char and space only',
      NoWhitespaceValidator: 'Only whitespace is not allowed',
    },
    code: {
      required: 'code is required',
      minlength: 'code cannot be less than 6 char long',
      maxlength: 'code cannot be less than 10 char long',
      NoWhitespaceValidator: 'Only whitespace is not allowed',
    },
  };
  constructor(
    private _httpService: HttpService,
    private _toaster: ToastrService,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setFormState();
    this.getData();
  }
  setFormState() {
    this.buttonText = 'Add';
    this.dbops = DbOperation.create;
    this.addForm = this._fb.group({
      id: [0],
      name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          CharFieldValidator.validCharField,
          NoWhitespaceValidator.noWhitespaceValidator,
        ]),
      ],
      code: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(10),
          NoWhitespaceValidator.noWhitespaceValidator,
        ]),
      ],
    });
    this.addForm.valueChanges.subscribe(() => {
      this.onValueChanges();
    });
  }

  onValueChanges() {
    if (!this.addForm) {
    }

    for (const field of Object.keys(this.formErrors)) {
      this.formErrors[field] = '';

      const control = this.addForm.get(field);

      if (control && control.dirty && control.invalid) {
        const message = this.validationMessage[field];
        for (let key of Object.keys(control.errors)) {
          if (key !== 'required') {
            this.formErrors[field] += message[key] + ' ';
          }
        }
      }
    }
  }
  get ctrl() {
    return this.addForm.controls;
  }
  Submit() {
    if (this.addForm.invalid) {
      return;
    }
    switch (this.dbops) {
      case DbOperation.create:
        this._httpService
          .post(
            environment.BASE_API_PATH + 'ColorMaster/Save',
            this.addForm.value
          )
          .subscribe((res) => {
            if (res.isSuccess) {
              this._toaster.success('Record Saved !!', 'Color Master');
              this.resetForm();
            } else {
              this._toaster.error(res.error[0], 'Color Master');
            }
          });
        break;
      case DbOperation.update:
        break;
    }
  }
  cancelForm() {
    this.addForm.reset({
      id: 0,
      name: '',
      code: '',
    });
    this.buttonText = 'Add';
    this.dbops = DbOperation.create;
  }
  resetForm() {
    this.addForm.reset({
      id: 0,
      name: '',
      code: '',
    });
    this.buttonText = 'Add';
    this.dbops = DbOperation.create;
    this.getData();
    this.elnav.select('viewtab');
  }
  getData() {
    this._httpService
      .get(environment.BASE_API_PATH + 'ColorMaster/getAll')
      .subscribe((res) => {
        if (res.isSuccess) {
          this.objRows = res.data;
        } else {
          this._toaster.error(res.errors[0], 'Color Master');
        }
      });
  }
  Edit(id: number) {
    this.buttonText = 'Update';
    this.dbops = DbOperation.update;
    this.elnav.select('addtab');

    this.objRow = this.objRows.find((x) => x.id === id);
    this.addForm.patchValue(this.objRow);
  }

  Delete(id: number) {
    let obj = {
      id: id,
    };
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this._httpService
            .post(environment.BASE_API_PATH + 'ColorMaster/Delete/', obj)
            .subscribe((res) => {
              if (res.isSuccess) {
                // this._toaster.success('Record Deleted !!', 'Color Master');
                swalWithBootstrapButtons.fire({
                  title: 'Deleted!',
                  text: 'Your Record has been deleted.',
                  icon: 'success',
                });
                this.getData();
              } else {
                this._toaster.error(res.errors[0], 'Color Master');
              }
            });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire({
            title: 'Cancelled',
            text: 'Your Record  is safe :)',
            icon: 'error',
          });
        }
      });
  }
  ngOnDestroy() {
    this.objRows = null;
    this.objRow = null;
  }
  tabChange(event: any) {
    this.addForm.reset({
      id: 0,
      name: '',
      code: '',
    });
    this.buttonText = 'Add';
    this.dbops = DbOperation.create;
  }
}
