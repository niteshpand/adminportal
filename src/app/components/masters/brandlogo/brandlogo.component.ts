import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  selector: 'app-brandlogo',
  templateUrl: './brandlogo.component.html',
  styleUrls: ['./brandlogo.component.scss'],
})
export class BrandlogoComponent implements OnInit, OnDestroy {
  addForm: FormGroup;
  buttonText: string;
  dbops: DbOperation;
  objRows: any[] = [];
  objRow: any;
  addedImagePath: string = 'assets/Images/noimage.png';
  fileToUpload: any;

  @ViewChild('nav') elnav: any;
  formErrors = {
    name: '',
  };
  @ViewChild('file') elFile: ElementRef;
  validationMessage = {
    name: {
      required: 'Name is required',
      minlength: 'Name cannot be less than 1 char long',
      maxlength: 'Name cannot be less than 10 char long',
      validCharField: 'Name must be contains char and space only',
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
          Validators.minLength(1),
          Validators.maxLength(10),
          CharFieldValidator.validCharField,
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

  upload(files: any) {
    if (files.length === 0) {
      return;
    }
    let type = files[0].type;
    if (type.match(/image\/*/) == null) {
      this._toaster.error('Please Upload a Valid Image!!', 'Brand Logo Master');
      this.elFile.nativeElement.value = '';
      this.addedImagePath = 'assets/Images/noimage.png';
    }
    this.fileToUpload = files[0];
    //Read Image
    let reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.addedImagePath = reader.result.toString();
    };
  }

  Submit() {
    if (this.addForm.invalid) {
      return;
    }
    if (this.dbops === DbOperation.create && !this.fileToUpload) {
      this._toaster.error('Please Upload an Image', 'Brand Logo Master');
      return;
    }
    const formData = new FormData();
    formData.append('Id', this.addForm.value.id);
    formData.append('Name', this.addForm.value.name);
    formData.append('Image', this.fileToUpload, this.fileToUpload.name);

    switch (this.dbops) {
      case DbOperation.create:
        this._httpService
          .postImage(environment.BASE_API_PATH + 'BrandLogo/Save', formData)
          .subscribe((res) => {
            if (res.isSuccess) {
              this._toaster.success('Record Saved !!', 'BrandLogo Master');
              this.resetForm();
            } else {
              this._toaster.error(res.error[0], 'BrandLogo Master');
            }
          });
        break;
      case DbOperation.update:
        this._httpService
          .postImage(environment.BASE_API_PATH + 'BrandLogo/Update/', formData)
          .subscribe((res) => {
            if (res.isSuccess) {
              this._toaster.success('Record Updated !!', 'BrandLogo Master');
              this.resetForm();
            } else {
              this._toaster.error(res.errors[0], 'BrandLogo Master');
            }
          });
        break;
    }
  }
  cancelForm() {
    this.addForm.reset({
      id: 0,
      name: '',
    });
    this.buttonText = 'Add';
    this.elFile.nativeElement.value = '';
    this.addedImagePath = 'assets/Images/noimage.png';
    this.dbops = DbOperation.create;
  }
  resetForm() {
    this.addForm.reset({
      id: 0,
      name: '',
    });
    this.buttonText = 'Add';
    this.elFile.nativeElement.value = '';
    this.addedImagePath = 'assets/Images/noimage.png';
    this.dbops = DbOperation.create;
    this.getData();
    this.elnav.select('viewtab');
  }
  getData() {
    this._httpService
      .get(environment.BASE_API_PATH + 'BrandLogo/getAll')
      .subscribe((res) => {
        if (res.isSuccess) {
          this.objRows = res.data;
        } else {
          this._toaster.error(res.errors[0], 'BrandLogo Master');
        }
      });
  }
  Edit(id: number) {
    this.buttonText = 'Update';
    this.dbops = DbOperation.update;
    this.elnav.select('addtab');

    this.objRow = this.objRows.find((x) => x.id === id);
    this.addForm.patchValue(this.objRow);
    this.addedImagePath = this.objRow.imagePath;
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
            .post(environment.BASE_API_PATH + 'BrandLogo/Delete/', obj)
            .subscribe((res) => {
              if (res.isSuccess) {
                // this._toaster.success('Record Deleted !!', 'BrandLogo Master');
                swalWithBootstrapButtons.fire({
                  title: 'Deleted!',
                  text: 'Your Record has been deleted.',
                  icon: 'success',
                });
                this.getData();
              } else {
                this._toaster.error(res.errors[0], 'BrandLogo Master');
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
    });
    this.buttonText = 'Add';
    this.elFile.nativeElement.value = '';
    this.addedImagePath = 'assets/Images/noimage.png';
    this.dbops = DbOperation.create;
  }
}
