import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import FAQAccordion from '../FAQAccordion';

const mockFaqs = [
  { question: 'What topics do you cover?', answer: 'I cover AI and machine learning.' },
  { question: 'How can I contact you?', answer: 'Through the chat feature.' },
  { question: 'What is your response time?', answer: 'Usually within seconds.' },
];

describe('FAQAccordion', () => {
  it('renders FAQ heading', () => {
    renderWithProviders(
      <FAQAccordion faqs={mockFaqs} creatorName="Test Creator" />
    );
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders all FAQ questions', () => {
    renderWithProviders(
      <FAQAccordion faqs={mockFaqs} creatorName="Test Creator" />
    );
    expect(screen.getByText('What topics do you cover?')).toBeInTheDocument();
    expect(screen.getByText('How can I contact you?')).toBeInTheDocument();
    expect(screen.getByText('What is your response time?')).toBeInTheDocument();
  });

  it('returns null when faqs array is empty', () => {
    const { container } = renderWithProviders(
      <FAQAccordion faqs={[]} creatorName="Test Creator" />
    );
    expect(container.innerHTML).toBe('');
  });
});
