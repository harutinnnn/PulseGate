import { division } from './division';

describe('mathematics', () => {
  it('should return the number of divisions', async () => {
    expect(division(4, 2)).toBe(2);
  });
});
