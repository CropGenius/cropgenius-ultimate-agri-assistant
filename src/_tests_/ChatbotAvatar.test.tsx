import { render } from '@testing-library/react';
import { ChatbotAvatar } from '../components/home/ChatbotAvatar';
import { expect, test, describe } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('ChatbotAvatar', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ChatbotAvatar />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
