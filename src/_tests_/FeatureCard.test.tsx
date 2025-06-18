import { render } from '@testing-library/react';
import { FeatureCard } from '../components/home/FeatureCard';
import { expect, test, describe, vi } from 'vitest';
import { ScanLine } from 'lucide-react';

describe('FeatureCard', () => {
  test('renders correctly', () => {
    const { asFragment } = render(
      <FeatureCard
        icon={<ScanLine />}
        title="Test Title"
        description="Test Description"
        actionText="Test Action"
        onAction={vi.fn()}
        bgColorClass="bg-green-500"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
