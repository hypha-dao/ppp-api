import Util from './Util';

describe('createPath', () => {
    test('Empty obj 1 prop', async () => {
        const obj = Util.createPath(null, 'prop1');
        expect(obj).toHaveProperty('prop1', {});
    });

    test('Empty obj 2 props', async () => {
        const obj = Util.createPath(null, 'prop1.prop2');
        expect(obj).toEqual({
            prop1: {
                prop2: {},
            },
        });
    });

    test('Empty obj 3 props with value', async () => {
        const obj = Util.createPath(null, 'prop1.prop2.prop3', 'hola');
        expect(obj).toEqual({
            prop1: {
                prop2: {
                    prop3: 'hola',
                },
            },
        });
    });

    test('Not empty obj partial 3 props with value', async () => {
        const obj = Util.createPath({
            prop1: {},
        }, 'prop1.prop2.prop3', 'hola');
        expect(obj).toEqual({
            prop1: {
                prop2: {
                    prop3: 'hola',
                },
            },
        });
    });

    test('Path already exists 3 props with value', async () => {
        const obj = Util.createPath({
            prop1: {
                prop2: {
                    prop3: 'adios',
                },
            },
        }, 'prop1.prop2.prop3', 'hola');
        expect(obj).toEqual({
            prop1: {
                prop2: {
                    prop3: 'adios',
                },
            },
        });
    });

});


describe('getPath', () => {
    test('Empty obj 1 prop', async () => {
        const value = Util.getPath(null, 'prop1', null);
        expect(value).toBeNull();
    });

    test('Empty obj 2 props', async () => {
        const value = Util.getPath(null, 'prop1.prop2', null);
        expect(value).toBeNull();
    });

    test('Empty obj 3 props with value', async () => {
        const value = Util.getPath(null, 'prop1.prop2.prop3', 'hola');
        expect(value).toBe('hola');
    });

    test('Not empty obj partial 3 props with value', async () => {
        const value = Util.getPath({
            prop1: {},
        }, 'prop1.prop2.prop3', 'hola');
        expect(value).toBe('hola');
    });

    test('Path already exists 3 props with value', async () => {
        const value = Util.getPath({
            prop1: {
                prop2: {
                    prop3: 'adios',
                },
            },
        }, 'prop1.prop2.prop3', 'hola');
        expect(value).toBe('adios');
    });

});

describe('getPath type mode', () => {
    test('Empty obj 1 prop', async () => {
        const value = Util.getPath(null, 'prop1', null, true);
        expect(value).toBeNull();
    });

    test('Empty obj 2 props', async () => {
        const value = Util.getPath(null, 'prop1.prop2', null, true);
        expect(value).toBeNull();
    });

    test('Empty obj 3 props with value', async () => {
        const value = Util.getPath(null, 'prop1.prop2.prop3', 'hola', true);
        expect(value).toBe('hola');
    });

    test('Not empty obj partial 3 props with value', async () => {
        const value = Util.getPath({
            prop1: {},
        }, 'prop1.prop2.prop3', 'hola', true);
        expect(value).toBe('hola');
    });

    test('Path already exists 2 props with value', async () => {
        const value = Util.getPath({
            "prop1": {
                "M": {
                    "prop2": {
                        "S": "adios"
                    }
                }
            }
        }, 'prop1.prop2', 'hola', true);
        expect(value).toBe('adios');
    });

});