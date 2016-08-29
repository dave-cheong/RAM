import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {Validators, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FORM_DIRECTIVES} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {RAMServices} from '../../services/ram-services';
import {RAMConstants} from '../../services/ram-constants.service';

import {IIdentity} from '../../../../commons/RamAPI';

@Component({
    selector: 'enter-invitation-code',
    templateUrl: 'enter-invitation-code.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES, PageHeaderAuthComponent]
})

export class EnterInvitationCodeComponent extends AbstractPageComponent {

    public idValue: string;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;

    public form: FormGroup;

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Authorisations');
    }

    public onInit(params: {path:Params, query:Params}) {

        // extract path and query parameters
        this.idValue = params.path['idValue'];

        // message
        const msg = params.query['msg'];
        if (msg === RAMConstants.GlobalMessage.INVALID_CODE) {
            this.addGlobalMessage('The code you have entered does not exist or is invalid.');
        }

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // forms
        this.form = this.fb.group({
            'relationshipCode': ['', Validators.compose([Validators.required])]
        });

    }

    public activateCode(event: Event) {

        this.services.rest.claimRelationshipByInvitationCode(this.form.controls['relationshipCode'].value)
            .subscribe((relationship) => {
                this.services.route.goToRelationshipAcceptPage(
                    this.idValue,
                    this.form.controls['relationshipCode'].value
                );
            }, (err) => {
                const status = err.status;
                if (status === 404) {
                    this.addGlobalMessage('The code you have entered does not exist or is invalid.');
                } else {
                    this.addGlobalErrorMessages(err);
                }
            });

        event.stopPropagation();
        return false;
    }

    public goToRelationshipsPage() {
        this.services.route.goToRelationshipsPage(
            this.services.model.getLinkHrefByType(RAMConstants.Link.SELF, this.identity)
        );
    };

}
