declare type FilterParamsData = {
    [key: string]: string;
};

export class FilterParams {

    private data: FilterParamsData = {};

    public get(key: string, defaultValue?: string): string {
        const value = this.data[key];
        return value ? value : defaultValue;
    }

    public isEmpty(): boolean {
        return Object.keys(this.data).length === 0;
    }

    public add(key: string, value: Object): FilterParams {
        this.data[key] = value ? value.toString() : null;
        return this;
    }

    public encode(): string {
        let filter = '';
        for (let key of Object.keys(this.data)) {
            if (this.data.hasOwnProperty(key)) {
                const value = this.data[key];
                if (value && value !== '' && value !== '-') {
                    if (filter.length > 0) {
                        filter += '&';
                    }
                    filter += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }
            }
        }
        filter = encodeURIComponent(filter);
        return filter;
    };

    public static decode(filter: string): FilterParams {
        const filterParams = new FilterParams();
        if (filter) {
            const params = decodeURIComponent(filter).split('&');
            for (let param of params) {
                const key = param.split('=')[0];
                const value = param.split('=')[1];
                filterParams.add(decodeURIComponent(key), decodeURIComponent(value));
            }
        }
        return filterParams;
    }

}