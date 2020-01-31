import TimeUtil from './TimeUtil';

describe('addMinutes', () => {
  test('Add 1 minute', async () => {
    const date = new Date();
    const newDate = TimeUtil.addMinutes('1', date);
    expect(newDate.getTime() - date.getTime()).toBe(60000);
  });

});
