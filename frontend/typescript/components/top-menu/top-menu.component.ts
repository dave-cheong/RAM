import 'ng2-bootstrap';
import {Component} from '@angular/core';

import {RAMServices} from '../../services/ram-services';

import {IPrincipal} from '../../../../commons/api';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap';

@Component({
    selector: 'top-menu',
    templateUrl: 'top-menu.component.html',
    directives: [DROPDOWN_DIRECTIVES]
})

export class TopMenuComponent {

    public me: IPrincipal;

    constructor(private services: RAMServices) {
    }

    public ngOnInit() {
        this.services.rest.findMyPrincipal().subscribe(principal => {
                this.me = principal;
            }
        );
    }

    public isLoggedIn() {
        return this.me !== null && this.me !== undefined;
    }

    public goToHomePage() {
        this.services.route.goToHomePage();
    }

    public goToAuthorisationsHomePage() {
        this.services.route.goToAuthorisationsHomePage();
    }

    public goToSoftwareProviderServicesHomePage() {
        this.services.route.goToSoftwareServicesProviderHomePage();
    }

}