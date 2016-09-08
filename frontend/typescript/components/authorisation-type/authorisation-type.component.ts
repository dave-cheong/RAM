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
    public selectedAuthType: IHrefValue<IRelationshipType>;

    @Input('data') public data: AuthorisationTypeComponentData;
    @Input('options') public options: IHrefValue<IRelationshipType>[];

    @Output('dataChange') public dataChanges = new EventEmitter<AuthorisationTypeComponentData>();

    @Output('isValid') public isValid = new EventEmitter<boolean>();

    constructor(private _fb: FormBuilder) { }

    public ngOnInit() {
        this.form = this._fb.group({
            'authType': [this.data.authType ? this.data.authType.value.code : '-', Validators.compose([this.isAuthTypeSelected])]
        });
        this.form.valueChanges.subscribe((v: {[key: string] : any}) => {
            console.log('valueChanges', v);
            console.log('valueChanges', JSON.stringify(v, null, 4));
            this.dataChanges.emit({
                authType: CodeDecode.getRefByCode(this.options, v['authType']) as IHrefValue<IRelationshipType>
            });
            this.isValid.emit(this.form.valid);
        });
    }

    public ngOnChanges(changes: SimpleChanges): any {
        if (this.form) {
            (this.form.controls['authType'] as FormControl).updateValue(this.data.authType ? this.data.authType.value.code : '-');
        }
    }

    public onAuthTypeChange(value: string) {
        this.data.authType = CodeDecode.getRefByCode(this.options, value) as IHrefValue<IRelationshipType>;
    }

    private isAuthTypeSelected = (authType: FormControl) => {
        return (authType.value === '-') ? { authorisationTypeNotSet: { valid: false } } : null;
    };
}

export interface AuthorisationTypeComponentData {
    authType: IHrefValue<IRelationshipType>;
}
