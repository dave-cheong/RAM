import {Input, Output, EventEmitter, Component} from '@angular/core';
import {
    IndividualRepresentativeDetailsComponent,
    IndividualRepresentativeDetailsComponentData} from
'./individual-representative-details/individual-representative-details.component';
import {
    OrganisationRepresentativeDetailsComponent,
    OrganisationRepresentativeDetailsComponentData} from
'./organisation-representative-details/organisation-representative-details.component';

@Component({
    selector: 'representative-details',
    templateUrl: 'representative-details.component.html',
    directives: [
        IndividualRepresentativeDetailsComponent,
        OrganisationRepresentativeDetailsComponent
    ]
})

export class RepresentativeDetailsComponent {

    @Input('data') public data: RepresentativeDetailsComponentData;

    @Output('dataChange') public dataChanges = new EventEmitter<RepresentativeDetailsComponentData>();

    @Output('isValid') public isValid = new EventEmitter<boolean>();

    public isOrganisation: boolean = false;

    public setChildValidationStatus(isOrganisation: boolean, isValid: boolean) {
        if (isOrganisation && this.isOrganisation) {
            this.isValid.emit(isValid);
        } else if (!isOrganisation && !this.isOrganisation) {
            this.isValid.emit(isValid);
        }
    }

    public toggleIndividualOrganisation(isOrganisation: boolean) {
        this.isOrganisation = isOrganisation;
        if (isOrganisation) {
            this.data.individual = undefined;
            this.data.organisation = {
                abn: '',
                organisationName: ''
            };
        } else {
            this.data.organisation = undefined;
            this.data.individual = {
                givenName: '',
                familyName: null,
                dob: null
            };
        }
    }

}

export interface RepresentativeDetailsComponentData {
    individual?: IndividualRepresentativeDetailsComponentData;
    organisation?: OrganisationRepresentativeDetailsComponentData;
    isOrganisation: boolean;
}
