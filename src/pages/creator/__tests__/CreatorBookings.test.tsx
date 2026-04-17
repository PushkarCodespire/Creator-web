import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  bookingApi: {
    getSlots: vi.fn().mockResolvedValue({
      data: { data: [] },
    }),
    getRequests: vi.fn().mockResolvedValue({
      data: { data: [] },
    }),
    getStats: vi.fn().mockResolvedValue({
      data: { data: { totalSlots: 5, totalBookings: 3, pendingRequests: 1 } },
    }),
    createSlot: vi.fn().mockResolvedValue({ data: { data: { id: 's1' } } }),
    deleteSlot: vi.fn().mockResolvedValue({ data: { success: true } }),
    acceptRequest: vi.fn().mockResolvedValue({ data: { success: true } }),
    declineRequest: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  creatorApi: {
    updateProfile: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import CreatorBookings from '../CreatorBookings';

describe('CreatorBookings', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CreatorBookings />);
    expect(screen.getByText(/loading bookings/i)).toBeInTheDocument();
  });

  it('renders calendar and bookings page header after data loads', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Calendar & Bookings')).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Total Slots')).toBeInTheDocument();
    });

    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders booking requests section', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Booking Requests')).toBeInTheDocument();
    });

    expect(screen.getByText('No pending requests')).toBeInTheDocument();
  });

  it('renders confirmed bookings section', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Confirmed Bookings')).toBeInTheDocument();
    });

    expect(screen.getByText('No confirmed bookings yet')).toBeInTheDocument();
  });

  it('shows select a date prompt before date is clicked', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Select a date')).toBeInTheDocument();
    });
  });
});
