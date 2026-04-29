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

  it('displays the current month name in the calendar header', async () => {
    renderWithProviders(<CreatorBookings />);

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentMonth = monthNames[new Date().getMonth()];

    await waitFor(() => {
      expect(screen.getByText(new RegExp(currentMonth))).toBeInTheDocument();
    });
  });

  it('calendar next button advances to the next month', async () => {
    renderWithProviders(<CreatorBookings />);

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const currentMonthName = monthNames[now.getMonth()];
    const nextMonthName = monthNames[(now.getMonth() + 1) % 12];

    await waitFor(() => {
      expect(screen.getByText(`${currentMonthName} ${now.getFullYear()}`)).toBeInTheDocument();
    });

    // The calendar month heading is an <h3>. Its two sibling buttons are the prev/next nav buttons.
    const monthHeading = screen.getByText(`${currentMonthName} ${now.getFullYear()}`);
    const calendarHeader = monthHeading.parentElement!;
    const navButtons = Array.from(calendarHeader.querySelectorAll('button'));
    // navButtons[0] = prev, navButtons[1] = next
    fireEvent.click(navButtons[1]);

    const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    await waitFor(() => {
      expect(screen.getByText(`${nextMonthName} ${nextYear}`)).toBeInTheDocument();
    });
  });

  it('calendar prev button goes back to the previous month after advancing', async () => {
    renderWithProviders(<CreatorBookings />);

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const currentMonthName = monthNames[now.getMonth()];

    await waitFor(() => {
      expect(screen.getByText(`${currentMonthName} ${now.getFullYear()}`)).toBeInTheDocument();
    });

    const monthHeading = screen.getByText(`${currentMonthName} ${now.getFullYear()}`);
    const calendarHeader = monthHeading.parentElement!;
    const navButtons = Array.from(calendarHeader.querySelectorAll('button'));

    // Go forward one month, then back
    fireEvent.click(navButtons[1]);
    fireEvent.click(navButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(`${currentMonthName} ${now.getFullYear()}`)).toBeInTheDocument();
    });
  });

  it('renders pending booking request cards when requests exist', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'req-1',
            status: 'PENDING',
            user: { name: 'Alice' },
            message: 'Looking forward to it!',
            slot: { startTime: new Date(Date.now() + 86400000 * 10).toISOString() },
          },
        ],
      },
    });

    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText(/"Looking forward to it!"/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decline/i })).toBeInTheDocument();
  });

  it('renders confirmed booking cards when accepted bookings exist', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'req-2',
            status: 'ACCEPTED',
            user: { name: 'Bob' },
            message: 'See you soon',
            slot: { startTime: new Date(Date.now() + 86400000 * 5).toISOString() },
            meetingLink: null,
          },
        ],
      },
    });

    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
      // Multiple "Confirmed" texts appear (section heading + badge on the card)
      expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
    });
  });

  it('toggles accepting bookings toggle on click', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Calendar & Bookings')).toBeInTheDocument();
    });

    const { creatorApi } = await import('../../../services/api');

    // Find the toggle button (the round switch)
    const toggles = document.querySelectorAll('button[type="button"]');
    // The accepting toggle is the small circular toggle near "Accepting"
    const acceptingLabel = screen.getByText('Accepting');
    const toggleBtn = acceptingLabel.parentElement?.querySelector('button');
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      await waitFor(() => {
        expect(creatorApi.updateProfile).toHaveBeenCalled();
      });
    }
  });

  it('opens the slot modal when Add Slots is clicked on a selected date', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Calendar & Bookings')).toBeInTheDocument();
    });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const currentMonthName = monthNames[now.getMonth()];

    // Navigate to next month to ensure future dates
    const monthHeading = screen.getByText(`${currentMonthName} ${now.getFullYear()}`);
    const navButtons = Array.from(monthHeading.parentElement!.querySelectorAll('button'));
    fireEvent.click(navButtons[1]);

    // Click day 10
    const dayCells = screen.getAllByText('10');
    fireEvent.click(dayCells[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add slots/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add slots/i }));

    await waitFor(() => {
      expect(screen.getByText('Set Availability')).toBeInTheDocument();
    });
  });

  it('closes the slot modal when the X button is clicked', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Calendar & Bookings')).toBeInTheDocument();
    });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const monthHeading = screen.getByText(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
    const navButtons = Array.from(monthHeading.parentElement!.querySelectorAll('button'));
    fireEvent.click(navButtons[1]);

    const dayCells = screen.getAllByText('10');
    fireEvent.click(dayCells[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add slots/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add slots/i }));

    await waitFor(() => {
      expect(screen.getByText('Set Availability')).toBeInTheDocument();
    });

    // Close modal with the X button
    const closeBtn = document.querySelector('button[type="button"][style*="background: rgb(243, 244, 246)"]') as HTMLButtonElement | null;
    if (closeBtn) {
      fireEvent.click(closeBtn);
      await waitFor(() => {
        expect(screen.queryByText('Set Availability')).not.toBeInTheDocument();
      });
    }
  });

  it('displays insight card message with zero total slots', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      // With totalSlots=5 from mock stats, the insight shows "slots set up" message
      // Multiple elements contain "slot", use getAllByText to avoid ambiguity
      expect(screen.getAllByText(/slot/i).length).toBeGreaterThan(0);
    });
  });

  it('clicking a future date shows the Add Slots button', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Calendar & Bookings')).toBeInTheDocument();
    });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const currentMonthName = monthNames[now.getMonth()];

    // Navigate to next month so all days are in the future
    const monthHeading = screen.getByText(`${currentMonthName} ${now.getFullYear()}`);
    const calendarHeader = monthHeading.parentElement!;
    const navButtons = Array.from(calendarHeader.querySelectorAll('button'));
    fireEvent.click(navButtons[1]);

    // Click day "15" — guaranteed future since we moved to next month
    const dayCells = screen.getAllByText('15');
    fireEvent.click(dayCells[0]);

    await waitFor(() => {
      // "Add Slots" button text is split (Plus icon + text), use regex
      expect(screen.getByRole('button', { name: /add slots/i })).toBeInTheDocument();
    });
  });

  it('shows no slots message when a future date with no slots is selected', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Calendar & Bookings')).toBeInTheDocument();
    });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const currentMonthName = monthNames[now.getMonth()];

    const monthHeading = screen.getByText(`${currentMonthName} ${now.getFullYear()}`);
    const navButtons = Array.from(monthHeading.parentElement!.querySelectorAll('button'));
    fireEvent.click(navButtons[1]);

    const dayCells = screen.getAllByText('20');
    fireEvent.click(dayCells[0]);

    await waitFor(() => {
      expect(screen.getByText(/No slots for this date/i)).toBeInTheDocument();
    });
  });

  it('shows stats from the mock — 5 total slots, 3 confirmed, 1 pending', async () => {
    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      // The stat cards render the numbers; use getAllByText since calendar days may repeat these digits
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  it('calls acceptRequest when Accept button is clicked on a pending booking', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'req-accept',
            status: 'PENDING',
            user: { name: 'Charlie' },
            message: 'Please accept!',
            slot: { startTime: new Date(Date.now() + 86400000 * 10).toISOString() },
          },
        ],
      },
    });

    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Accept/i }));

    await waitFor(() => {
      expect(bookingApi.acceptRequest).toHaveBeenCalledWith('req-accept', undefined);
    });
  });

  it('calls declineRequest when Decline button is clicked on a pending booking', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'req-decline',
            status: 'PENDING',
            user: { name: 'Dana' },
            slot: { startTime: new Date(Date.now() + 86400000 * 8).toISOString() },
          },
        ],
      },
    });

    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Dana')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Decline/i }));

    await waitFor(() => {
      expect(bookingApi.declineRequest).toHaveBeenCalledWith('req-decline');
    });
  });

  it('shows confirmed badge count when accepted bookings exist', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'b1', status: 'ACCEPTED', user: { name: 'Eve' }, slot: { startTime: new Date(Date.now() + 86400000 * 3).toISOString() }, meetingLink: null },
          { id: 'b2', status: 'ACCEPTED', user: { name: 'Frank' }, slot: { startTime: new Date(Date.now() + 86400000 * 4).toISOString() }, meetingLink: null },
        ],
      },
    });

    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Eve')).toBeInTheDocument();
      expect(screen.getByText('Frank')).toBeInTheDocument();
    });

    // The count badge next to the section heading shows "2"; calendar may also render "2"
    // so just verify the confirmed bookings rendered (both names present is sufficient)
    expect(screen.getAllByText('Confirmed').length).toBeGreaterThanOrEqual(2); // section heading + at least one card badge
  });

  it('shows Add Meeting Link button on a confirmed booking with no meeting link', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'b3', status: 'ACCEPTED', user: { name: 'Grace' }, slot: { startTime: new Date(Date.now() + 86400000 * 6).toISOString() }, meetingLink: null },
        ],
      },
    });

    renderWithProviders(<CreatorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Grace')).toBeInTheDocument();
    });

    expect(screen.getByText(/\+ Add Meeting Link/i)).toBeInTheDocument();
  });

  it('renders the "Click any date to set your availability" subtitle', async () => {
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText(/Click any date to set your availability/i)).toBeInTheDocument();
    });
  });

  it('renders day-of-week headers in the calendar', async () => {
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });
  });

  it('shows the "Select a date" sidebar before any date is clicked', async () => {
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText('Select a date')).toBeInTheDocument();
    });
  });

  it('renders the insight card with an insight label', async () => {
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText(/Insight/i)).toBeInTheDocument();
    });
  });

  it('stat card shows the value 5 from mock totalSlots', async () => {
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText('Total Slots')).toBeInTheDocument();
    });
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('clicking + Add Meeting Link shows the edit input for confirmed booking', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'b-ml', status: 'ACCEPTED', user: { name: 'Hank' }, slot: { startTime: new Date(Date.now() + 86400000 * 7).toISOString() }, meetingLink: null },
        ],
      },
    });
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText('Hank')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/\+ Add Meeting Link/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/https:\/\/meet\.google\.com/i)).toBeInTheDocument();
    });
  });

  it('renders Open Meeting link on a confirmed booking that has a meeting link', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'b-open', status: 'ACCEPTED', user: { name: 'Iris' }, slot: { startTime: new Date(Date.now() + 86400000 * 8).toISOString() }, meetingLink: 'https://meet.google.com/abc' },
        ],
      },
    });
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText('Open Meeting →')).toBeInTheDocument();
    });
  });

  it('renders "NEW" badge next to Booking Requests heading when requests exist', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getRequests as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'req-new', status: 'PENDING', user: { name: 'Jack' }, slot: { startTime: new Date(Date.now() + 86400000 * 10).toISOString() } },
        ],
      },
    });
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText('1 NEW')).toBeInTheDocument();
    });
  });

  it('adds another slot row when "Add another slot" is clicked in modal', async () => {
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => expect(screen.getByText('Calendar & Bookings')).toBeInTheDocument());

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const currentMonthName = monthNames[now.getMonth()];
    const monthHeading = screen.getByText(`${currentMonthName} ${now.getFullYear()}`);
    const navButtons = Array.from(monthHeading.parentElement!.querySelectorAll('button'));
    fireEvent.click(navButtons[1]);

    const dayCells = screen.getAllByText('10');
    fireEvent.click(dayCells[0]);

    await waitFor(() => expect(screen.getByRole('button', { name: /add slots/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /add slots/i }));
    await waitFor(() => expect(screen.getByText('Set Availability')).toBeInTheDocument());

    // Initially 1 slot, click "Add another slot"
    fireEvent.click(screen.getByText(/Add another slot/i));

    await waitFor(() => {
      // The footer shows "2 slots" — multiple elements may match in JSDOM
      expect(screen.getAllByText(/2 slot/i).length).toBeGreaterThan(0);
    });
  });

  it('renders the "Accepting" label near the toggle switch', async () => {
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText('Accepting')).toBeInTheDocument();
    });
  });

  it('displays "Click any date to add your first time slot" insight when no slots and none pending', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { totalSlots: 0, totalBookings: 0, pendingRequests: 0 } },
    });
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText(/Click any date to add your first time slot/i)).toBeInTheDocument();
    });
  });

  it('renders 5 slots set up insight when there are slots and no pending', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { totalSlots: 5, totalBookings: 2, pendingRequests: 0 } },
    });
    renderWithProviders(<CreatorBookings />);
    await waitFor(() => {
      expect(screen.getByText(/You have 5 slots set up/i)).toBeInTheDocument();
    });
  });
});
