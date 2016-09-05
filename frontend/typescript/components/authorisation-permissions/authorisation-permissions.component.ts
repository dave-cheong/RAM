import {Component, Input} from '@angular/core';
import {IRelationshipAttributeNameUsage, IRelationshipAttribute} from '../../../../commons/api';

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

    public toggle(permissionAttribute: IRelationshipAttribute, permittedValue: string) {
        if (permissionAttribute.value.length === 0 || permissionAttribute.value[0] !== permittedValue) {
            permissionAttribute.value = [permittedValue];
        } else {
            permissionAttribute.value = [];
        }
    };

}

export interface AuthorisationPermissionsComponentData {
    value: string;
    customisationEnabled: boolean;
    accessLevelsDescription: IRelationshipAttributeNameUsage;
    enabled: boolean;
}