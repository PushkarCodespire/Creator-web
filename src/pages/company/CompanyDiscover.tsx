import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Avatar, Select, Spin, Empty, Pagination, Tag, Button, Typography } from 'antd';
import { MessageOutlined, CheckCircleFilled, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { companyApi, getImageUrl } from '../../services/api';
import { logger } from '../../utils/logger';
import { colors, shadows } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const CompanyDiscover = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      logger.error('Failed to fetch creators:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '32px' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Discover Creators
        </Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>Find the perfect talent for your next campaign</Text>
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 220, borderRadius: '12px' }}
            size="large"
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
        <Card style={{ textAlign: 'center', padding: '60px', background: '#ffffff', borderRadius: '24px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.md }}>
          <Empty description={<Text style={{ color: colors.text.tertiary, fontWeight: 500 }}>No creators found matching your criteria</Text>} />
        </Card>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {creators.map((creator) => (
              <Col xs={24} sm={12} md={8} lg={6} key={creator.id}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${colors.gray[100]}`,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: shadows.md
                  }}
                  bodyStyle={{ padding: '24px', textAlign: 'center' }}
                  onClick={() => navigate(`/creator/${creator.id}`)}
                >
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <Avatar
                      size={100}
                      src={creator.profileImage ? getImageUrl(creator.profileImage) : undefined}
                      style={{
                        border: `3px solid ${colors.primary.subtle}`,
                        boxShadow: shadows.sm,
                        background: colors.gray[50]
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
                        justifyContent: 'center',
                        boxShadow: shadows.sm
                      }}>
                        <CheckCircleFilled style={{ color: colors.primary.solid, fontSize: '16px' }} />
                      </div>
                    )}
                  </div>

                  <Title level={4} style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: colors.text.primary }}>
                    {creator.displayName}
                  </Title>

                  <div style={{ marginBottom: '16px', height: '24px' }}>
                    {creator.category && (
                      <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 700 }}>
                        {creator.category}
                      </Tag>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: colors.text.tertiary, fontSize: '12px', borderTop: `1px solid ${colors.gray[50]}`, paddingTop: '16px', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageOutlined /> <span>{creator.totalChats || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#F59E0B' }}>⭐</span> <span>{creator.rating || 'New'}</span>
                    </div>
                  </div>

                  <Button
                    block
                    type="primary"
                    style={{ marginTop: '20px', borderRadius: '12px', fontWeight: 700, height: '40px', background: colors.primary.solid }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
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
        .ant-select-selector {
          border-radius: 12px !important;
          border: 1px solid ${colors.gray[200]} !important;
        }
        .ant-pagination-item {
          border-radius: 8px !important;
          border-color: ${colors.gray[200]} !important;
        }
        .ant-pagination-item a {
          color: ${colors.text.tertiary} !important;
          font-weight: 700 !important;
        }
        .ant-pagination-item-active {
          border-color: ${colors.primary.solid} !important;
          background: ${colors.primary.subtle} !important;
        }
        .ant-pagination-item-active a {
          color: ${colors.primary.solid} !important;
        }
      `}</style>
    </motion.div>
  );
};

export default CompanyDiscover;
