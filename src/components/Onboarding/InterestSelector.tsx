// ===========================================
// INTEREST SELECTOR COMPONENT
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, message as antMessage, Spin } from 'antd';
import { CheckOutlined, HeartOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { userApi } from '../../services/api';
import { colors, spacing } from '../../styles/tokens';

interface InterestSelectorProps {
  title?: string;
  description?: string;
  minSelection?: number;
  maxSelection?: number;
  onComplete?: (interests: string[]) => void;
  showSkip?: boolean;
  initialInterests?: string[];
}

interface Category {
  value: string;
  label: string;
  icon: string;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  title = 'What are you interested in?',
  description = 'Select at least 3 categories to personalize your experience',
  minSelection = 3,
  maxSelection = 10,
  onComplete,
  showSkip = false,
  initialInterests = [],
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await userApi.getCategories();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      antMessage.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (value: string) => {
    if (selectedInterests.includes(value)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== value));
    } else {
      if (selectedInterests.length >= maxSelection) {
        antMessage.warning(`You can select up to ${maxSelection} interests`);
        return;
      }
      setSelectedInterests([...selectedInterests, value]);
    }
  };

  const handleSave = async () => {
    if (selectedInterests.length < minSelection) {
      antMessage.warning(`Please select at least ${minSelection} interests`);
      return;
    }

    try {
      setSaving(true);
      await userApi.updateInterests(selectedInterests);
      antMessage.success('Interests saved successfully!');

      if (onComplete) {
        onComplete(selectedInterests);
      }
    } catch (error: any) {
      console.error('Failed to save interests:', error);
      antMessage.error(error.response?.data?.error || 'Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete([]);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing[8] }}>
        <Spin size="large" />
        <p style={{ marginTop: spacing[4], color: colors.gray[600] }}>
          Loading categories...
        </p>
      </div>
    );
  }

  const progressPercentage = Math.min(100, (selectedInterests.length / minSelection) * 100);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: spacing[6] }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: spacing[6] }}
      >
        <div
          style={{
            fontSize: '40px',
            marginBottom: spacing[3],
          }}
        >
          <HeartOutlined style={{ color: colors.error.solid }} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: spacing[2] }}>
          {title}
        </h1>
        <p style={{ fontSize: '16px', color: colors.gray[600], marginBottom: spacing[4] }}>
          {description}
        </p>

        {/* Progress Indicator */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: spacing[2],
              fontSize: '14px',
              color: colors.gray[600],
            }}
          >
            <span>
              Selected: <strong>{selectedInterests.length}</strong> / {maxSelection}
            </span>
            <span>
              Minimum: <strong>{minSelection}</strong>
            </span>
          </div>
          <div
            style={{
              height: '8px',
              background: colors.gray[200],
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%',
                background:
                  selectedInterests.length >= minSelection
                    ? `linear-gradient(to right, ${colors.success.solid}, ${colors.primary.solid})`
                    : colors.primary.solid,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Category Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: spacing[6] }}>
          {categories.map((category, index) => {
            const isSelected = selectedInterests.includes(category.value);

            return (
              <Col key={category.value} xs={12} sm={8} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hoverable
                    onClick={() => toggleInterest(category.value)}
                    style={{
                      borderRadius: '12px',
                      border: `2px solid ${
                        isSelected ? colors.primary.solid : colors.gray[300]
                      }`,
                      background: isSelected ? colors.primary.subtle : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: '100%',
                    }}
                    bodyStyle={{
                      textAlign: 'center',
                      padding: spacing[4],
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: spacing[2],
                          right: spacing[2],
                          background: colors.primary.solid,
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <CheckOutlined style={{ fontSize: '12px' }} />
                      </div>
                    )}

                    <div style={{ fontSize: '32px', marginBottom: spacing[2] }}>
                      {category.icon}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? colors.primary.solid : colors.gray[800],
                      }}
                    >
                      {category.label}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'center' }}>
          {showSkip && (
            <Button size="large" onClick={handleSkip} disabled={saving}>
              Skip for now
            </Button>
          )}
          <Button
            type="primary"
            size="large"
            onClick={handleSave}
            loading={saving}
            disabled={selectedInterests.length < minSelection}
            style={{ minWidth: '200px' }}
          >
            {selectedInterests.length < minSelection
              ? `Select ${minSelection - selectedInterests.length} more`
              : 'Continue'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default InterestSelector;
