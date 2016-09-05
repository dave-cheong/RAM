import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {RAMServices} from '../../services/ram-services';

import {IIdentity} from '../../../../commons/api';

@Component({
    selector: 'page-header',
    templateUrl: 'page-header-sps.component.html',
    directives: []
})

export class PageHeaderSPSComponent {

    @Input() public identity: IIdentity;
    @Input() public tab: string;
    @Input() public messages: string[];
    @Input() public showContent: boolean = true;
    @Input() public giveAuthorisationsEnabled: boolean = false;

    constructor(private router: Router,
                private services: RAMServices) {
    }

    public title(): string {
        return this.identity ? this.services.model.displayNameForIdentity(this.identity) : 'Select Business ...';
    }

    public hasMessages(): boolean {
        return this.messages && this.messages.length > 0;
    }

    public goToNotificationsPage() {
        if (this.isIdentityValid()) {
            this.services.route.goToNotificationsPage(this.identity.idValue);
        }
    };

    private isIdentityValid() {
        return this.identity !== null && this.identity !== undefined;
    }

}