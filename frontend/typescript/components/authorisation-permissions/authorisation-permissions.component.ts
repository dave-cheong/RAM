import {Component, Input} from '@angular/core';
import {IRelationshipAttributeNameUsage, IRelationshipAttribute} from '../../../../commons/RamAPI';

@Component({
    selector: 'authorisation-permissions',
    templateUrl: 'authorisation-permissions.component.html'
})
export class AuthorisationPermissionsComponent {
    @Input('permissionAttributes') public permissionAttributes: IRelationshipAttribute[];

    // use for sortOrder - ignoring for now
    @Input('attributeNameUsages') public attributeNameUsages: IRelationshipAttributeNameUsage[];
    @Input('data') public data: AuthorisationPermissionsComponentData;

    public accessLevels = {
        full: 'Full access',
        limited: 'Limited access',
        none: null as string
    };

    public toggleFull(permissionAttribute: IRelationshipAttribute) {
        if (permissionAttribute.value[0] === this.accessLevels.full) {
            permissionAttribute.value[0] = this.accessLevels.none;
        } else {
            permissionAttribute.value[0] = this.accessLevels.full;
        }
    };

    public toggleLimited(permissionAttribute: IRelationshipAttribute) {
        if (permissionAttribute.value[0] === this.accessLevels.limited) {
            permissionAttribute.value[0] = this.accessLevels.none;
        } else {
            permissionAttribute.value[0] = this.accessLevels.limited;
        }
    };
}

export interface AuthorisationPermissionsComponentData {
    value: string;
    customisationEnabled: boolean;
    enabled: boolean;
}