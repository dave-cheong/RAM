/*
 * This component allows an operator to enter an ABN or (partial)
 * name for an organisation. It asks the RAM server to query the
 * external ABR API for matching company information. It then lists
 * the ABR information returned (up to the 201 record limit) and makes
 * the ABN a link. The operator can choose the organisation of interest.
 * If only one record is returns (as in when the ABN is given), it is
 * automatically chosen.
 *
 * This component sends a dataChange even when an organisation is chosen
 * and an error even on errors or when there are no results.
 *     <business-select
 *       (dataChange)="selectBusiness($event)"
 *       (error)="displayErrors($event)"
 *     ></business-select>
 */
import {Output, Input, EventEmitter, Component} from '@angular/core';
import {REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES } from '@angular/forms';
import {ABRentry} from '../../../../commons/api';
import {RAMRestService} from '../../services/ram-rest.service';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'business-select',
    templateUrl: 'business-select.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES,FORM_DIRECTIVES]
})
export class BusinessSelectComponent {
    /*
     * Component can allow search by ABN or ABN and organisation name.
     * Used in referencing parent: <business-select [searchIncludesName]="false"
     */
    @Input() public searchIncludesName:boolean = true;
    /*
     * If the search doesn't include names and the parent page moves on
     * immediately after operator ABN entry, then you may not want to
     * have a table of results. If, however, this component is part of
     * a larger form, leave the table displayed so the user can see
     * the company information.
     */
    @Input() public showSearchResults:boolean = true;
    /*
     * Containter for the user input field. They can enter an ABN
     * or a partial company name, trading name, sole trader name, etc.
     */
    public abn_or_name = '';
    /*
     * A search is triggered when a user tabs out of the input field
     * or presses enter. After a search we don't want to initiate
     * another until necessary. It is reset to true whenever the
     * operator types or after a business is selected. The latter
     * is because they may want to change their mind before
     * confirming their selection.
     */
    public new_search = true;
    /*
     * Display a loading message while we are off asking the ABR
     * for details. The rest of the page is still active so that
     * the operator can change their mind and not wait for a response.
     */
    public isLoading = false;
    /*
     * The ABR returns a list of matching businesses. They are displayed
     * from this array.
     */
    public businesses:ABRentry[] = [];
    /*
     * If their is only one business returned or the operator clicks
     * on one of the businesses in the list, it becomes the selected
     * business. Once a business is selected it becomes the only one
     * displayed and the ABN is no longer a link.
     */
    public selectedBusiness:ABRentry = null;
    /*
     * Tell the parent component that the operator has selected a business.
     * Does not trigger on search, only when there is one business in focus.
     */
    @Output('dataChange') public dataChanges = new EventEmitter<ABRentry>();
    /*
     * Tell the parent component of a problem so it can display an error
     * message. If no records are returned this becomes a 404 error. Others
     * will occur due to server, database or external ABR api faults.
     */
    @Output('error') public errorEvent = new EventEmitter<string[]>();
    /*
     * An event sent every time the operator changes something. No data
     * is returned. It is so that a page can clear old error messages
     */
    @Output('editing') public editing = new EventEmitter();

    constructor(private rest: RAMRestService) {}

    /*
     * Called to display the results of a search once they become available.
     * Also looks for and responds to server errors.
     */
    private display(abrListObservable:Observable<ABRentry[]>) {
        this.isLoading = true;
        this.selectedBusiness = null;
        abrListObservable.subscribe(
            (abrs: ABRentry[]) => {
                if (abrs) {
                    this.businesses = abrs;
                    this.isLoading = false;
                    if (this.businesses.length === 1) {
                        this.selectBusiness(this.businesses[0]);
                        this.new_search = true;
                    }
                }
            },
            (err) => {
                if (err.status === 404) {
                // default server 404 error message is wrong
                    this.errorEvent.emit(
                        ['ABN '+this.abn_or_name+' not found in the ABR']
                    );
                } else {
                    this.errorEvent.emit(this.rest.extractErrorMessages(err));
                }
                this.isLoading = false;
            }
        );
    }

    /*
     * Called by component when a the operator selects a business of interest.
     * Also called internally if a search only returns one record - which is
     * always the case for an ABN search.
     */
    public selectBusiness(business:ABRentry) {
        if (!this.selectedBusiness) {
            this.new_search = true;
            this.dataChanges.emit(business);
            this.selectedBusiness = business;
            this.businesses = [this.selectedBusiness];
        }
    }

    /*
     * Triggered by the component when the operator presses tab or enter
     * in the input field. If the data has changed it initiates a search
     * of the ABR after determining whether the entry is an ABN or potential
     * company name. ABNs can include spaces.
     */
    public findCompanies() {
        if (this.new_search && this.abn_or_name.length) {
            this.new_search = false;
            this.businesses = [];
            if (/^(\d *?){11}$/.test(this.abn_or_name)) {
                const abn = this.abn_or_name.replace(/\s+/g, '');
                this.display(this.rest.getABRfromABN(abn));
            } else if (this.searchIncludesName) {
                this.display(this.rest.getABRfromName(this.abn_or_name));
            } else {
                this.errorEvent.emit(['Valid ABN is 11 digits (plus spaces)']);
                this.isLoading = false;
            }
        }
    }
    /*
     * Triggered bu the component if the user changes the data in the input
     * field. Records whether a new search is to be initiated on tab or enter.
     */
    public valueChange() {
        this.new_search = true;
        this.editing.emit(null);
    }
}
