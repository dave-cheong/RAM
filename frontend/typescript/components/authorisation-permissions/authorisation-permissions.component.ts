import { Component, Input, Output } from '@angular/core';
import {IRelationshipAttributeNameUsage, IRelationshipAttribute} from '../../../../commons/RamAPI';

@Component({
    selector: 'authorisation-permissions',
    templateUrl: 'authorisation-permissions.component.html'
})
export class AuthorisationPermissionsComponent {
    @Input('attributes') @Output('attributes') public attributes:IRelationshipAttribute[];
    @Input('attributeNameUsages') public attributeNameUsages:IRelationshipAttributeNameUsage[];
}

export interface AuthorisationPermissionsComponentData {
    value: string;
}