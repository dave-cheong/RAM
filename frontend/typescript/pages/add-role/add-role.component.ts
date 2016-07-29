import {Observable} from 'rxjs/Rx';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {RAMServices} from '../../services/ram-services';

import {
    IHrefValue,
    ISearchResult,
    IIdentity,
    IRole,
    IRoleType
} from '../../../../commons/RamAPI';

@Component({
    selector: 'ram-add-role',
    templateUrl: 'add-role.component.html',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
        ROUTER_DIRECTIVES,
        PageHeaderAuthComponent
    ]
})

export class AddRoleComponent extends AbstractPageComponent {

    public idValue: string;

    public roles$: Observable<ISearchResult<IHrefValue<IRole>>>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;
    public roleTypeRefs: IHrefValue<IRoleType>[];

    public form: FormGroup;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices,
                private _fb: FormBuilder) {
        super(route, router, services);
        this.setBannerTitle('Authorisations');
    }

    public onInit(params: {path: Params, query: Params}) {

        // extract path and query parameters
        this.idValue = decodeURIComponent(params.path['idValue']);

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // role types
        this.services.rest.listRoleTypes().subscribe((roleTypeRefs) => {
            this.roleTypeRefs = roleTypeRefs;
        });

        // forms
        this.form = this._fb.group({
            roleType: '-'
        });

    }

    public onRoleTypeChange(newRoleTypeCode: string) {
    }

}
