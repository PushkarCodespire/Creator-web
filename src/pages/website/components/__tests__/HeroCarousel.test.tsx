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
});
