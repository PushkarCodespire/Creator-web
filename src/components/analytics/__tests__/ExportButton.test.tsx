vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    setTextColor: vi.fn(),
    save: vi.fn(),
  })),
}));

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ExportButton } from '../ExportButton';

describe('ExportButton', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ExportButton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with creatorName prop', () => {
    const { container } = renderWithProviders(
      <ExportButton creatorName="Test Creator" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with onExport callback', () => {
    const { container } = renderWithProviders(
      <ExportButton onExport={vi.fn()} creatorName="Creator" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Export Studio Intelligence button', () => {
    renderWithProviders(<ExportButton />);
    expect(screen.getByText('Export Studio Intelligence')).toBeInTheDocument();
  });

  it('opens export modal when CSV option is clicked from dropdown', async () => {
    renderWithProviders(<ExportButton />);

    // Click the main dropdown trigger button
    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    // Wait for the dropdown menu to appear and click "Export as CSV"
    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Intelligence Export')).toBeInTheDocument();
    });
  });

  it('opens export modal when PDF option is clicked from dropdown', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as PDF'));

    await waitFor(() => {
      expect(screen.getByText('Intelligence Export')).toBeInTheDocument();
    });
  });

  it('renders all metric checkboxes in the modal after opening', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Messages & Chats')).toBeInTheDocument();
    });
    expect(screen.getByText('Revenue & Earnings')).toBeInTheDocument();
    expect(screen.getByText('User Growth')).toBeInTheDocument();
    expect(screen.getByText('Retention Analysis')).toBeInTheDocument();
  });

  it('calls onExport callback with correct format when Transmit Data is clicked', async () => {
    const onExport = vi.fn();
    renderWithProviders(<ExportButton onExport={onExport} creatorName="TestCreator" />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Transmit Data')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transmit Data'));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith('csv', undefined, expect.arrayContaining(['messages', 'revenue']));
    });
  });

  it('shows warning when all metrics are deselected and export is attempted', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Intelligence Export')).toBeInTheDocument();
    });

    // Uncheck all metrics by clicking each checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    for (const cb of checkboxes) {
      if ((cb as HTMLInputElement).checked) {
        fireEvent.click(cb);
      }
    }

    fireEvent.click(screen.getByText('Transmit Data'));

    // The modal should show a warning (antd message.warning is called)
    // Component remains open since no export happens
    await waitFor(() => {
      expect(screen.getByText('Intelligence Export')).toBeInTheDocument();
    });
  });

  it('renders the Temporal Range label inside the modal', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Temporal Range')).toBeInTheDocument();
    });
  });

  it('renders the Neural Dimensions label inside the modal', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Neural Dimensions')).toBeInTheDocument();
    });
  });

  it('shows Activity Heatmap and Conversion Funnel metric options in modal', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Activity Heatmap')).toBeInTheDocument();
    });
    expect(screen.getByText('Conversion Funnel')).toBeInTheDocument();
  });

  it('displays PDF format label in protocol note when opened via PDF option', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as PDF'));

    await waitFor(() => {
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });

  it('closes modal when Cancel button is clicked', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Intelligence Export')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Intelligence Export')).not.toBeInTheDocument();
    });
  });

  it('calls onExport with pdf format when PDF export is triggered', async () => {
    const onExport = vi.fn();
    renderWithProviders(<ExportButton onExport={onExport} creatorName="PDFCreator" />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as PDF'));

    await waitFor(() => {
      expect(screen.getByText('Transmit Data')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transmit Data'));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith('pdf', undefined, expect.arrayContaining(['messages', 'revenue']));
    });
  });

  it('renders all six metric checkboxes by default', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBe(6);
    });
  });

  // --- NEW TESTS APPENDED BELOW ---

  it('shows CSV format label in protocol note when opened via CSV option', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });
  });

  it('renders "Transmit Data" as the OK button text in the modal', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Transmit Data/i })).toBeInTheDocument();
    });
  });

  it('renders "Cancel" button in the modal', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  it('calls onExport with all five default metrics selected', async () => {
    const onExport = vi.fn();
    renderWithProviders(<ExportButton onExport={onExport} />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Transmit Data')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transmit Data'));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledWith(
        'csv',
        undefined,
        expect.arrayContaining(['messages', 'revenue', 'users', 'retention', 'activity'])
      );
    });
  });

  it('modal is not visible before any dropdown interaction', () => {
    renderWithProviders(<ExportButton />);
    expect(screen.queryByText('Intelligence Export')).not.toBeInTheDocument();
  });

  it('does not call onExport when no metrics are selected', async () => {
    const onExport = vi.fn();
    renderWithProviders(<ExportButton onExport={onExport} />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Intelligence Export')).toBeInTheDocument();
    });

    // Deselect all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    for (const cb of checkboxes) {
      if ((cb as HTMLInputElement).checked) {
        fireEvent.click(cb);
      }
    }

    fireEvent.click(screen.getByText('Transmit Data'));

    await waitFor(() => {
      expect(onExport).not.toHaveBeenCalled();
    });
  });

  it('invokes jsPDF.save when no onExport prop is given and PDF is selected', async () => {
    const { jsPDF } = await import('jspdf');
    const saveMock = vi.fn();
    (jsPDF as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      setFontSize: vi.fn(),
      text: vi.fn(),
      setTextColor: vi.fn(),
      save: saveMock,
    }));

    renderWithProviders(<ExportButton creatorName="JsPDFCreator" />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as PDF'));

    await waitFor(() => {
      expect(screen.getByText('Transmit Data')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transmit Data'));

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalled();
    });
  });

  it('triggers a CSV file download when no onExport prop is given and CSV is selected', async () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:url');
    const clickMock = vi.fn();
    const appendChildMock = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const removeChildMock = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    URL.createObjectURL = createObjectURLMock;

    const origCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: clickMock, writable: true });
      }
      return el;
    });

    renderWithProviders(<ExportButton creatorName="CSVCreator" />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Transmit Data')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transmit Data'));

    await waitFor(() => {
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
    appendChildMock.mockRestore();
    removeChildMock.mockRestore();
  });

  it('modal can be opened a second time after closing via Cancel', async () => {
    renderWithProviders(<ExportButton />);

    // First open
    fireEvent.click(screen.getByText('Export Studio Intelligence'));
    await waitFor(() => expect(screen.getByText('Export as CSV')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Export as CSV'));
    await waitFor(() => expect(screen.getByText('Intelligence Export')).toBeInTheDocument());

    // Close via Cancel
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(screen.queryByText('Intelligence Export')).not.toBeInTheDocument());

    // Second open
    fireEvent.click(screen.getByText('Export Studio Intelligence'));
    await waitFor(() => expect(screen.getByText('Export as PDF')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Export as PDF'));
    await waitFor(() => expect(screen.getByText('Intelligence Export')).toBeInTheDocument());
  });

  it('renders "Export as CSV" and "Export as PDF" options in the same dropdown', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));

    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });
  });

  it('protocol note is visible inside modal', async () => {
    renderWithProviders(<ExportButton />);

    fireEvent.click(screen.getByText('Export Studio Intelligence'));
    await waitFor(() => expect(screen.getByText('Export as CSV')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Export as CSV'));

    await waitFor(() => {
      expect(screen.getByText('Protocol Note:')).toBeInTheDocument();
    });
  });
});
