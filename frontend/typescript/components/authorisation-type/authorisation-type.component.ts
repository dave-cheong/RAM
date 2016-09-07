import {OnInit, OnChanges, Input, Output, EventEmitter, Component, SimpleChanges} from '@angular/core';
import {Validators, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FormControl, FORM_DIRECTIVES } from '@angular/forms';

import {
    IRelationshipType,
    IHrefValue
} from '../../../../commons/api';

@Component({
    selector: 'authorisation-type',
    templateUrl: 'authorisation-type.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES,FORM_DIRECTIVES]
})

export class AuthorisationTypeComponent implements OnInit, OnChanges {

    public form: FormGroup;
    public selectedAuthType: IHrefValue<IRelationshipType>;

    @Input('data') public data: AuthorisationTypeComponentData;
    @Input('options') public options: IHrefValue<IRelationshipType>[];

    @Output('dataChange') public dataChanges = new EventEmitter<AuthorisationTypeComponentData>();

    @Output('isValid') public isValid = new EventEmitter<boolean>();

    constructor(private _fb: FormBuilder) { }

    public ngOnInit() {
        this.form = this._fb.group({
            'authType': [this.data.authType,
                Validators.compose([this.isAuthTypeSelected])
            ]
        });
        this.form.valueChanges.subscribe((v: AuthorisationTypeComponentData) => {
            this.dataChanges.emit(v);
            this.isValid.emit(this.form.valid);
        });
    }

    public ngOnChanges(changes: SimpleChanges): any {
        if (this.data.authType !== 'choose') {
            (this.form.controls['authType'] as FormControl).updateValue(this.data.authType);
        }
    }

    public onAuthTypeChange(value: string) {
        for (let type of this.options) {
            if (type.value.code === value) {
                this.selectedAuthType = type;
                this.data.authType = value;
            }
        }
    }

    private isAuthTypeSelected = (authType: FormControl) => {
        return (authType.value === 'choose') ? { authorisationTypeNotSet: { valid: false } } : null;
    };
}

export interface AuthorisationTypeComponentData {
    authType: string;
}
