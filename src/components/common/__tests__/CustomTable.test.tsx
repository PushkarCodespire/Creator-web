// ===========================================
// TESTS: CustomTable component
// ===========================================

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CustomTable from '../Table/CustomTable';

vi.mock('antd', () => ({
  Table: ({ columns, dataSource, className, pagination, ...rest }: any) => (
    <div
      data-testid="ant-table"
      className={className}
      data-pagination={JSON.stringify(pagination)}
    >
      {dataSource?.map((row: any, i: number) => (
        <div key={i} data-testid="table-row">{JSON.stringify(row)}</div>
      ))}
    </div>
  ),
}));

vi.mock('../../../styles/tokens', () => ({
  colors: {
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 600: '#4b5563' },
    text: { secondary: '#6b7280' },
    primary: { solid: '#3b82f6' },
  },
  shadows: { md: '0 4px 6px rgba(0,0,0,0.1)' },
}));

describe('CustomTable', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CustomTable />);
    expect(container).toBeTruthy();
  });

  it('renders the ant-table container', () => {
    renderWithProviders(<CustomTable />);
    expect(screen.getByTestId('ant-table')).toBeInTheDocument();
  });

  it('renders with dataSource rows', () => {
    const data = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    renderWithProviders(<CustomTable dataSource={data} />);
    const rows = screen.getAllByTestId('table-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Alice');
    expect(rows[1].textContent).toContain('Bob');
  });

  it('applies custom-table-container class to wrapper div', () => {
    const { container } = renderWithProviders(<CustomTable />);
    expect(container.querySelector('.custom-table-container')).toBeInTheDocument();
  });

  it('passes className prop merged with custom-table to the table', () => {
    renderWithProviders(<CustomTable className="my-extra-class" />);
    const table = screen.getByTestId('ant-table');
    expect(table.className).toContain('custom-table');
    expect(table.className).toContain('my-extra-class');
  });

  it('renders with pagination=false and passes false to table', () => {
    renderWithProviders(<CustomTable pagination={false} />);
    const table = screen.getByTestId('ant-table');
    expect(table.getAttribute('data-pagination')).toBe('false');
  });

  it('renders with column definitions', () => {
    const columns = [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age', dataIndex: 'age', key: 'age' },
    ];
    const { container } = renderWithProviders(<CustomTable columns={columns} />);
    // Table renders without error when columns are provided
    expect(container.querySelector('.custom-table-container')).toBeInTheDocument();
  });

  it('renders a style tag for CSS injection', () => {
    const { container } = renderWithProviders(<CustomTable />);
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.textContent).toContain('custom-table');
  });

  it('style tag contains custom-pagination class', () => {
    const { container } = renderWithProviders(<CustomTable />);
    const styleTag = container.querySelector('style');
    expect(styleTag?.textContent).toContain('custom-pagination');
  });

  it('style tag references ant-table-thead', () => {
    const { container } = renderWithProviders(<CustomTable />);
    const styleTag = container.querySelector('style');
    expect(styleTag?.textContent).toContain('ant-table-thead');
  });

  it('wraps table inside custom-table-container div', () => {
    renderWithProviders(<CustomTable />);
    const table = screen.getByTestId('ant-table');
    expect(table.closest('.custom-table-container')).toBeInTheDocument();
  });

  it('does not render any table rows when dataSource is empty array', () => {
    renderWithProviders(<CustomTable dataSource={[]} />);
    expect(screen.queryAllByTestId('table-row')).toHaveLength(0);
  });

  it('renders the correct number of rows for a single-item dataSource', () => {
    renderWithProviders(<CustomTable dataSource={[{ id: 99, label: 'Only One' }]} />);
    expect(screen.getAllByTestId('table-row')).toHaveLength(1);
  });

  it('row content includes all fields from the data object', () => {
    const data = [{ id: 5, name: 'Charlie', age: 30 }];
    renderWithProviders(<CustomTable dataSource={data} />);
    const row = screen.getByTestId('table-row');
    expect(row.textContent).toContain('Charlie');
    expect(row.textContent).toContain('30');
  });

  it('passes custom pagination object through when pagination is not false', () => {
    const pag = { pageSize: 5, current: 2 };
    renderWithProviders(<CustomTable pagination={pag} />);
    const table = screen.getByTestId('ant-table');
    const parsed = JSON.parse(table.getAttribute('data-pagination') || '{}');
    expect(parsed.pageSize).toBe(5);
    expect(parsed.current).toBe(2);
  });

  it('custom-table class is always present regardless of extra className', () => {
    renderWithProviders(<CustomTable />);
    const table = screen.getByTestId('ant-table');
    expect(table.className).toContain('custom-table');
  });

  it('renders with no extra className when className prop is omitted', () => {
    renderWithProviders(<CustomTable />);
    const table = screen.getByTestId('ant-table');
    // className should be "custom-table " (with trailing space) — still includes custom-table
    expect(table.className.trim()).toBe('custom-table');
  });
});
