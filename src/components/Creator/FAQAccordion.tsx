import { Collapse } from 'antd';
import { QuestionCircleOutlined, RightOutlined } from '@ant-design/icons';
import { colors, spacing, typography } from '../../styles/tokens';
import CustomCard from '../common/Card/CustomCard';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  creatorName: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, creatorName }) => {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <CustomCard depth={1} style={{ marginBottom: spacing[6], background: 'white', color: colors.gray[900] }}>
      <h3
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing[4],
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          color: colors.gray[900],
        }}
      >
        <QuestionCircleOutlined style={{ color: colors.primary.solid }} />
        Frequently Asked Questions
      </h3>
      <Collapse
        accordion
        bordered={false}
        style={{ background: 'transparent' }}
        expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} style={{ color: colors.gray[600] }} />}
        items={faqs.map((faq, index) => ({
          key: index,
          label: (
            <span style={{ fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.base, color: colors.gray[800] }}>
              {faq.question}
            </span>
          ),
          children: <div style={{ color: colors.gray[700], lineHeight: 1.8, padding: spacing[2] }}>{faq.answer}</div>,
        }))}
      />
    </CustomCard>
  );
};

export default FAQAccordion;



