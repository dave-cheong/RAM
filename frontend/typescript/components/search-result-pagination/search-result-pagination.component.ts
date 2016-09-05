import {Component, Input} from '@angular/core';
import {ISearchResult} from '../../../../commons/api';

@Component({
    selector: 'search-result-pagination',
    templateUrl: 'search-result-pagination.component.html',
    directives: []
})

export class SearchResultPaginationComponent {

    @Input() public searchResult: ISearchResult<Object>;
    @Input() public delegate: SearchResultPaginationDelegate;
    @Input() public previousPageCountBeforeShowingEllipsis = 2;
    @Input() public nextPageCountBeforeShowingEllipsis = 2;

    public totalPages(): number {
        if (this.searchResult) {
            const pageSize = this.searchResult.pageSize;
            const totalCount = this.searchResult.totalCount;
            return Math.trunc((totalCount + pageSize - 1) / pageSize);
        }
        return 1;
    }

    public innerPages(): number[] {
        let result: number[] = [];
        let page = this.page();
        let totalPages = this.totalPages();
        for (let p = 1; p <= totalPages; p = p + 1) {
            const lowerPage = page - this.previousPageCountBeforeShowingEllipsis;
            const upperPage = page + this.nextPageCountBeforeShowingEllipsis;
            if (p >= lowerPage && p <= upperPage) {
                result.push(p);
            }
        }
        return result;
    }

    public page(): number {
        return this.searchResult ? this.searchResult.page : 1;
    }

    public isPreviousDisabled(): boolean {
        return this.page() === 1;
    }

    public isNextDisabled(): boolean {
        return this.page() === this.totalPages();
    }

    public hasPreviousEllipsis(): boolean {
        if (this.searchResult) {
            const page = this.page();
            const lowerPage = page - this.previousPageCountBeforeShowingEllipsis;
            return lowerPage > 2;
        }
        return false;
    }

    public hasNextEllipsis(): boolean {
        if (this.searchResult) {
            const page = this.page();
            const upperPage = page + this.nextPageCountBeforeShowingEllipsis;
            const totalPages = this.totalPages();
            return upperPage <= totalPages - 2;
        }
        return false;
    }

    public forceShowFirstPage(): boolean {
        if (this.searchResult) {
            const page = this.page();
            const lowerPage = page - this.previousPageCountBeforeShowingEllipsis;
            return lowerPage >= 2;
        }
        return false;
    }

    public forceShowLastPage(): boolean {
        if (this.searchResult) {
            const page = this.page();
            const upperPage = page + this.nextPageCountBeforeShowingEllipsis;
            const totalPages = this.totalPages();
            return upperPage <= totalPages - 1;
        }
        return false;
    }

    public isNotEmpty(): boolean {
        return this.searchResult && this.searchResult.totalCount > 0;
    }

    public goToPage(page: number): void {
        if (this.searchResult && this.searchResult.page !== page) {
            if (this.delegate) {
                this.delegate.goToPage(page);
            }
        }
    }

    public goToPreviousPage(): void {
        if (!this.isPreviousDisabled()) {
            const previousPage = this.searchResult.page - 1;
            this.goToPage(previousPage);
        }
    }

    public goToNextPage(): void {
        if (!this.isNextDisabled()) {
            console.log('CURRENT PAGE = ' + this.searchResult.page);
            const nextPage = this.searchResult.page + 1;
            this.goToPage(nextPage);
        }
    }

}

export interface SearchResultPaginationDelegate {

    goToPage(page: number): void;

}
