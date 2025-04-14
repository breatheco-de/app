import CounterReducer from '../store/reducers/counterReducer';

// optional
const initialState = {
  count: 0,
};

test('should init the count with 0', () => {
  expect(CounterReducer(initialState, { type: 'DEFAULT' })).toEqual({
    count: 0,
  });
});

test('should increase to 1', () => {
  expect(CounterReducer(initialState, { type: 'INCREMENT' })).toEqual({
    count: 1,
  });
});
test('should decrease to -1', () => {
  expect(CounterReducer(initialState, { type: 'DECREMENT' })).toEqual({
    count: -1,
  });
});
