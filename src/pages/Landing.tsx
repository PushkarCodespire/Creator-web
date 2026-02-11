// ===========================================
// LANDING PAGE - Enhanced with Animations
// ===========================================

import { useNavigate } from 'react-router-dom';
import { Collapse, Avatar } from 'antd';
import {
  MessageSquare,
  Rocket,
  CircleDollarSign,
  Users,
  CheckCircle2,
  Star,
  ArrowRight,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import CustomButton from '../components/common/Button/CustomButton';
import CustomCard from '../components/common/Card/CustomCard';
import { FeaturedCreators } from '../components/Discovery';
import { colors, typography, spacing } from '../styles/tokens';
import { pageVariants, fadeIn, slideUp, scaleIn, staggerContainer } from '../styles/animations';

// Animated Counter Component
const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = '',
  compact = false,
}: {
  end: number;
  duration?: number;
  suffix?: string;
  compact?: boolean;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const isDecimal = end % 1 !== 0;

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentCount = progress * end;
        setCount(currentCount);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <div
      ref={ref}
      style={{
        fontSize: compact
          ? 'clamp(1.5rem, 4vw, 2rem)'
          : 'clamp(1.75rem, 5vw, 2.5rem)',
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.solid,
        lineHeight: 1.1,
        wordBreak: 'break-word',
      }}
    >
      {isDecimal
        ? count.toFixed(1)
        : Math.floor(count).toLocaleString()}
      {suffix}
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle hash navigation on page load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, []);

  const features = [
    {
      icon: <MessageSquare size={32} color={colors.primary.solid} />,
      title: 'AI-Powered Conversations',
      desc: 'Your AI twin, trained on your content, answers questions in your voice 24/7.',
    },
    {
      icon: <CircleDollarSign size={32} color={colors.success.solid} />,
      title: 'Monetize Your Expertise',
      desc: 'Earn from every conversation while you sleep with flexible pricing controls.',
    },
    {
      icon: <Rocket size={32} color={colors.primary.light} />,
      title: 'Scale Without Burnout',
      desc: 'Serve thousands of fans simultaneously without adding to your workload.',
    },
    {
      icon: <Users size={32} color={colors.warning.solid} />,
      title: 'Deep Community Insights',
      desc: 'See what your audience asks most and create content that actually resonates.',
    },
    {
      icon: <CheckCircle2 size={32} color={colors.primary.solid} />,
      title: 'Personalized AI',
      desc: 'Configure tone, depth, and boundaries so the AI always feels authentically you.',
    },
    {
      icon: <ShieldCheck size={32} color={colors.success.solid} />,
      title: 'Secure & Private',
      desc: 'Enterprise-grade encryption and strict privacy controls to keep your data safe.',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Fitness Creator',
      avatar: 'https://i.pravatar.cc/150?img=1',
      quote:
        'This platform changed my business. I now earn passive income while helping thousands of people with fitness advice.',
      rating: 5,
      earned: '₹5.2L earned',
    },
    {
      name: 'Rahul Mehta',
      role: 'Tech Educator',
      avatar: 'https://i.pravatar.cc/150?img=12',
      quote:
        'My AI twin answers coding questions 24/7. I can focus on new content while my fans get instant, accurate help.',
      rating: 5,
      earned: '₹3.8L earned',
    },
    {
      name: 'Anjali Verma',
      role: 'Business Coach',
      avatar: 'https://i.pravatar.cc/150?img=5',
      quote:
        'The AI handles inbound questions and lead qualification. I serve 10x more clients without hiring a team.',
      rating: 5,
      earned: '₹4.1L earned',
    },
  ];

  const creatorSteps = [
    {
      title: 'Upload your content',
      description: 'Connect YouTube, podcasts, blogs, FAQs and more in a few clicks.',
    },
    {
      title: 'AI trains on your expertise',
      description: 'Our engine learns your tone, style, and knowledge in a secure sandbox.',
    },
    {
      title: 'Go live & start earning',
      description: 'Set your pricing, share your link, and watch conversations (and revenue) grow.',
    },
  ];

  const userSteps = [
    {
      title: 'Find your creator',
      description: 'Browse verified creators by category, rating, and price.',
    },
    {
      title: 'Ask anything',
      description: 'Chat with their AI twin and get instant, contextual answers.',
    },
    {
      title: 'Get 24/7 support',
      description: 'Come back anytime—your chat history and insights are always there.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '₹0',
      period: '/month',
      highlight: 'Get started in minutes',
      features: ['5 messages/day', 'Access to selected creators', 'Basic chat experience'],
      cta: 'Start Free',
      variant: 'ghost',
    },
    {
      name: 'Premium',
      price: '₹799',
      period: '/month',
      highlight: 'Best for power users',
      features: ['Unlimited messages', 'Priority AI performance', 'Full analytics dashboard'],
      cta: 'Upgrade',
      variant: 'secondary',
      recommended: true,
    },
    {
      name: 'Creator',
      price: 'Custom',
      period: '',
      highlight: 'Monetize your audience',
      features: ['Upload your content', 'Set your own pricing', 'Earn from every conversation'],
      cta: 'Apply as Creator',
      variant: 'secondary',
    },
  ];

  const faqs = [
    {
      key: '1',
      label: 'How does the AI learn from creators?',
      children: 'Creators upload their YouTube videos, blog posts, FAQs, and other content. Our AI processes this to understand their style, expertise, and personality, creating a personalized AI clone.',
    },
    {
      key: '2',
      label: 'How accurate are the AI responses?',
      children: 'Our AI is powered by GPT-4, trained specifically on each creator\'s content. Responses maintain the creator\'s voice and expertise with 95%+ accuracy according to creator reviews.',
    },
    {
      key: '3',
      label: 'What can I ask the AI?',
      children: 'Anything related to the creator\'s expertise! Ask for advice, learn new skills, get personalized recommendations, or have casual conversations. The AI knows everything from the creator\'s content.',
    },
    {
      key: '4',
      label: 'How much does it cost?',
      children: 'Free users get 5 messages per day. Premium subscribers (₹799/month) get unlimited messages with all creators. Creators earn 80% of subscription revenue.',
    },
    {
      key: '5',
      label: 'Can I become a creator?',
      children: 'Yes! Apply through the registration page. We verify creators based on their content quality and audience size. Once approved, upload your content and start earning.',
    },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at top left, rgba(102,126,234,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(118,75,162,0.35), transparent 55%), #0B1120',
          color: '#E5E7EB',
          padding: isMobile ? '72px 0 64px' : '120px 0 96px',
        }}
      >
        {/* Animated gradient orbs */}
        <motion.div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(165,180,252,0.5), transparent 60%)',
            top: -160,
            right: -120,
            opacity: 0.8,
          }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 30, -10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent 60%)',
            bottom: -140,
            left: -80,
            opacity: 0.7,
          }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, -20, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: isMobile ? spacing[8] : spacing[12],
            }}
          >
            {/* Left: Headline & CTAs */}
            <motion.div
              variants={fadeIn}
              style={{
                flex: 1.1,
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              <motion.p
                variants={slideUp}
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  textTransform: 'uppercase',
                  color: 'rgba(209, 213, 219, 0.9)',
                  marginBottom: spacing[2],
                  letterSpacing: '0.05em',
                }}
              >
                AI Creator Platform · Built for modern creators
              </motion.p>

              <motion.h1
                variants={slideUp}
                style={{
                  fontSize: isMobile ? typography.fontSize['3xl'] : typography.fontSize['4xl'],
                  lineHeight: 1.1,
                  fontWeight: 800,
                  marginBottom: spacing[4],
                  color: '#ffffff',
                }}
              >
                Turn Your Expertise Into
                <br />
                <span
                  style={{
                    color: colors.primary.solid,
                  }}
                >
                  24/7 AI Conversations
                </span>
              </motion.h1>

              <motion.p
                variants={slideUp}
                style={{
                  fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
                  color: 'rgba(209, 213, 219, 0.9)',
                  maxWidth: 520,
                  marginBottom: spacing[6],
                  marginInline: isMobile ? 'auto' : '0',
                }}
              >
                Create your AI twin, trained on your content. Your audience gets instant advice. You earn while you sleep.
              </motion.p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: spacing[3],
                  alignItems: 'center',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  marginBottom: spacing[5],
                }}
              >
                <CustomButton
                  size="large"
                  variant="primary"
                  onClick={() => navigate('/register')}
                  style={{
                    minWidth: 200,
                    borderRadius: '8px',
                    height: '48px',
                    boxShadow: '0 8px 16px rgba(18, 104, 255, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    Start as Creator <ArrowRight size={18} />
                  </div>
                </CustomButton>

                <CustomButton
                  size="large"
                  variant="ghost"
                  onClick={() => navigate('/creators')}
                  style={{
                    minWidth: 200,
                    borderRadius: '8px',
                    height: '48px',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF'
                  }}
                >
                  Explore Creators
                </CustomButton>
              </motion.div>

              {/* Trust indicators */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[6],
                  alignItems: 'center',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  color: '#ffffff'
                }}
              >
                <div>
                  <div style={{ fontSize: typography.fontSize.lg, fontWeight: 700 }}>
                    1,000+ creators
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: '#9CA3AF' }}>trust CodeSpire</div>
                </div>
                <div>
                  <div style={{ fontSize: typography.fontSize.lg, fontWeight: 700 }}>
                    10M+ conversations
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: '#9CA3AF' }}>powered for fans worldwide</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Star size={16} fill={colors.warning.solid} color={colors.warning.solid} />
                  <span style={{ fontWeight: 700 }}>4.9/5</span>
                  <span style={{ fontSize: typography.fontSize.sm, color: '#9CA3AF' }}>average rating</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Interactive demo card */}
            <motion.div
              variants={slideUp}
              style={{
                flex: 1,
                width: '100%',
                maxWidth: 420,
                marginInline: isMobile ? 'auto' : undefined,
              }}
            >
              <CustomCard
                depth={2}
                style={{
                  background: 'rgba(15,23,42,0.95)',
                  borderRadius: 24,
                  padding: spacing[5],
                  border: '1px solid rgba(148,163,184,0.4)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing[4],
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: '#9CA3AF',
                        marginBottom: spacing[1],
                      }}
                    >
                      Live demo · No signup required
                    </div>
                    <div style={{ fontWeight: 600, color: '#E5E7EB' }}>AI Chat Preview</div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 10,
                      color: '#9CA3AF',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: colors.success.solid,
                      }}
                    />
                    <span>Online</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing[2],
                    marginBottom: spacing[4],
                    maxHeight: 260,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: 16,
                      borderBottomRightRadius: 4,
                      backgroundColor: colors.primary.solid,
                      color: '#ffffff',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    How can I turn my YouTube channel into a 24/7 AI assistant?
                  </div>

                  <div
                    style={{
                      alignSelf: 'flex-start',
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: 16,
                      borderBottomLeftRadius: 4,
                      backgroundColor: '#1E293B',
                      color: '#E2E8F0',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    Great question! I&apos;ll turn your most-watched videos, FAQs, and course content into an AI that
                    answers in your voice—so fans get instant replies, even while you sleep.
                  </div>

                  <div
                    style={{
                      alignSelf: 'flex-start',
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: 16,
                      borderBottomLeftRadius: 4,
                      backgroundColor: '#1E293B',
                      color: '#E2E8F0',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    You&apos;ll also see which questions drive the most revenue, so you can plan your next video or
                    product.
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: spacing[1],
                      color: '#9CA3AF',
                      fontSize: 11,
                    }}
                  >
                    <span>AI is typing a follow-up...</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    color: '#9CA3AF',
                  }}
                >
                  <span>Try asking: &quot;How much can I earn each month?&quot;</span>
                  <Play size={14} color={colors.primary.light} />
                </div>
              </CustomCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats Section (Social proof) */}
      <section
        style={{
          background: '#FFFFFF',
          borderBottom: `1px solid ${colors.gray[200]}`,
          padding: isMobile ? '40px 0' : '56px 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: spacing[8],
              textAlign: isMobile ? 'left' : 'center',
            }}
          >
            <motion.div variants={fadeIn}>
              <AnimatedCounter end={10000} suffix="+" />
              <div style={{ color: colors.gray[600], marginTop: spacing[2] }}>Active users</div>
            </motion.div>
            <motion.div variants={fadeIn}>
              <AnimatedCounter end={1000} suffix="+" />
              <div style={{ color: colors.gray[600], marginTop: spacing[2] }}>Creators onboarded</div>
            </motion.div>
            <motion.div variants={fadeIn}>
              <AnimatedCounter end={10000000} suffix="+" />
              <div style={{ color: colors.gray[600], marginTop: spacing[2] }}>Conversations powered</div>
            </motion.div>
            <motion.div variants={fadeIn}>
              <AnimatedCounter end={4.9} suffix="/5" />
              <div style={{ color: colors.gray[600], marginTop: spacing[2] }}>Average rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: isMobile ? '72px 0' : '96px 0',
          scrollMarginTop: '80px',
        }}
      >
        <div className="container">
          <motion.div
            variants={fadeIn}
            style={{
              textAlign: 'center',
              marginBottom: spacing[10],
              color: colors.text.primary,
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing[3],
                color: colors.text.primary,
              }}
            >
              Everything you need to launch your AI twin
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.gray[600],
                maxWidth: 640,
                margin: '0 auto',
              }}
            >
              From AI-powered conversations to deep analytics—built to help creators earn more with less effort.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: spacing[6],
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(15,23,42,0.12)' }}
                transition={{ duration: 0.2 }}
              >
                <CustomCard
                  depth={1}
                  style={{
                    height: '100%',
                    padding: spacing[6],
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background: colors.primary.subtle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: spacing[2],
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.xl,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: colors.gray[600], lineHeight: 1.6 }}>{feature.desc}</p>
                </CustomCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        style={{
          background: colors.gray[50],
          padding: isMobile ? '72px 0' : '96px 0',
          scrollMarginTop: '80px',
        }}
      >
        <div className="container">
          <motion.div
            variants={fadeIn}
            style={{
              textAlign: 'center',
              marginBottom: spacing[8],
              color: colors.text.primary,
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing[3],
                color: colors.text.primary,
              }}
            >
              How it works
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.gray[600],
                maxWidth: 640,
                margin: '0 auto',
              }}
            >
              Simple flows for creators and fans, powered by our AI engine under the hood.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: spacing[8],
            }}
          >
            {/* Creator steps */}
            <motion.div variants={slideUp}>
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: 700,
                  marginBottom: spacing[4],
                  color: colors.text.primary,
                }}
              >
                For creators
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing[4],
                  position: 'relative',
                }}
              >
                {creatorSteps.map((step, index) => (
                  <div
                    key={step.title}
                    style={{
                      display: 'flex',
                      gap: spacing[3],
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: 9999,
                        background: colors.primary.solid,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 4,
                          color: colors.text.primary,
                        }}
                      >
                        {step.title}
                      </div>
                      <div style={{ color: colors.gray[600], fontSize: typography.fontSize.sm }}>
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* User steps */}
            <motion.div variants={slideUp}>
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: 700,
                  marginBottom: spacing[4],
                  color: colors.text.primary,
                }}
              >
                For users
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing[4],
                }}
              >
                {userSteps.map((step, index) => (
                  <div
                    key={step.title}
                    style={{
                      display: 'flex',
                      gap: spacing[3],
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: 9999,
                        border: `1px dashed ${colors.primary.solid}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary.solid,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 4,
                          color: colors.text.primary,
                        }}
                      >
                        {step.title}
                      </div>
                      <div style={{ color: colors.gray[600], fontSize: typography.fontSize.sm }}>
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section
        style={{
          padding: isMobile ? '72px 0' : '96px 0',
          background: '#FFFFFF',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'flex-end',
              marginBottom: spacing[8],
              gap: spacing[4],
            }}
          >
            <motion.div
              variants={fadeIn}
              style={{
                textAlign: 'left',
                color: colors.text.primary,
              }}
            >
              <h2
                style={{
                  fontSize: typography.fontSize['3xl'],
                  fontWeight: 800,
                  marginBottom: spacing[2],
                  color: colors.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  letterSpacing: '-0.02em',
                }}
              >
                <Sparkles size={24} color={colors.primary.solid} /> Featured Creators
              </h2>
              <p
                style={{
                  fontSize: typography.fontSize.lg,
                  color: colors.gray[600],
                }}
              >
                Top creators loved by our community
              </p>
            </motion.div>

            <CustomButton
              variant="ghost"
              onClick={() => navigate('/creators')}
              style={{
                color: colors.primary.solid,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              View All <ArrowRight size={16} />
            </CustomButton>
          </div>

          <FeaturedCreators limit={8} />

        </div>
      </section>

      {/* Testimonials */}
      <section
        style={{
          background: colors.gray[50],
          padding: isMobile ? '72px 0' : '96px 0',
        }}
      >
        <div className="container">
          <motion.div
            variants={fadeIn}
            style={{
              textAlign: 'center',
              marginBottom: spacing[8],
              color: colors.text.primary,
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: 800,
                marginBottom: spacing[3],
                letterSpacing: '-0.02em',
              }}
            >
              Loved by creators and fans
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: spacing[6],
            }}
          >
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.name} variants={slideUp}>
                <CustomCard
                  depth={1}
                  style={{
                    height: '100%',
                    padding: spacing[6],
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#020617',
                    color: '#E5E7EB',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: spacing[1], marginBottom: spacing[3] }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill={colors.warning.solid} color={colors.warning.solid} />
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: typography.fontSize.base,
                        lineHeight: 1.6,
                        marginBottom: spacing[4],
                        color: '#E5E7EB',
                      }}
                    >
                      “{testimonial.quote}”
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: spacing[3],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                      <Avatar
                        src={testimonial.avatar || undefined}
                        size={48}
                        style={{
                          border: `2px solid ${colors.primary.solid}`,
                          backgroundColor: colors.primary.solid,
                        }}
                      >
                        {testimonial.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#F9FAFB',
                          }}
                        >
                          {testimonial.name}
                        </div>
                        <div
                          style={{
                            color: '#9CA3AF',
                            fontSize: typography.fontSize.sm,
                          }}
                        >
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.success.light,
                        fontWeight: 600,
                      }}
                    >
                      {testimonial.earned}
                    </div>
                  </div>
                </CustomCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section
        id="pricing"
        style={{
          padding: isMobile ? '72px 0' : '96px 0',
          scrollMarginTop: '80px',
        }}
      >
        <div className="container">
          <motion.div
            variants={fadeIn}
            style={{
              textAlign: 'center',
              marginBottom: spacing[8],
              color: colors.text.primary,
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: 800,
                marginBottom: spacing[3],
                color: colors.text.primary,
                letterSpacing: '-0.02em',
              }}
            >
              Simple, transparent pricing
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.gray[600],
                maxWidth: 560,
                margin: '0 auto',
              }}
            >
              No hidden fees. Start free, upgrade when you&apos;re ready, or apply as a creator to start earning.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: spacing[6],
              alignItems: 'stretch',
            }}
          >
            {pricingPlans.map((plan) => (
              <motion.div key={plan.name} variants={scaleIn}>
                <CustomCard
                  depth={plan.recommended ? 2 : 1}
                  style={{
                    height: '100%',
                    padding: spacing[6],
                    borderRadius: 20,
                    border: plan.recommended ? `2px solid ${colors.primary.solid}` : '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    background: plan.recommended ? '#020617' : '#ffffff',
                    color: plan.recommended ? '#E5E7EB' : colors.text.primary,
                  }}
                >
                  {plan.recommended && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 9999,
                        background: colors.primary.solid,
                        color: '#ffffff',
                        textTransform: 'uppercase',
                      }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div style={{ marginBottom: spacing[4] }}>
                    <div
                      style={{
                        fontSize: typography.fontSize.sm,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: plan.recommended ? '#9CA3AF' : colors.gray[500],
                        marginBottom: spacing[1],
                        letterSpacing: '0.05em',
                      }}
                    >
                      {plan.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 4,
                        marginBottom: spacing[1],
                      }}
                    >
                      <span
                        style={{
                          fontSize: typography.fontSize['3xl'],
                          fontWeight: 800,
                          color: plan.recommended ? '#F9FAFB' : colors.text.primary,
                        }}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: plan.recommended ? '#9CA3AF' : colors.gray[500],
                          }}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: plan.recommended ? '#E5E7EB' : colors.gray[600],
                      }}
                    >
                      {plan.highlight}
                    </div>
                  </div>

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: `0 0 ${spacing[5]}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing[2],
                    }}
                  >
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: typography.fontSize.sm,
                          color: plan.recommended ? '#E5E7EB' : colors.gray[600],
                        }}
                      >
                        <CheckCircle2 size={16} color={colors.success.solid} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <CustomButton
                    size="large"
                    variant={plan.recommended ? 'primary' : 'secondary'}
                    onClick={() =>
                      plan.name === 'Creator'
                        ? navigate('/register')
                        : plan.name === 'Premium'
                          ? navigate('/pricing')
                          : navigate('/login')
                    }
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      height: '48px',
                    }}
                  >
                    {plan.cta}
                  </CustomButton>
                </CustomCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        style={{
          padding: isMobile ? '72px 0' : '96px 0',
          scrollMarginTop: '80px',
        }}
      >
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div
            variants={fadeIn}
            style={{
              textAlign: 'center',
              marginBottom: spacing[8],
              color: colors.text.primary,
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: 800,
                marginBottom: spacing[4],
                color: colors.text.primary,
                letterSpacing: '-0.02em',
              }}
            >
              Frequently Asked Questions
            </h2>
          </motion.div>

          <Collapse
            accordion
            bordered={false}
            style={{ background: 'transparent' }}
            expandIcon={({ isActive }) => (
              <span style={{ color: colors.primary.solid }}>
                <Zap size={16} fill={isActive ? colors.primary.solid : 'transparent'} />
              </span>
            )}
            items={faqs.map((faq) => ({
              key: faq.key,
              label: (
                <span
                  style={{
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  {faq.label}
                </span>
              ),
              children: (
                <p
                  style={{
                    color: colors.gray[600],
                    lineHeight: 1.6,
                    fontSize: '15px',
                  }}
                >
                  {faq.children}
                </p>
              ),
            }))}
          />
        </div>
      </section>

      {/* Final CTA */}
      <div style={{ background: colors.primary.solid, padding: isMobile ? '80px 24px' : '100px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,0,0,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <motion.div variants={fadeIn} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: typography.fontSize['4xl'], fontWeight: 800, marginBottom: spacing[4], color: '#ffffff', letterSpacing: '-0.02em' }}>
            Ready to Transform Your Creator Journey?
          </h2>
          <p style={{ fontSize: typography.fontSize.lg, marginBottom: spacing[8], color: 'rgba(255,255,255,0.9)', maxWidth: '640px', margin: `0 auto ${spacing[8]}`, lineHeight: 1.6 }}>
            Join thousands of creators who are already scaling their expertise with CodeSpire. Get started today.
          </p>
          <div style={{ display: 'flex', gap: spacing[4], justifyContent: 'center', flexWrap: 'wrap' }}>
            <CustomButton
              size="large"
              variant="secondary"
              onClick={() => navigate('/register')}
              style={{ background: '#ffffff', color: colors.primary.solid, height: '56px', padding: '0 32px', fontSize: '16px' }}
            >
              Start Free Today
            </CustomButton>
            <CustomButton
              size="large"
              variant="ghost"
              onClick={() => navigate('/creators')}
              style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', height: '56px', padding: '0 32px', fontSize: '16px' }}
            >
              Explore Creators
            </CustomButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Landing;
