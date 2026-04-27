import {
  pageVariants,
  pageTransition,
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  slideInLeft,
  slideInRight,
  slideInUp,
  slideInDown,
  cardHover,
  buttonTap,
  buttonHover,
  listContainer,
  listItem,
  modalBackdrop,
  modalContent,
} from '../animations';

describe('animations', () => {
  it('pageVariants is defined', () => {
    expect(pageVariants).toBeDefined();
  });

  it('pageTransition is defined', () => {
    expect(pageTransition).toBeDefined();
  });

  it('fadeIn has initial and animate states', () => {
    expect(fadeIn).toBeDefined();
    expect(fadeIn.initial).toBeDefined();
    expect(fadeIn.animate).toBeDefined();
  });

  it('fadeInUp is defined', () => {
    expect(fadeInUp).toBeDefined();
  });

  it('fadeInDown is defined', () => {
    expect(fadeInDown).toBeDefined();
  });

  it('scaleIn is defined', () => {
    expect(scaleIn).toBeDefined();
  });

  it('slideInLeft is defined', () => {
    expect(slideInLeft).toBeDefined();
  });

  it('slideInRight is defined', () => {
    expect(slideInRight).toBeDefined();
  });

  it('slideInUp is defined', () => {
    expect(slideInUp).toBeDefined();
  });

  it('slideInDown is defined', () => {
    expect(slideInDown).toBeDefined();
  });

  it('cardHover is defined', () => {
    expect(cardHover).toBeDefined();
  });

  it('buttonTap is defined', () => {
    expect(buttonTap).toBeDefined();
  });

  it('buttonHover is defined', () => {
    expect(buttonHover).toBeDefined();
  });

  it('listContainer is defined', () => {
    expect(listContainer).toBeDefined();
  });

  it('listItem is defined', () => {
    expect(listItem).toBeDefined();
  });

  it('modalBackdrop is defined', () => {
    expect(modalBackdrop).toBeDefined();
  });

  it('modalContent is defined', () => {
    expect(modalContent).toBeDefined();
  });
});
