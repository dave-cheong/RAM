import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup} from '@angular/forms';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderSPSComponent} from '../../components/page-header/page-header-sps.component';
import {RAMServices} from '../../services/ram-services';
import {Observable} from 'rxjs/Observable';

import {
    ISearchResult,
    IParty,
    IHrefValue,
    FilterParams
} from '../../../../commons/api';
import {
    SearchResultPaginationDelegate,
    SearchResultPaginationComponent
} from '../../components/search-result-pagination/search-result-pagination.component';

@Component({
    selector: 'ram-business-relationships',
    templateUrl: 'businesses.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        FORM_DIRECTIVES,
        REACTIVE_FORM_DIRECTIVES,
        PageHeaderSPSComponent,
        SearchResultPaginationComponent
    ]
})

// todo this component needs to be rewritten to be compliant with project standards
// todo this component doesn't seem to render with search text via a browser reload
// todo this component shouldn't have parties$ (template shouldn't use |async)
export class BusinessesComponent extends AbstractPageComponent {

    public filter: FilterParams;
    public page: number;

    public parties$: Observable<ISearchResult<IHrefValue<IParty>>>;
    public partyRefs: IHrefValue<IParty>[];
    public paginationDelegate: SearchResultPaginationDelegate;
    public form: FormGroup;

    public hasAccess:boolean = false;

    private _isLoading = false; // set to true when you want the UI indicate something is getting loaded.

    constructor(route: ActivatedRoute, router: Router, fb: FormBuilder, services: RAMServices) {
        super(route, router, fb, services);
        this.setBannerTitle('Software Provider Services');
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        this._isLoading = true;

        this.filter = FilterParams.decode(params.query['filter'])
            .add('partyType', 'ABN')
            .add('authorisationManagement', true);

        // extract path and query parameters
        this.page = params.query['page'] ? +params.query['page'] : 1;

        // load business parties that the user has authorisation management for
        this.partyRefs = [];
        this.parties$ = this.services.rest.searchDistinctSubjectsForMe(this.filter.encode(), this.page);
        this.parties$.subscribe((partyRefs) => {
            this._isLoading = false;
            this.partyRefs = partyRefs.list;

            // if results are not being filtered
            if(!this.filter.get('text')) {
                // automatically focus business if there is only one
                if (partyRefs.totalCount === 1) {
                    this.goToNotificationsContext(this.partyRefs[0]);
                } else if (partyRefs.totalCount === 0) {
                    this.addGlobalMessage('You do not have authorisation administrator access to any businesses - see your administrator');
                    this.hasAccess = false;
                } else {
                    this.hasAccess = true;
                }
            }
        }, (err) => {
            if (err.status === 403) {
                this.services.route.goToAccessDeniedPage();
            } else {
                this.addGlobalErrorMessages(err);
                this._isLoading = false;
            }
        });

        // pagination delegate
        this.paginationDelegate = {
            goToPage: (page: number) => {
                this.services.route.goToBusinessesPage(this.filter.encode(), page);
            }
        } as SearchResultPaginationDelegate;

        // forms
        this.form = this.fb.group({
            text: this.filter.get('text', ''),
            sort: this.filter.get('sort', '-')
        });
    }

    public search() {
        const filterString = new FilterParams()
            .add('text', this.form.controls['text'].value)
            .add('sort', this.form.controls['sort'].value)
            .encode();
        this.services.route.goToBusinessesPage(filterString);
    }

    public get isLoading() {
        return this._isLoading;
    }

    public hasParties() {
        return (this.partyRefs && this.partyRefs.length > 0) || !this.filter.get('text');
    }

    public goToNotificationsContext(partyRef: IHrefValue<IParty>) {
        const defaultIdentityRef = this.services.model.getDefaultIdentityResource(partyRef.value);
        if (defaultIdentityRef) {
            this.goToNotificationsPage(defaultIdentityRef.href);
        }
    }

    public goToNotificationsPage(identityHref: string) {
        this.services.route.goToNotificationsPage(identityHref);
    };

    public goToHomePage() {
        this.services.route.goToHomePage();
    };

}
