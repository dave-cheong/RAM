import {Component} from '@angular/core';
import {Response} from '@angular/http';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {Dialog} from 'primeng/primeng';
import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {MarkdownComponent} from '../../components/ng2-markdown/ng2-markdown.component';
import {RAMServices} from '../../services/ram-services';
import {Constants} from '../../../../commons/constants';
import {
    IIdentity,
    IRelationship,
    IRelationshipType,
    IRelationshipAttribute,
    IRelationshipAttributeNameUsage
} from '../../../../commons/api';
import {RelationshipCanAcceptPermission} from '../../../../commons/permissions/relationshipPermission.templates';

@Component({
    selector: 'accept-authorisation',
    templateUrl: 'accept-authorisation.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderAuthComponent, MarkdownComponent, Dialog]
})

export class AcceptAuthorisationComponent extends AbstractPageComponent {

    public identityHref: string;
    public relationshipHref: string;

    public identity: IIdentity;
    public relationship: IRelationship;
    public delegateManageAuthorisationAllowedIndAttribute: IRelationshipAttribute;

    public declineDisplay: boolean = false;
    public canAccept: boolean;
    public declarationText: string;
    public grantedPermissionAttributes: IRelationshipAttribute[];
    public accessLevelsDescription: string = '';

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Authorisations');
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {
        // extract path and query parameters
        this.identityHref = params.path['identityHref'];
        this.relationshipHref = params.path['relationshipHref'];

        // identity in focus
        this.services.rest.findIdentityByHref(this.identityHref).subscribe({
            next: this.onFindIdentity.bind(this),
            error: this.onServerError.bind(this)
        });

        // relationship
        this.services.rest.findRelationshipByHref(this.relationshipHref).subscribe({
            next: this.onFindRelationship.bind(this),
            error: this.onFindRelationshipError.bind(this)
        });
    }

    private onFindRelationship(relationship: IRelationship) {
        this.relationship = relationship;
        this.delegateManageAuthorisationAllowedIndAttribute = relationship.getAttribute(Constants.RelationshipAttributeNameCode.DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND);

        let permission = this.relationship.getPermission(RelationshipCanAcceptPermission);
        this.canAccept = permission.isAllowed();
        if (!permission.isAllowed()) {
            this.addGlobalMessages(permission.messages);
        }

        this.services.rest.findRelationshipTypeByHref(relationship.relationshipType.href).subscribe({
            next: this.onFindRelationshipType.bind(this)
        });

        this.grantedPermissionAttributes = [];
        for (let att of this.relationship.attributes) {
            if (att.attributeName.value.classifier === Constants.RelationshipAttributeNameClassifier.PERMISSION) {
                if (att.value) {
                    this.grantedPermissionAttributes.push(att);
                }
            }
        }
    }

    private onFindRelationshipType(relationshipType: IRelationshipType) {
        const relationshipAttributeName: IRelationshipAttributeNameUsage = relationshipType.relationshipAttributeNames.find((attributeUsage) => attributeUsage.attributeNameDef.value.code === Constants.RelationshipAttributeNameCode.DELEGATE_RELATIONSHIP_TYPE_DECLARATION);
        this.declarationText = relationshipAttributeName ? relationshipAttributeName.defaultValue[0] : '';
        this.accessLevelsDescription = relationshipType.getAttributeNameUsage(Constants.RelationshipAttributeNameCode.ACCESS_LEVELS_DESCRIPTION).attributeNameDef.value.longDecodeText;
    }

    protected onFindRelationshipError(err: Response) {
        if (err.status === 404) {
            this.goToEnterAuthorisationPage();
        } else {
            this.onServerError(err);
        }
    }

    public onFindIdentity(identity: IIdentity) {
        this.identity = identity;
    }

    public isManageAuthorisationAllowed() {
        return this.delegateManageAuthorisationAllowedIndAttribute &&
            this.delegateManageAuthorisationAllowedIndAttribute.value &&
            'true' === this.delegateManageAuthorisationAllowedIndAttribute.value[0];
    }

    public showDeclineConfirmation() {
        this.declineDisplay = true;
    };

    public cancelDeclineConfirmation() {
        this.declineDisplay = false;
    };

    public confirmDeclineAuthorisation() {
        this.services.rest.rejectPendingRelationshipByInvitationCode(this.relationship).subscribe({
            next: this.onDecline.bind(this),
            error: () => {
                this.declineDisplay = false;
                this.onServerError.bind(this);
            }
        });
    };

    public acceptAuthorisation() {
        this.services.rest.acceptPendingRelationshipByInvitationCode(this.relationship).subscribe({
            next: this.onAccept.bind(this),
            error: this.onServerError.bind(this)
        });
    };

    private onDecline() {
        this.declineDisplay = false;
        this.goToRelationshipPageWithMessage(Constants.GlobalMessage.DECLINED_RELATIONSHIP);
    }

    private onAccept() {
        this.goToRelationshipPageWithMessage(Constants.GlobalMessage.ACCEPTED_RELATIONSHIP);
    }

    public goToEnterAuthorisationPage() {
        this.services.route.goToRelationshipEnterCodePage(this.getSelfIdentityHref(), Constants.GlobalMessage.INVALID_CODE);
    };

    public goToRelationshipsPage() {
        this.goToRelationshipPageWithMessage(Constants.GlobalMessage.CANCEL_ACCEPT_RELATIONSHIP);
    };

    private goToRelationshipPageWithMessage(msg: string) {
        this.services.route.goToRelationshipsPage(
            this.getSelfIdentityHref(),
            null,
            1,
            msg
        );
    }

    private getSelfIdentityHref() {
        return this.services.model.getLinkHrefByType(Constants.Link.SELF, this.identity);
    }

    // TODO: not sure how to set the locale, Implement as a pipe
    public displayDate(dateString: string) {
        if (dateString) {
            const date = new Date(dateString);
            const datePipe = new DatePipe();
            return datePipe.transform(date, 'd') + ' ' +
                datePipe.transform(date, 'MMMM') + ' ' +
                datePipe.transform(date, 'yyyy');
        }
        return 'Not specified';
    }

}