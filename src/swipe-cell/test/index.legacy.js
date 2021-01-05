import SwipeCell from '..';
import {
  mount,
  triggerDrag,
  later,
  mockGetBoundingClientRect,
} from '../../../test';

const THRESHOLD = 0.15;
const defaultProps = {
  props: {
    leftWidth: 100,
    rightWidth: 100,
  },
  slots: {
    left: () => 'Left',
    right: () => 'Right',
  },
};

test('drag and show left part', () => {
  const wrapper = mount(SwipeCell, defaultProps);

  triggerDrag(wrapper, 10, 0);
  expect(wrapper.html()).toMatchSnapshot();

  triggerDrag(wrapper, 50, 0);
  expect(wrapper.html()).toMatchSnapshot();

  triggerDrag(wrapper, 500, 0);
  expect(wrapper.html()).toMatchSnapshot();

  triggerDrag(wrapper, 0, 100);
  expect(wrapper.html()).toMatchSnapshot();
});

test('drag and show right part', () => {
  const wrapper = mount(SwipeCell, defaultProps);

  triggerDrag(wrapper, -50, 0);
  expect(wrapper.html()).toMatchSnapshot();
});

test('before-close prop', () => {
  let position;
  let instance;

  const wrapper = mount(SwipeCell, {
    ...defaultProps,
    props: {
      ...defaultProps.props,
      beforeClose(params) {
        ({ position } = params);
        ({ instance } = params);
      },
    },
  });

  wrapper.trigger('click');
  expect(position).toEqual(undefined);

  wrapper.vm.open('left');
  wrapper.trigger('click');
  expect(position).toEqual('cell');

  wrapper.find('.van-swipe-cell__left').trigger('click');
  expect(position).toEqual('left');

  wrapper.find('.van-swipe-cell__right').trigger('click');
  expect(position).toEqual('right');

  instance.close();
  expect(wrapper.vm.offset).toEqual(0);

  instance.open('left');
  wrapper.setData({ beforeClose: null });
  wrapper.trigger('click');
  expect(wrapper.vm.offset).toEqual(0);
});

test('name prop', (done) => {
  const wrapper = mount(SwipeCell, {
    ...defaultProps,
    props: {
      ...defaultProps.props,
      name: 'test',
      onClose(position, instance, detail) {
        expect(detail.name).toEqual('test');
        done();
      },
    },
  });

  wrapper.vm.open('left');
  wrapper.trigger('click');
});

test('should reset after drag', () => {
  const wrapper = mount(SwipeCell, defaultProps);

  triggerDrag(wrapper, defaultProps.leftWidth * THRESHOLD - 1, 0);
  expect(wrapper.vm.offset).toEqual(0);
});

test('disabled prop', () => {
  const wrapper = mount(SwipeCell, {
    props: {
      ...defaultProps.props,
      disabled: true,
    },
  });

  triggerDrag(wrapper, 50, 0);
  expect(wrapper.vm.offset).toEqual(0);
});

test('auto calc width', async () => {
  const restoreMock = mockGetBoundingClientRect({
    width: 50,
  });

  const wrapper = mount(SwipeCell, {
    slots: defaultProps.scopedSlots,
  });

  await later();
  triggerDrag(wrapper, 100, 0);
  expect(wrapper.html()).toMatchSnapshot();

  restoreMock();
});

test('render one side', async () => {
  const restoreMock = mockGetBoundingClientRect({
    width: 50,
  });

  const wrapper = mount(SwipeCell, {
    slots: {
      left: defaultProps.scopedSlots.left,
    },
  });

  await later();
  triggerDrag(wrapper, 100, 0);
  expect(wrapper.html()).toMatchSnapshot();

  restoreMock();
});

test('trigger open event when open left side', () => {
  const wrapper = mount(SwipeCell, defaultProps);

  triggerDrag(wrapper, 50, 0);
  expect(wrapper.emitted('open')[0][0]).toEqual({
    name: '',
    detail: '',
    position: 'left',
  });
});

test('trigger open event when open right side', () => {
  const wrapper = mount(SwipeCell, defaultProps);

  triggerDrag(wrapper, -50, 0);
  expect(wrapper.emitted('open')[0][0]).toEqual({
    name: '',
    detail: '',
    position: 'right',
  });
});

test('trigger close event when closed', () => {
  const wrapper = mount(SwipeCell, defaultProps);

  wrapper.vm.open('left');
  wrapper.vm.close();

  expect(wrapper.emitted('close')[0][0]).toEqual({
    name: '',
    position: undefined,
  });
});

test('should not trigger close event again when already closed', () => {
  const wrapper = mount(SwipeCell, defaultProps);

  wrapper.vm.open('left');
  wrapper.vm.close();
  wrapper.vm.close();
  expect(wrapper.emitted('close').length).toEqual(1);
});
