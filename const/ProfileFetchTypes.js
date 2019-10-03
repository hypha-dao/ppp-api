export default {
    BASE_ONLY: 'BASE_ONLY',
    APP_ONLY: 'APP_ONLY',
    BASE_AND_APP: 'BASE_AND_APP',
    get(fetchType, defaultValue) {
        return this.isValid(fetchType) ? fetchType : defaultValue;
    },
    isValid(fetchType) {
        return fetchType === this.APP_ONLY ||
            fetchType === this.BASE_ONLY ||
            fetchType === this.BASE_AND_APP;
    }
};