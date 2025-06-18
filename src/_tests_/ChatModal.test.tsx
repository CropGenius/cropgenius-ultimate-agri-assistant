import { render } from '@testing-library/react';
import { ChatModal } from '../components/home/ChatModal';
import { expect, test, describe, vi } from 'vitest';

describe('ChatModal', () => {
  test('renders correctly when open', () => {
    const { asFragment } = render(<ChatModal isOpen={true} onClose={vi.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('does not render when closed', () => {
    const { asFragment } = render(<ChatModal isOpen={false} onClose={vi.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
