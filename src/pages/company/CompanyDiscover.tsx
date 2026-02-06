// ===========================================
// COMPANY DISCOVER CREATORS PAGE
// ===========================================

import { useEffect, useState } from 'react';
import { Row, Col, Card, Avatar, Select, Spin, Empty, Pagination, Tag, Button } from 'antd';
import { MessageOutlined, CheckCircleFilled, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../../services/api';

const CompanyDiscover = () => {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCreators();
  }, [category, currentPage, pageSize]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const response = await companyApi.discoverCreators({
        category,
        verified: 'true',
        page: currentPage,
        limit: pageSize
      });
      setCreators(response.data.data.creators || []);
      setTotal(response.data.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch creators:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-discover fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#F8FAFC' }}>
          Discover Creators
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: '#94A3B8', fontSize: '16px', margin: 0 }}>Find the perfect talent for your next campaign</p>
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 220, height: 40 }}
            onChange={(value) => {
              setCategory(value);
              setCurrentPage(1);
            }}
          >
            <Select.Option value="Fitness">Fitness & Health</Select.Option>
            <Select.Option value="Business">Business & Finance</Select.Option>
            <Select.Option value="Technology">Tech & AI</Select.Option>
            <Select.Option value="Lifestyle">Lifestyle & Travel</Select.Option>
            <Select.Option value="Entertainment">Entertainment</Select.Option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
      ) : creators.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#1E293B', borderRadius: '16px', border: '1px solid #334155' }}>
          <Empty description={<span style={{ color: '#94A3B8' }}>No creators found matching your criteria</span>} />
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {creators.map((creator) => (
              <Col xs={24} sm={12} md={8} lg={6} key={creator.id}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  bodyStyle={{ padding: '24px', textAlign: 'center' }}
                  onClick={() => navigate(`/creator/${creator.id}`)}
                >
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <Avatar
                      size={100}
                      src={creator.profileImage}
                      style={{
                        border: '4px solid #334155',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    >
                      {creator.displayName?.[0] || <UserOutlined />}
                    </Avatar>
                    {creator.isVerified && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: '#fff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircleFilled style={{ color: '#3B82F6', fontSize: '16px' }} />
                      </div>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#F8FAFC' }}>
                    {creator.displayName}
                  </h3>

                  <div style={{ marginBottom: '16px', height: '24px' }}>
                    {creator.category && (
                      <Tag color="blue" style={{ border: 'none', background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
                        {creator.category}
                      </Tag>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: '#94A3B8', fontSize: '13px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageOutlined /> <span>{creator.totalChats || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#FCD34D' }}>⭐</span> <span>{creator.rating || 'New'}</span>
                    </div>
                  </div>

                  <Button
                    block
                    style={{ marginTop: '20px', background: 'transparent', borderColor: '#475569', color: '#F8FAFC' }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      // Handle invite logic or navigation
                      navigate(`/creator/${creator.id}`);
                    }}
                  >
                    View Profile
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          {total > pageSize && (
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              onShowSizeChange={(_current, size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              showSizeChanger
              pageSizeOptions={['12', '24', '48', '96']}
              style={{ marginTop: '40px', textAlign: 'center' }}
              showTotal={(total) => <span style={{ color: '#94A3B8' }}>Total {total} creators</span>}
            />
          )}
        </>
      )}

      <style>{`
        .ant-pagination-item {
          background: transparent !important;
          border-color: #334155 !important;
        }
        .ant-pagination-item a {
          color: #94A3B8 !important;
        }
        .ant-pagination-item-active {
          border-color: #6366F1 !important;
          background: rgba(99, 102, 241, 0.1) !important;
        }
        .ant-pagination-item-active a {
          color: #6366F1 !important;
        }
      `}</style>
    </div>
  );
};

export default CompanyDiscover;
