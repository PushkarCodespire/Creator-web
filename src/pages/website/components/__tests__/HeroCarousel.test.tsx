vi.mock('../../WebsiteCreateAI.module.css', () => ({
  default: {
    carousel: 'carousel',
    carouselTrack: 'carouselTrack',
    carouselCard: 'carouselCard',
    carouselCardPhoto: 'carouselCardPhoto',
    carouselCardImg: 'carouselCardImg',
    carouselCardText: 'carouselCardText',
    carouselCardName: 'carouselCardName',
    carouselCardTitle: 'carouselCardTitle',
  },
}));

vi.mock('../../data/creators-data', () => ({
  CREATORS: [
    {
      id: 'creator1',
      name: 'Creator One',
      title: 'Expert in Tech',
      chats: '100+ Chats',
      about: 'About Creator One',
      tags: ['Tech'],
      questions: ['How do I learn programming?'],
      cardImg: '/card1.jpg',
      modalImg: '/modal1.jpg',
    },
    {
      id: 'creator2',
      name: 'Creator Two',
      title: 'Fitness Coach',
      chats: '200+ Chats',
      about: 'About Creator Two',
      tags: ['Fitness'],
      questions: ['How do I lose weight?'],
      cardImg: '/card2.jpg',
      modalImg: '/modal2.jpg',
    },
  ],
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { HeroCarousel } from '../HeroCarousel';

describe('HeroCarousel', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<HeroCarousel />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders creator names', () => {
    const { getAllByText } = renderWithProviders(<HeroCarousel />);
    expect(getAllByText('Creator One').length).toBeGreaterThan(0);
    expect(getAllByText('Creator Two').length).toBeGreaterThan(0);
  });

  it('renders creator titles', () => {
    const { getAllByText } = renderWithProviders(<HeroCarousel />);
    expect(getAllByText('Expert in Tech').length).toBeGreaterThan(0);
    expect(getAllByText('Fitness Coach').length).toBeGreaterThan(0);
  });

  it('renders carousel with aria-label', () => {
    const { container } = renderWithProviders(<HeroCarousel />);
    expect(container.querySelector('[aria-label="Featured creators"]')).toBeTruthy();
  });

  it('renders creator images', () => {
    const { getAllByAltText } = renderWithProviders(<HeroCarousel />);
    expect(getAllByAltText('Creator One').length).toBeGreaterThan(0);
    expect(getAllByAltText('Creator Two').length).toBeGreaterThan(0);
  });

  it('renders each creator twice (original + duplicate for infinite scroll)', () => {
    const { getAllByText } = renderWithProviders(<HeroCarousel />);
    // Each creator appears in the primary and the duplicated track
    expect(getAllByText('Creator One').length).toBe(2);
    expect(getAllByText('Creator Two').length).toBe(2);
  });

  it('renders each creator image twice', () => {
    const { getAllByAltText } = renderWithProviders(<HeroCarousel />);
    expect(getAllByAltText('Creator One').length).toBe(2);
    expect(getAllByAltText('Creator Two').length).toBe(2);
  });

  it('images use the modalImg src', () => {
    const { getAllByAltText } = renderWithProviders(<HeroCarousel />);
    const imgs = getAllByAltText('Creator One') as HTMLImageElement[];
    imgs.forEach((img) => expect(img.src).toContain('/modal1.jpg'));
  });

  it('duplicate cards have aria-hidden="true"', () => {
    const { container } = renderWithProviders(<HeroCarousel />);
    const hiddenCards = container.querySelectorAll('[aria-hidden="true"]');
    // One hidden card per creator in the duplicate set
    expect(hiddenCards.length).toBe(2);
  });

  it('primary cards do not have aria-hidden', () => {
    const { container } = renderWithProviders(<HeroCarousel />);
    const allCards = container.querySelectorAll('.carouselCard');
    const visibleCards = Array.from(allCards).filter(
      (card) => !card.hasAttribute('aria-hidden')
    );
    expect(visibleCards.length).toBe(2);
  });

  it('renders a carouselTrack inside the carousel', () => {
    const { container } = renderWithProviders(<HeroCarousel />);
    const track = container.querySelector('.carouselTrack');
    expect(track).toBeTruthy();
  });

  it('renders the correct total number of carousel cards (2 creators × 2 sets)', () => {
    const { container } = renderWithProviders(<HeroCarousel />);
    const cards = container.querySelectorAll('.carouselCard');
    expect(cards.length).toBe(4);
  });
});
