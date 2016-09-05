import {FormControl} from '@angular/forms';
import {Utils} from '../../../commons/utils';

export class RAMNgValidators {

    public static dateFormatValidator(dateCtrl: FormControl) {
        let v = dateCtrl.value;
        return v && Utils.parseDate(v) === null ? {
            validateDate: {
                valid: false
            }
        } : null;
    }

    public static validateABNFormat = (abnCtrl: FormControl) => {
        if (/^(\d *?){11}$/.test(abnCtrl.value)) {
            return null;
        } else {
            return {hasValidABN: {valid: false}};
        }
    };

    public static validateUDNFormat = (udnCtrl: FormControl) => {
        if (/^(\d *?)$/.test(udnCtrl.value)) {
            return null;
        } else {
            return {hasValidUDN: {valid: false}};
        }
    };

    public static validateEmailFormat = (emailCtrl: FormControl) => {
        const EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i;
        if (EMAIL_REGEXP.test(emailCtrl.value)) {
            return null;
        } else {
            return {hasValidEmail: {valid: false}};
        }
    };

    public static mustBeTrue = (ctrl: FormControl) => {
        if (ctrl.value) {
            return null;
        } else {
            return {mustBeTrue: {valid: false}};
        }
    }

}
