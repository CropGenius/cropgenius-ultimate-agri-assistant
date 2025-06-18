import { render } from '@testing-library/react';
import { HealthOrb } from '../components/home/HealthOrb';
import { expect, test, describe } from 'vitest';

describe('HealthOrb', () => {
  test('renders correctly with high score', () => {
    const { asFragment } = render(<HealthOrb score={90} tasks={[]} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders correctly with medium score', () => {
    const { asFragment } = render(<HealthOrb score={70} tasks={[]} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders correctly with low score', () => {
    const { asFragment } = render(<HealthOrb score={40} tasks={[]} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
