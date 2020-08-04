import { Component, OnDestroy, OnInit } from '@angular/core';
import { DestroyObservable } from '@core/utils/destroy-observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InboxService } from '@core/services/inbox.service';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { RefDataService } from '@core/services/ref-data.service';
import { InboxStatus, InboxStatus_Fr } from '@enum/inbox-status.enum';
import * as moment from 'moment';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-inbox-filter',
  templateUrl: './inbox-filter.component.html',
  styleUrls: ['./inbox-filter.component.scss']
})
export class InboxFilterComponent extends DestroyObservable implements OnInit, OnDestroy {

  inboxFilters: FormGroup;
  categories$: BehaviorSubject<string[]>;
  statutes = Object.keys(InboxStatus);
  inboxStatus_Fr = InboxStatus_Fr;

  constructor(private _fb: FormBuilder,
              private _inboxService: InboxService,
              private _refDataService: RefDataService,
              private _authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.categories$ = this._refDataService.categories$;
    this.inboxFilters = this._fb.group({
      query: [this._inboxService.currentSearch],
      categories: [this._inboxService.currentFilters?.categories ? this._inboxService.currentFilters.categories : []],
      statutes: [this._inboxService.currentFilters?.statutes ?
        // tslint:disable-next-line:max-line-length
        this._inboxService.currentFilters.statutes : [InboxStatus.pending, InboxStatus.to_verify, InboxStatus.relevant, InboxStatus.wrong, InboxStatus.off_topic]],
      startDate: [this._inboxService.currentFilters?.startDate ? moment(this._inboxService.currentFilters.startDate, 'DD/MM/yyyy') : null],
      endDate: [this._inboxService.currentFilters?.endDate ? moment(this._inboxService.currentFilters.endDate, 'DD/MM/yyyy') : null],
      assignedTo: [this._inboxService.currentFilters?.assignedTo]
    });
    this.inboxFilters.valueChanges
      .pipe(
        startWith(this.inboxFilters.value),
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged())
      .subscribe(value => {
        this._inboxService.currentSearch = value.query;
        delete value.query;
        value.startDate = value.startDate ? value.startDate.format('DD/MM/yyyy') : null;
        value.endDate = value.endDate ? value.endDate.format('DD/MM/yyyy') : null;
        value.assignedTo = value.assignedTo ? this._authService.user.email : null;
        this._inboxService.currentFilters = value;
        this._inboxService.load().subscribe();
      });
  }

  ngOnDestroy() {
    this._inboxService.resetFilters();
  }

  get controls() {
    return this.inboxFilters.controls;
  }

}
