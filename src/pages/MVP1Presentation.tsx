// ===========================================
// MVP1 PRESENTATION - Enterprise Grade
// Comprehensive Investor Presentation
// ===========================================

import { useState } from 'react';
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined, ShopOutlined, SettingOutlined, RobotOutlined, DollarOutlined, DatabaseOutlined, ApiOutlined, FileTextOutlined, BarChartOutlined, ArrowRightOutlined, CheckOutlined, MinusOutlined } from '@ant-design/icons';

const MVP1Presentation = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: 'Overview', icon: <FileTextOutlined /> },
    { id: 1, label: 'User Types', icon: <UserOutlined /> },
    { id: 2, label: 'User Journeys', icon: <ArrowRightOutlined /> },
    { id: 3, label: 'AI Technology', icon: <RobotOutlined /> },
    { id: 4, label: 'Features & Pages', icon: <SettingOutlined /> },
    { id: 5, label: 'Money Flow', icon: <DollarOutlined /> },
    { id: 6, label: 'Technical Architecture', icon: <DatabaseOutlined /> },
    { id: 7, label: 'MVP1 Status', icon: <BarChartOutlined /> },
  ];

  const mvp1Completion = 88;
  const _features = {
    complete: 23,
    total: 26,
    percentage: 88
  };

  const featureChecklist = [
    { name: 'AI Chat System', status: 'complete', category: 'Core' },
    { name: 'User Management', status: 'complete', category: 'Core' },
    { name: 'Creator Profiles', status: 'complete', category: 'Core' },
    { name: 'Content Training', status: 'complete', category: 'Core' },
    { name: 'Chat Earnings Hook', status: 'complete', category: 'Earnings' },
    { name: 'Brand Deal Earnings', status: 'complete', category: 'Earnings' },
    { name: 'Earnings Utility', status: 'complete', category: 'Earnings' },
    { name: 'Bank Accounts', status: 'complete', category: 'Payout' },
    { name: 'Payout Requests', status: 'complete', category: 'Payout' },
    { name: 'Earnings Ledger', status: 'complete', category: 'Payout' },
    { name: 'Razorpay X Integration', status: 'complete', category: 'Payout' },
    { name: 'Subscription Upgrade', status: 'complete', category: 'Payment' },
    { name: 'Razorpay Integration', status: 'complete', category: 'Payment' },
    { name: 'Transaction Tracking', status: 'complete', category: 'Payment' },
    { name: 'Email Templates (9)', status: 'complete', category: 'Email' },
    { name: 'Email Preview Page', status: 'complete', category: 'Email' },
    { name: 'SendGrid Integration', status: 'complete', category: 'Email' },
    { name: '50 Creators Seeded', status: 'complete', category: 'Demo Data' },
    { name: '200 Users Seeded', status: 'complete', category: 'Demo Data' },
    { name: '1000+ Conversations', status: 'complete', category: 'Demo Data' },
    { name: 'Brand Deals Created', status: 'complete', category: 'Demo Data' },
    { name: 'Realistic Earnings', status: 'complete', category: 'Demo Data' },
    { name: 'Documentation Complete', status: 'complete', category: 'Documentation' },
    { name: 'Demo Mode Banner', status: 'pending', category: 'UI Enhancement' },
    { name: 'Advanced Analytics', status: 'pending', category: 'Analytics' },
    { name: 'Mobile App', status: 'pending', category: 'Future' },
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 0: return <OverviewTab />;
      case 1: return <UserTypesTab />;
      case 2: return <UserJourneysTab />;
      case 3: return <AITechnologyTab />;
      case 4: return <FeaturesPagesTab />;
      case 5: return <MoneyFlowTab />;
      case 6: return <TechnicalArchitectureTab />;
      case 7: return <MVP1StatusTab features={featureChecklist} completion={mvp1Completion} />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>AI Creator Platform</h1>
          <p style={styles.subtitle}>MVP1 Investor Presentation</p>
        </div>
        <div style={styles.completionBadge}>
          <div style={styles.completionCircle}>
            <span style={styles.completionText}>{mvp1Completion}%</span>
          </div>
          <span style={styles.completionLabel}>Complete</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <TabContent />
      </div>
    </div>
  );
};

// ===========================================
// TAB COMPONENTS
// ===========================================

const OverviewTab = () => (
  <div style={styles.tabContent}>
    <div style={styles.grid}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Platform Vision</h2>
        <p style={styles.cardText}>
          A B2C marketplace where fans chat with AI-powered clones of their favorite creators. 
          Built for the Indian creator economy - "Cameo meets ChatGPT".
        </p>
        <div style={styles.highlightBox}>
          <strong>Value Proposition:</strong> Fans get 24/7 access to personalized advice from 
          AI versions of creators, while creators monetize their expertise through subscriptions 
          and brand deals.
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Key Metrics</h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metric}>
            <div style={styles.metricValue}>50</div>
            <div style={styles.metricLabel}>Creators</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricValue}>200</div>
            <div style={styles.metricLabel}>Users</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricValue}>1,126</div>
            <div style={styles.metricLabel}>Conversations</div>
          </div>
          <div style={styles.metric}>
            <div style={styles.metricValue}>14,183</div>
            <div style={styles.metricLabel}>Messages</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Business Model</h2>
        <div style={styles.businessModel}>
          <div style={styles.businessItem}>
            <CheckCircleOutlined style={styles.checkIcon} />
            <div>
              <strong>User Subscriptions:</strong> ₹799/month
              <div style={styles.subtext}>Platform: 20% | Creator: 80%</div>
            </div>
          </div>
          <div style={styles.businessItem}>
            <CheckCircleOutlined style={styles.checkIcon} />
            <div>
              <strong>Brand Deal Commission:</strong> 10%
              <div style={styles.subtext}>On all creator-brand collaborations</div>
            </div>
          </div>
          <div style={styles.businessItem}>
            <CheckCircleOutlined style={styles.checkIcon} />
            <div>
              <strong>Break-even Target:</strong> 600-700 premium users
              <div style={styles.subtext}>Monthly recurring revenue model</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Technology Stack</h2>
        <div style={styles.techStack}>
          <div style={styles.techItem}>
            <strong>Frontend:</strong> React 18 + TypeScript + Ant Design
          </div>
          <div style={styles.techItem}>
            <strong>Backend:</strong> Node.js + Express + PostgreSQL
          </div>
          <div style={styles.techItem}>
            <strong>AI:</strong> OpenAI GPT-4o mini + Vector Search
          </div>
          <div style={styles.techItem}>
            <strong>Payments:</strong> Razorpay Integration
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserTypesTab = () => (
  <div style={styles.tabContent}>
    <div style={styles.grid}>
      <div style={styles.userCard}>
        <div style={styles.userIcon}>
          <UserOutlined style={{ fontSize: 32, color: '#2C3E50' }} />
        </div>
        <h3 style={styles.userTitle}>Fans (Users)</h3>
        <ul style={styles.userList}>
          <li>Chat with AI versions of creators</li>
          <li>Get personalized advice 24/7</li>
          <li>Free: 5 messages/day</li>
          <li>Premium: ₹799/month unlimited</li>
          <li>Access to all creators</li>
        </ul>
      </div>

      <div style={styles.userCard}>
        <div style={styles.userIcon}>
          <TeamOutlined style={{ fontSize: 32, color: '#2C3E50' }} />
        </div>
        <h3 style={styles.userTitle}>Creators</h3>
        <ul style={styles.userList}>
          <li>Upload content for AI training</li>
          <li>Earn from fan conversations</li>
          <li>80% of subscription revenue</li>
          <li>90% of brand deal earnings</li>
          <li>Analytics and insights</li>
        </ul>
      </div>

      <div style={styles.userCard}>
        <div style={styles.userIcon}>
          <ShopOutlined style={{ fontSize: 32, color: '#2C3E50' }} />
        </div>
        <h3 style={styles.userTitle}>Companies (Brands)</h3>
        <ul style={styles.userList}>
          <li>Post collaboration opportunities</li>
          <li>Discover verified creators</li>
          <li>Manage applications and deals</li>
          <li>Track campaign performance</li>
          <li>10% platform commission</li>
        </ul>
      </div>

      <div style={styles.userCard}>
        <div style={styles.userIcon}>
          <SettingOutlined style={{ fontSize: 32, color: '#2C3E50' }} />
        </div>
        <h3 style={styles.userTitle}>Admin</h3>
        <ul style={styles.userList}>
          <li>Platform management</li>
          <li>Creator verification</li>
          <li>Content moderation</li>
          <li>Revenue tracking</li>
          <li>User management</li>
        </ul>
      </div>
    </div>
  </div>
);

const UserJourneysTab = () => (
  <div style={styles.tabContent}>
    <div style={styles.journeyContainer}>
      <div style={styles.journeyCard}>
        <h3 style={styles.journeyTitle}>Fan Journey</h3>
        <div style={styles.flowDiagram}>
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>1</div>
            <div style={styles.flowText}>Visit Homepage</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>2</div>
            <div style={styles.flowText}>Browse Creators</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>3</div>
            <div style={styles.flowText}>View Creator Profile</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>4</div>
            <div style={styles.flowText}>Start Chat</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>5</div>
            <div style={styles.flowText}>AI Responds</div>
          </div>
        </div>
      </div>

      <div style={styles.journeyCard}>
        <h3 style={styles.journeyTitle}>Creator Journey</h3>
        <div style={styles.flowDiagram}>
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>1</div>
            <div style={styles.flowText}>Register & Verify</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>2</div>
            <div style={styles.flowText}>Add Training Content</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>3</div>
            <div style={styles.flowText}>AI Processes Content</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>4</div>
            <div style={styles.flowText}>Fans Start Chatting</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>5</div>
            <div style={styles.flowText}>Earn Money</div>
          </div>
        </div>
      </div>

      <div style={styles.journeyCard}>
        <h3 style={styles.journeyTitle}>Company Journey</h3>
        <div style={styles.flowDiagram}>
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>1</div>
            <div style={styles.flowText}>Register as Company</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>2</div>
            <div style={styles.flowText}>Post Opportunity</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>3</div>
            <div style={styles.flowText}>Review Applications</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>4</div>
            <div style={styles.flowText}>Accept & Create Deal</div>
          </div>
          <ArrowRightOutlined style={styles.flowArrow} />
          <div style={styles.flowStep}>
            <div style={styles.flowNumber}>5</div>
            <div style={styles.flowText}>Track Completion</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AITechnologyTab = () => (
  <div style={styles.tabContent}>
    <div style={styles.grid}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Content Training Pipeline</h2>
        <div style={styles.processFlow}>
          <div style={styles.processStep}>
            <div style={styles.processIcon}>1</div>
            <div>
              <strong>Creator Uploads Content</strong>
              <div style={styles.subtext}>YouTube videos, text files, FAQs</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>2</div>
            <div>
              <strong>Extract & Clean Text</strong>
              <div style={styles.subtext}>Transcript extraction, text processing</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>3</div>
            <div>
              <strong>Split into Chunks</strong>
              <div style={styles.subtext}>500-1000 words per chunk</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>4</div>
            <div>
              <strong>Generate Embeddings</strong>
              <div style={styles.subtext}>OpenAI text-embedding-3-small</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>5</div>
            <div>
              <strong>Store in Vector DB</strong>
              <div style={styles.subtext}>SQLite-based local storage</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Chat Response Flow</h2>
        <div style={styles.processFlow}>
          <div style={styles.processStep}>
            <div style={styles.processIcon}>1</div>
            <div>
              <strong>User Sends Message</strong>
              <div style={styles.subtext}>Saved to database</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>2</div>
            <div>
              <strong>Generate Query Embedding</strong>
              <div style={styles.subtext}>Convert question to numbers</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>3</div>
            <div>
              <strong>Vector Search</strong>
              <div style={styles.subtext}>Find top 5 similar chunks</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>4</div>
            <div>
              <strong>Build Context</strong>
              <div style={styles.subtext}>Personality + chunks + history</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.processArrow} />
          <div style={styles.processStep}>
            <div style={styles.processIcon}>5</div>
            <div>
              <strong>GPT-4o mini Response</strong>
              <div style={styles.subtext}>Sounds like creator</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>AI System Prompt</h2>
        <div style={styles.codeBlock}>
          <pre style={styles.codeText}>
{`You are [Creator Name], a content creator 
having a personalized conversation.

GUIDELINES:
- Respond as [Creator Name] would
- Be warm, friendly, and engaging
- Share knowledge naturally
- Keep responses concise (2-4 paragraphs)
- Never break character

Personality: [Custom traits]
Tone: [friendly/professional/casual]
Relevant Knowledge: [Content chunks]
Chat History: [Previous messages]`}
          </pre>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Technology Components</h2>
        <div style={styles.techComponents}>
          <div style={styles.techComponent}>
            <strong>OpenAI GPT-4o mini</strong>
            <div style={styles.subtext}>Chat completion model</div>
          </div>
          <div style={styles.techComponent}>
            <strong>text-embedding-3-small</strong>
            <div style={styles.subtext}>Embedding generation</div>
          </div>
          <div style={styles.techComponent}>
            <strong>SQLite Vector Store</strong>
            <div style={styles.subtext}>Local similarity search</div>
          </div>
          <div style={styles.techComponent}>
            <strong>Cosine Similarity</strong>
            <div style={styles.subtext}>Relevance scoring</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeaturesPagesTab = () => (
  <div style={styles.tabContent}>
    <div style={styles.featuresGrid}>
      <div style={styles.featureCard}>
        <h3 style={styles.featureTitle}>Public Pages</h3>
        <ul style={styles.featureList}>
          <li><CheckOutlined /> Landing Page - Platform overview</li>
          <li><CheckOutlined /> Creator Gallery - Browse creators</li>
          <li><CheckOutlined /> Creator Profile - View details</li>
          <li><CheckOutlined /> Chat Page - AI conversations</li>
          <li><CheckOutlined /> Pricing - Subscription plans</li>
        </ul>
      </div>

      <div style={styles.featureCard}>
        <h3 style={styles.featureTitle}>User Dashboard</h3>
        <ul style={styles.featureList}>
          <li><CheckOutlined /> Dashboard - Overview & stats</li>
          <li><CheckOutlined /> Chats - Conversation history</li>
          <li><CheckOutlined /> Subscription - Plan management</li>
        </ul>
      </div>

      <div style={styles.featureCard}>
        <h3 style={styles.featureTitle}>Creator Dashboard</h3>
        <ul style={styles.featureList}>
          <li><CheckOutlined /> Home - Analytics overview</li>
          <li><CheckOutlined /> Content - Training management</li>
          <li><CheckOutlined /> Analytics - Performance metrics</li>
          <li><CheckOutlined /> Opportunities - Brand deals</li>
          <li><CheckOutlined /> Payouts - Earnings & withdrawals</li>
          <li><CheckOutlined /> Settings - Profile & AI config</li>
        </ul>
      </div>

      <div style={styles.featureCard}>
        <h3 style={styles.featureTitle}>Company Dashboard</h3>
        <ul style={styles.featureList}>
          <li><CheckOutlined /> Dashboard - Overview</li>
          <li><CheckOutlined /> Opportunities - Post & manage</li>
          <li><CheckOutlined /> Discover - Find creators</li>
        </ul>
      </div>

      <div style={styles.featureCard}>
        <h3 style={styles.featureTitle}>Admin Dashboard</h3>
        <ul style={styles.featureList}>
          <li><CheckOutlined /> Dashboard - Platform stats</li>
          <li><CheckOutlined /> Users - User management</li>
          <li><CheckOutlined /> Creators - Verification</li>
          <li><CheckOutlined /> Deals - Brand deal tracking</li>
          <li><CheckOutlined /> Revenue - Financial overview</li>
          <li><CheckOutlined /> Moderation - Content review</li>
        </ul>
      </div>
    </div>
  </div>
);

const MoneyFlowTab = () => (
  <div style={styles.tabContent}>
    <div style={styles.grid}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Subscription Revenue Flow</h2>
        <div style={styles.moneyFlow}>
          <div style={styles.moneyStep}>
            <div style={styles.moneyAmount}>₹799</div>
            <div style={styles.moneyLabel}>User Pays Monthly</div>
          </div>
          <ArrowRightOutlined style={styles.moneyArrow} />
          <div style={styles.moneyStep}>
            <div style={styles.moneyAmount}>₹159</div>
            <div style={styles.moneyLabel}>Platform (20%)</div>
          </div>
          <ArrowRightOutlined style={styles.moneyArrow} />
          <div style={styles.moneyStep}>
            <div style={styles.moneyAmount}>₹640</div>
            <div style={styles.moneyLabel}>Creator (80%)</div>
          </div>
        </div>
        <div style={styles.moneyDetail}>
          <strong>Per Message:</strong> ₹2.13 per premium user message
          <div style={styles.subtext}>Formula: (₹640 ÷ 30 days) ÷ 10 avg messages</div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Brand Deal Revenue Flow</h2>
        <div style={styles.moneyFlow}>
          <div style={styles.moneyStep}>
            <div style={styles.moneyAmount}>₹50,000</div>
            <div style={styles.moneyLabel}>Deal Amount</div>
          </div>
          <ArrowRightOutlined style={styles.moneyArrow} />
          <div style={styles.moneyStep}>
            <div style={styles.moneyAmount}>₹5,000</div>
            <div style={styles.moneyLabel}>Platform (10%)</div>
          </div>
          <ArrowRightOutlined style={styles.moneyArrow} />
          <div style={styles.moneyStep}>
            <div style={styles.moneyAmount}>₹45,000</div>
            <div style={styles.moneyLabel}>Creator (90%)</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Payout Process</h2>
        <div style={styles.payoutFlow}>
          <div style={styles.payoutStep}>
            <div style={styles.payoutNumber}>1</div>
            <div>
              <strong>Creator Requests Payout</strong>
              <div style={styles.subtext}>Minimum ₹1,000</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.payoutArrow} />
          <div style={styles.payoutStep}>
            <div style={styles.payoutNumber}>2</div>
            <div>
              <strong>System Validates</strong>
              <div style={styles.subtext}>Bank account, KYC, balance</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.payoutArrow} />
          <div style={styles.payoutStep}>
            <div style={styles.payoutNumber}>3</div>
            <div>
              <strong>Calculate Fees</strong>
              <div style={styles.subtext}>₹3 IMPS / ₹20 NEFT</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.payoutArrow} />
          <div style={styles.payoutStep}>
            <div style={styles.payoutNumber}>4</div>
            <div>
              <strong>Process via Razorpay</strong>
              <div style={styles.subtext}>Status: PENDING → PROCESSING</div>
            </div>
          </div>
          <ArrowRightOutlined style={styles.payoutArrow} />
          <div style={styles.payoutStep}>
            <div style={styles.payoutNumber}>5</div>
            <div>
              <strong>Money Sent to Bank</strong>
              <div style={styles.subtext}>Status: COMPLETED</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Earnings Distribution</h2>
        <div style={styles.earningsBreakdown}>
          <div style={styles.earningsItem}>
            <CheckCircleOutlined style={styles.checkIcon} />
            <div>
              <strong>Subscription Earnings</strong>
              <div style={styles.subtext}>₹2.13 per premium message</div>
            </div>
          </div>
          <div style={styles.earningsItem}>
            <CheckCircleOutlined style={styles.checkIcon} />
            <div>
              <strong>Brand Deal Earnings</strong>
              <div style={styles.subtext}>90% of deal amount</div>
            </div>
          </div>
          <div style={styles.earningsItem}>
            <CheckCircleOutlined style={styles.checkIcon} />
            <div>
              <strong>Automatic Distribution</strong>
              <div style={styles.subtext}>Real-time balance updates</div>
            </div>
          </div>
          <div style={styles.earningsItem}>
            <CheckCircleOutlined style={styles.checkIcon} />
            <div>
              <strong>Earnings Ledger</strong>
              <div style={styles.subtext}>Complete transaction history</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TechnicalArchitectureTab = () => (
  <div style={styles.tabContent}>
    <div style={styles.grid}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Frontend Stack</h2>
        <div style={styles.techList}>
          <div style={styles.techListItem}>
            <ApiOutlined style={styles.techIcon} />
            <div>
              <strong>React 18</strong>
              <div style={styles.subtext}>UI framework</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <ApiOutlined style={styles.techIcon} />
            <div>
              <strong>TypeScript</strong>
              <div style={styles.subtext}>Type safety</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <ApiOutlined style={styles.techIcon} />
            <div>
              <strong>Ant Design</strong>
              <div style={styles.subtext}>Component library</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <ApiOutlined style={styles.techIcon} />
            <div>
              <strong>Redux Toolkit</strong>
              <div style={styles.subtext}>State management</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <ApiOutlined style={styles.techIcon} />
            <div>
              <strong>Socket.io Client</strong>
              <div style={styles.subtext}>Real-time updates</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Backend Stack</h2>
        <div style={styles.techList}>
          <div style={styles.techListItem}>
            <DatabaseOutlined style={styles.techIcon} />
            <div>
              <strong>Node.js 20</strong>
              <div style={styles.subtext}>Runtime environment</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <DatabaseOutlined style={styles.techIcon} />
            <div>
              <strong>Express.js</strong>
              <div style={styles.subtext}>Web framework</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <DatabaseOutlined style={styles.techIcon} />
            <div>
              <strong>PostgreSQL</strong>
              <div style={styles.subtext}>Primary database</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <DatabaseOutlined style={styles.techIcon} />
            <div>
              <strong>Prisma ORM</strong>
              <div style={styles.subtext}>Database toolkit</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <DatabaseOutlined style={styles.techIcon} />
            <div>
              <strong>Socket.io</strong>
              <div style={styles.subtext}>Real-time server</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>AI & Data</h2>
        <div style={styles.techList}>
          <div style={styles.techListItem}>
            <RobotOutlined style={styles.techIcon} />
            <div>
              <strong>OpenAI GPT-4o mini</strong>
              <div style={styles.subtext}>Chat completion</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <RobotOutlined style={styles.techIcon} />
            <div>
              <strong>text-embedding-3-small</strong>
              <div style={styles.subtext}>Vector embeddings</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <DatabaseOutlined style={styles.techIcon} />
            <div>
              <strong>SQLite Vector Store</strong>
              <div style={styles.subtext}>Local similarity search</div>
            </div>
          </div>
          <div style={styles.techListItem}>
            <ApiOutlined style={styles.techIcon} />
            <div>
              <strong>YouTube Transcript</strong>
              <div style={styles.subtext}>Content extraction</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Database Schema</h2>
        <div style={styles.schemaList}>
          <div style={styles.schemaItem}>
            <strong>Core:</strong> User, Creator, Company, Subscription
          </div>
          <div style={styles.schemaItem}>
            <strong>Content:</strong> CreatorContent, ContentChunk
          </div>
          <div style={styles.schemaItem}>
            <strong>Chat:</strong> Conversation, Message
          </div>
          <div style={styles.schemaItem}>
            <strong>Deals:</strong> Opportunity, Application, Deal, Milestone
          </div>
          <div style={styles.schemaItem}>
            <strong>Earnings:</strong> EarningsLedger, Payout, BankAccount
          </div>
          <div style={styles.schemaItem}>
            <strong>Social:</strong> Post, Like, Comment, Follow, Bookmark
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MVP1StatusTab = ({ features, completion }: { features: { name: string; status: string; category: string }[], completion: number }) => {
  const completeCount = features.filter(f => f.status === 'complete').length;
  const pendingCount = features.filter(f => f.status === 'pending').length;
  const categories = Array.from(new Set(features.map(f => f.category)));

  return (
    <div style={styles.tabContent}>
      <div style={styles.statusHeader}>
        <div style={styles.statusCard}>
          <div style={styles.statusValue}>{completion}%</div>
          <div style={styles.statusLabel}>Overall Completion</div>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBar, width: `${completion}%` }} />
          </div>
        </div>
        <div style={styles.statusCard}>
          <div style={styles.statusValue}>{completeCount}</div>
          <div style={styles.statusLabel}>Features Complete</div>
        </div>
        <div style={styles.statusCard}>
          <div style={styles.statusValue}>{pendingCount}</div>
          <div style={styles.statusLabel}>Features Pending</div>
        </div>
      </div>

      <div style={styles.featuresContainer}>
        {categories.map((category) => {
          const categoryFeatures = features.filter(f => f.category === category);
          const categoryComplete = categoryFeatures.filter(f => f.status === 'complete').length;
          const categoryTotal = categoryFeatures.length;
          const categoryPercent = Math.round((categoryComplete / categoryTotal) * 100);

          return (
            <div key={category} style={styles.categoryCard}>
              <div style={styles.categoryHeader}>
                <h3 style={styles.categoryTitle}>{category}</h3>
                <div style={styles.categoryStats}>
                  {categoryComplete}/{categoryTotal} ({categoryPercent}%)
                </div>
              </div>
              <div style={styles.progressBarContainer}>
                <div style={{ ...styles.progressBar, width: `${categoryPercent}%` }} />
              </div>
              <div style={styles.featureItems}>
                {categoryFeatures.map((feature, idx) => (
                  <div key={idx} style={styles.featureItem}>
                    {feature.status === 'complete' ? (
                      <CheckCircleOutlined style={styles.statusIconComplete} />
                    ) : feature.status === 'pending' ? (
                      <ClockCircleOutlined style={styles.statusIconPending} />
                    ) : (
                      <MinusOutlined style={styles.statusIconIncomplete} />
                    )}
                    <span style={feature.status === 'complete' ? styles.featureTextComplete : styles.featureText}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===========================================
// STYLES
// ===========================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#E6F2FF',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#2C3E50',
    color: '#FFFFFF',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#BDC3C7',
    fontWeight: 400,
  },
  completionBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  completionCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3498DB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #FFFFFF',
  },
  completionText: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  completionLabel: {
    fontSize: '12px',
    color: '#BDC3C7',
    fontWeight: 500,
  },
  tabsContainer: {
    display: 'flex',
    backgroundColor: '#FFFFFF',
    borderBottom: '2px solid #E0E0E0',
    padding: '0 20px',
    gap: '4px',
    overflowX: 'auto',
  },
  tab: {
    padding: '16px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#2C3E50',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#3498DB',
    borderBottomColor: '#3498DB',
    backgroundColor: '#F0F8FF',
  },
  tabIcon: {
    fontSize: '16px',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '20px 30px',
    maxHeight: 'calc(100vh - 140px)',
  },
  tabContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E0E0E0',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#2C3E50',
    margin: '0 0 16px 0',
    borderBottom: '2px solid #3498DB',
    paddingBottom: '8px',
  },
  cardText: {
    fontSize: '14px',
    color: '#34495E',
    lineHeight: 1.6,
    margin: 0,
  },
  highlightBox: {
    backgroundColor: '#F0F8FF',
    borderLeft: '4px solid #3498DB',
    padding: '16px',
    marginTop: '16px',
    fontSize: '14px',
    color: '#2C3E50',
    lineHeight: 1.6,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  metric: {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#F8F9FA',
    borderRadius: '8px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#3498DB',
    marginBottom: '4px',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#7F8C8D',
    fontWeight: 500,
  },
  businessModel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  businessItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  checkIcon: {
    color: '#27AE60',
    fontSize: '18px',
    marginTop: '2px',
  },
  subtext: {
    fontSize: '12px',
    color: '#7F8C8D',
    marginTop: '4px',
  },
  techStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  techItem: {
    padding: '12px',
    backgroundColor: '#F8F9FA',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#2C3E50',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E0E0E0',
    textAlign: 'center',
  },
  userIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#E6F2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  userTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2C3E50',
    margin: '0 0 16px 0',
  },
  userList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left',
  },
  userListItem: {
    padding: '8px 0',
    fontSize: '14px',
    color: '#34495E',
    borderBottom: '1px solid #F0F0F0',
  },
  journeyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E0E0E0',
  },
  journeyTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#2C3E50',
    margin: '0 0 20px 0',
  },
  flowDiagram: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  flowStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  flowNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3498DB',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 600,
  },
  flowText: {
    fontSize: '12px',
    color: '#2C3E50',
    textAlign: 'center',
    maxWidth: '100px',
    fontWeight: 500,
  },
  flowArrow: {
    color: '#3498DB',
    fontSize: '20px',
  },
  processFlow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  processStep: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: '150px',
  },
  processIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3498DB',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  processArrow: {
    color: '#3498DB',
    fontSize: '18px',
    flexShrink: 0,
  },
  codeBlock: {
    backgroundColor: '#2C3E50',
    borderRadius: '8px',
    padding: '20px',
    overflow: 'auto',
  },
  codeText: {
    color: '#ECF0F1',
    fontSize: '12px',
    fontFamily: "'Fira Code', monospace",
    margin: 0,
    lineHeight: 1.6,
  },
  techComponents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  techComponent: {
    padding: '12px',
    backgroundColor: '#F8F9FA',
    borderRadius: '6px',
    fontSize: '14px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E0E0E0',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2C3E50',
    margin: '0 0 16px 0',
    borderBottom: '2px solid #3498DB',
    paddingBottom: '8px',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureListItem: {
    padding: '8px 0',
    fontSize: '14px',
    color: '#34495E',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  moneyFlow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  moneyStep: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#F8F9FA',
    borderRadius: '8px',
    minWidth: '120px',
  },
  moneyAmount: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#3498DB',
    marginBottom: '8px',
  },
  moneyLabel: {
    fontSize: '12px',
    color: '#7F8C8D',
    fontWeight: 500,
  },
  moneyArrow: {
    color: '#3498DB',
    fontSize: '24px',
  },
  moneyDetail: {
    padding: '16px',
    backgroundColor: '#F0F8FF',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#2C3E50',
  },
  payoutFlow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  payoutStep: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: '140px',
  },
  payoutNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3498DB',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  payoutArrow: {
    color: '#3498DB',
    fontSize: '18px',
    flexShrink: 0,
  },
  earningsBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  earningsItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  techList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  techListItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '12px',
    backgroundColor: '#F8F9FA',
    borderRadius: '6px',
  },
  techIcon: {
    color: '#3498DB',
    fontSize: '20px',
    marginTop: '2px',
  },
  schemaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  schemaItem: {
    padding: '12px',
    backgroundColor: '#F8F9FA',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#2C3E50',
  },
  statusHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '32px',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E0E0E0',
    textAlign: 'center',
  },
  statusValue: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#3498DB',
    marginBottom: '8px',
  },
  statusLabel: {
    fontSize: '14px',
    color: '#7F8C8D',
    fontWeight: 500,
    marginBottom: '16px',
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#E0E0E0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498DB',
    transition: 'width 0.3s ease',
  },
  featuresContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E0E0E0',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  categoryTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2C3E50',
    margin: 0,
  },
  categoryStats: {
    fontSize: '14px',
    color: '#3498DB',
    fontWeight: 600,
  },
  featureItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
  },
  statusIconComplete: {
    color: '#27AE60',
    fontSize: '16px',
  },
  statusIconPending: {
    color: '#F39C12',
    fontSize: '16px',
  },
  statusIconIncomplete: {
    color: '#E74C3C',
    fontSize: '16px',
  },
  featureText: {
    fontSize: '14px',
    color: '#34495E',
  },
  featureTextComplete: {
    fontSize: '14px',
    color: '#2C3E50',
    fontWeight: 500,
  },
};

export default MVP1Presentation;

