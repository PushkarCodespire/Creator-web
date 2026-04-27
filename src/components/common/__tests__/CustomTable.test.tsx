import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CustomTable from '../Table/CustomTable';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
];
const data = [
  { key: '1', name: 'Alice', age: 30 },
  { key: '2', name: 'Bob', age: 25 },
];

describe('CustomTable', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <CustomTable columns={columns} dataSource={[]} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with data', () => {
    const { container } = renderWithProviders(
      <CustomTable columns={columns} dataSource={data} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with pagination disabled', () => {
    const { container } = renderWithProviders(
      <CustomTable columns={columns} dataSource={data} pagination={false} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
