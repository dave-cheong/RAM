import {OnInit, OnChanges, Input, Output, EventEmitter, Component, SimpleChanges} from '@angular/core';
import {Validators, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, FormControl, FORM_DIRECTIVES } from '@angular/forms';

import {
    IRelationshipType,
    IHrefValue
} from '../../../../commons/api';
import {CodeDecode} from '../../../../commons/dtos/codeDecode.dto';

@Component({
    selector: 'authorisation-type',
    templateUrl: 'authorisation-type.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES,FORM_DIRECTIVES]
})

export class AuthorisationTypeComponent implements OnInit, OnChanges {

    public form: FormGroup;

    @Input('data') public data: AuthorisationTypeComponentData;
    @Input('options') public options: IHrefValue<IRelationshipType>[];

    @Output('dataChange') public dataChanges = new EventEmitter<AuthorisationTypeComponentData>();
    @Output('isValid') public isValid = new EventEmitter<boolean>();

    constructor(private _fb: FormBuilder) { }

    public ngOnInit() {

        // setup form
        this.form = this._fb.group({
            'authTypeCode': [this.data.authType ? this.data.authType.value.code : '-', Validators.compose([this.isAuthTypeSelected])]
        });

        // emit changes externally on change
        this.form.valueChanges.subscribe((v: AuthorisationTypeInternalData) => {
            this.dataChanges.emit({
                authType: this.getRefByCode(v.authTypeCode)
            } as AuthorisationTypeComponentData);
            this.isValid.emit(this.form.valid);
        });

    }

    private getRefByCode(code: string) {
        return CodeDecode.getRefByCode(this.options, code) as IHrefValue<IRelationshipType>;
    }

    public ngOnChanges(changes: SimpleChanges): any {
        if (this.form) {
            (this.form.controls['authTypeCode'] as FormControl).updateValue(this.data.authType ? this.data.authType.value.code : '-');
        }
    }

    public onAuthTypeChange(code: string) {
        this.data.authType = this.getRefByCode(code);
    }

    private isAuthTypeSelected = (control: FormControl) => {
        return (control.value === '-') ? { authorisationTypeNotSet: { valid: false } } : null;
    };
}

interface AuthorisationTypeInternalData {
    authTypeCode: string;
}

export interface AuthorisationTypeComponentData {
    authType: IHrefValue<IRelationshipType>;
}
