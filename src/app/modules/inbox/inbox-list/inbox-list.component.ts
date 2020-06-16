import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Inbox } from '@model/inbox.model';
import { InboxService } from '@core/services/inbox.service';
import { PaginationHelper } from '@model/pagination-helper.model';
import * as moment from 'moment';
import { InboxStatus, InboxStatus_Fr } from '@enum/inbox-status.enum';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '@core/services/user.service';
import { User } from '@model/user.model';
import { detailInOutAnimation } from '../../shared/components/chatbot-list-item/chatbot-list-item.animation';
import { ConfigService } from '@core/services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { MediaListDialogComponent } from '../../intent/create-edit-intent/intent-form/response-form/media-list/media-list-dialog.component';
import { InboxAssignationDialogComponent } from './inbox-assignation-dialog/inbox-assignation-dialog.component';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss'],
  animations: [
    detailInOutAnimation
  ]
})
export class InboxListComponent implements OnInit {

  inboxes$: BehaviorSubject<Inbox[]>;
  loading$: Observable<boolean>;
  processing$: Observable<boolean>;
  users$: Observable<User[]>;
  pagination: PaginationHelper;
  inboxStatus_Fr = InboxStatus_Fr;
  inboxIntent: number;
  inboxPreview: number;

  constructor(public inboxService: InboxService,
              private _toastr: ToastrService,
              private _configService: ConfigService,
              private _userService: UserService,
              private _dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.loading$ = this.inboxService.loading$;
    this.processing$ = this.inboxService.processing$;
    this.inboxes$ = this.inboxService.entities$;
    this.users$ = this._userService.entities$;
    this.pagination = this.inboxService.pagination;
  }

  getDiffDate(inbox: Inbox) {
    return moment.duration(moment().diff(inbox.timestamp * 1000)).humanize();
  }

  getBadgeClass(status: InboxStatus) {
    switch (status) {
      case InboxStatus.pending:
        return 'badge-staked-warning';
      case InboxStatus.to_verify:
        return 'badge-staked-success';
      case InboxStatus.confirmed:
        return 'badge-staked-black';
      case InboxStatus.archived:
        return 'badge-staked-black';
    }
  }

  selectInbox(inboxId: number, intent: boolean) {
    if (intent) {
      this.inboxPreview = null;
      this.inboxIntent = (this.inboxIntent === inboxId) ? null : inboxId;
    } else {
      this.inboxIntent = null;
      this.inboxPreview = (this.inboxPreview === inboxId) ? null : inboxId;
    }
  }

  archiveInbox(inbox: Inbox) {
    this.inboxService.delete(inbox).subscribe(() => {
      this._toastr.success(`La requête a été archivée.`);
      this._reloadInbox();
    });
  }

  validateInbox(inbox: Inbox) {
    this.inboxService.validate(inbox).subscribe(() => {
      this._toastr.success(`La requête a été validée et archivée.`);
      this._reloadInbox();
    });
  }

  assignationChange(user: User, inbox: Inbox) {
    if (!user) {
      return;
    }
    this.inboxService.assign(inbox, user).subscribe(() => {
      this._toastr.success(`La requête a été assignée.`);
    });
  }

  assignationExtern(inbox: Inbox) {
    this.inboxService.assign(inbox, null).subscribe();
    this._dialog.open(InboxAssignationDialogComponent, {
      data: {
        inbox: inbox
      }
    });
  }

  compareByEmails(user1: User, user2: User) {
    return user1?.email === user2?.email;
  }

  private _reloadInbox() {
    if (this.inboxes$.value.length < 1) {
      this.inboxService.reload();
    }
  }

}
