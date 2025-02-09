import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FileService } from '@core/services/file.service';
import { FileTemplateCheckResume } from '@model/file-template-check-resume.model';
import { saveAs } from 'file-saver';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { WarningsDialogComponent } from './warnings-dialog/warnings-dialog.component';
import { FileHistoric } from '@model/file-historic.model';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ImportResponse } from '@model/import-response.model';
import { ConfigService } from '@core/services/config.service';

@Component({
  selector: 'app-intent-file',
  templateUrl: './intent-file.component.html',
  styleUrls: ['./intent-file.component.scss']
})
export class IntentFileComponent implements OnInit {

  importFileFormGroup: FormGroup;
  fileTemplateCheckResume: FileTemplateCheckResume;
  historicFiles: FileHistoric[];
  historicFilesFiltered: FileHistoric[];
  objectKeys = Object.keys;

  constructor(private _fb: FormBuilder,
              public fileService: FileService,
              private _dialog: MatDialog,
              private _toastService: ToastrService,
              private _configService: ConfigService,
              @Inject(Window) private _window: Window,
              private _toast: ToastrService) {
  }

  ngOnInit(): void {
    this._initForm();
    this._getHistoric();
  }

  get fileCtrl(): FormControl {
    return <FormControl> this.importFileFormGroup.get('file');
  }

  checkFile($event) {
    const file = $event.target.files[0];
    if (!file) {
      return;
    }
    const filesize = (file.size / 1024 / 1024);
    if (filesize > 10) {
      this._toast.error('Le poids du fichier doit être inférieur à 10Mb.', 'Fichier volumineux');
      return;
    }
    this.fileTemplateCheckResume = null;
    this.fileCtrl.setValue(file);
    this.fileCtrl.disable();
    this._checkFile(file);
    $event.target.value = '';
  }

  uploadFile() {
    if (!this.importFileFormGroup.valid) {
      return;
    }
    this.fileService.upload(this.importFileFormGroup.getRawValue())
      .pipe(finalize(() => {
        this.resetFile();
      }))
      .subscribe((response: ImportResponse) => {
        this._toastService.success(`Les connaissances ont bien été importées.
        ${response.intents} connaissances ont été ajoutées ou modifiées.`);
        this._configService.getConfig().subscribe();
      });
  }

  exportFile() {
    this.fileService.export().subscribe(res => {
      const blob = new Blob([res], {
        type: 'application/vnd.ms-excel'
      });

      saveAs(blob, `BASE_CONNAISSANCE.xlsx`);
    });
  }

  get historicFilePath() {
    return `${this._window.location.origin}/historic/`;
  }

  hasFileErrors() {
    return (Object.keys(this.fileTemplateCheckResume?.errors).length > 0);
  }

  hasFileWarnings() {
    return (Object.keys(this.fileTemplateCheckResume.warnings).length > 0);
  }

  resetFile() {
    this.fileTemplateCheckResume = null;
    this.fileCtrl.setValue(null);
  }

  openDialog(isError: boolean, detailsArray: { [key: string]: string }): void {
    this._dialog.open(WarningsDialogComponent, {
      width: '100%',
      height: '90%',
      data: {isError: isError, details: detailsArray}
    });
  }

  showFullHistoric() {
    if (!this.historicFilesFiltered || this.historicFilesFiltered.length > 3) {
      return this.historicFilesFiltered = this.historicFiles.slice(this.historicFiles.length - 3, this.historicFiles.length);
    }
    this.historicFilesFiltered = this.historicFiles;
  }

  /**
   * PRIVATE FUNCTIONS
   */

  private _initForm() {
    this.importFileFormGroup = this._fb.group({
      file: ['', Validators.required],
      deleteIntents: [false, Validators.required],
      oldURL: ['', Validators.maxLength(255)],
      newURL: [window.location.origin, Validators.maxLength(255)]
    });
  }

  private _checkFile(file: File) {
    this.fileService.checkFile(file).subscribe((response: FileTemplateCheckResume) => {
      this.fileTemplateCheckResume = response;
    }, error => {
      this.resetFile();
    });
  }

  private _getHistoric() {
    this.fileService.getHistoric().subscribe(files => {
      this.historicFiles = files;
      this.showFullHistoric();
    });
  }

}
