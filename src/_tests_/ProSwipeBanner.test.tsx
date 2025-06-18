import { render } from '@testing-library/react';
import { ProSwipeBanner } from '../components/home/ProSwipeBanner';
import { expect, test, describe } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('ProSwipeBanner', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ProSwipeBanner />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
