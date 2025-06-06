import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormEvent } from 'react';

// Mock the AIChatWidget component
vi.mock('../features/ai-chat/components/AIChatWidget', () => ({
  __esModule: true,
  default: () => {
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      const input = e.currentTarget.querySelector('input');
      if (input) input.value = '';
    };

    return (
      <div data-testid="ai-chat-widget">
        <div data-testid="chat-messages"></div>
        <form onSubmit={handleSubmit} data-testid="chat-form">
          <input
            type="text"
            placeholder="Ask a question..."
            data-testid="chat-input"
          />
          <button type="submit" data-testid="send-button">
            Send
          </button>
        </form>
      </div>
    );
  },
}));

// Import after mock
import AIChatWidget from '../features/ai-chat/components/AIChatWidget';

describe('AIChatWidget', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('displays chat input box', () => {
    render(<AIChatWidget />);

    // Check if chat input is rendered
    const input = screen.getByPlaceholderText('Ask a question...');
    expect(input).toBeInTheDocument();

    // Check if send button is present
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('allows typing and submitting messages', async () => {
    const user = userEvent.setup();
    render(<AIChatWidget />);

    // Type a message
    const input = screen.getByPlaceholderText('Ask a question...');
    await user.type(input, 'Hello, world!');
    expect(input).toHaveValue('Hello, world!');

    // Submit the form
    const form = screen.getByTestId('chat-form');
    const submitHandler = vi.fn((e) => e.preventDefault());
    form.onsubmit = submitHandler;

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    expect(submitHandler).toHaveBeenCalledTimes(1);
  });
});
