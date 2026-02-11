// ===========================================
// CREATOR SETTINGS PAGE - Premium Light Theme
// ===========================================

import { useEffect, useState, useRef } from 'react';
import { Card, Form, Input, Button, Select, message, Spin, Divider, Space, Tag, List, Typography, Alert, Grid, InputNumber, Switch } from 'antd';
import {
  User,
  Image as ImageIcon,
  Share2,
  Cpu,
  Landmark,
  Database,
  CheckCircle2,
  RefreshCw,
  XCircle,
  IndianRupee,
  Globe,
  Youtube,
  Instagram,
  Twitter,
  Zap,
  Camera,
  Info,
  ChevronRight,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck
} from 'lucide-react';
import { ImageUpload } from '../../components/upload/ImageUpload';
import { CoverImageUpload } from '../../components/upload/CoverImageUpload';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { creatorApi, getImageUrl } from '../../services/api';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CreatorSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const initialValuesRef = useRef<any>({});

  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await creatorApi.getDashboard();
      const data = response.data.data;
      setProfileData(data);

      const formValues = {
        ...data,
        bankName: data.bankAccount?.bankName,
        accountHolderName: data.bankAccount?.accountHolderName,
        accountNumber: data.bankAccount?.accountNumber,
        ifscCode: data.bankAccount?.ifscCode,
      };

      setLoading(false);

      // Delay form synchronization to ensure component is mounted to resolve useForm warning
      setTimeout(() => {
        form.setFieldsValue(formValues);
        initialValuesRef.current = form.getFieldsValue(true);
        setIsDirty(false);
      }, 0);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (blob: Blob, fileName: string): Promise<{ url: string }> => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('avatar', blob, fileName);

      const response = await creatorApi.updateProfile(formData);
      const url = response.data.data.profileImage;

      dispatch(updateUser({ avatar: url }));
      setProfileData((prev: any) => ({ ...prev, profileImage: url }));
      message.success('Neural avatar updated!');
      await fetchProfile();
      return { url };
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update avatar');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (url: string) => {
    try {
      await creatorApi.updateProfile({ coverImage: url });
      setProfileData((prev: any) => ({ ...prev, coverImage: url }));
      message.success('Cover matrix updated!');
      await fetchProfile();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update cover image');
    }
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const submissionData = {
        ...values,
        ...(values.bankName && {
          bankAccount: {
            bankName: values.bankName,
            accountHolderName: values.accountHolderName,
            accountNumber: values.accountNumber,
            ifscCode: values.ifscCode,
          }
        }),
        isProfileComplete: true
      };

      await creatorApi.updateProfile(submissionData);
      message.success('Neural configuration synchronized!');
      await fetchProfile();
    } catch (err) {
      message.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const glassStyle: React.CSSProperties = {
    background: '#ffffff',
    border: `1px solid ${colors.gray[100]}`,
    borderRadius: '24px',
    boxShadow: shadows.md,
    overflow: 'hidden'
  };

  const inputStyle: React.CSSProperties = {
    background: colors.gray[50],
    border: `1px solid ${colors.gray[200]}`,
    color: colors.text.primary,
    borderRadius: '12px',
    padding: '12px 16px',
    height: '48px',
    fontWeight: 600
  };

  const cardTitleStyle = {
    color: colors.text.primary,
    fontSize: '18px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    letterSpacing: '-0.01em'
  };

  const labelStyle = {
    color: colors.text.secondary,
    fontWeight: 700,
    fontSize: '13px',
    marginBottom: '8px',
    display: 'block',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };

  const handleValuesChange = () => {
    const currentValues = form.getFieldsValue(true);
    const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(initialValuesRef.current);
    setIsDirty(hasChanges);
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background }}>
        <Spin size="large" tip={<span style={{ fontWeight: 600, marginTop: '20px', display: 'block' }}>Calibrating settings matrix...</span>} />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? spacing[3] : spacing[8], background: colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: spacing[10] }}
        >
          <Title level={isMobile ? 3 : 1} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Control <span style={{ color: colors.primary.solid }}>Center</span>
          </Title>
          <Text style={{ color: colors.text.secondary, fontSize: isMobile ? '14px' : '16px', fontWeight: 500, marginTop: '12px', display: 'block' }}>
            Refine your digital twin and identity protocols
          </Text>
        </motion.div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          requiredMark={false}
          onValuesChange={handleValuesChange}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
            gap: isMobile ? spacing[6] : spacing[8],
          }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
              {/* Visual Assets */}
              <Card
                title={<span style={cardTitleStyle}>Visual Identity</span>}
                bordered={false}
                style={glassStyle}
                styles={{ body: { padding: isMobile ? '20px' : '40px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 40px' } }}
              >
                <div style={{ position: 'relative', marginBottom: isMobile ? '100px' : '120px' }}>
                  <CoverImageUpload
                    currentCover={profileData?.coverImage}
                    onUploadSuccess={handleCoverUpload}
                    height={isMobile ? 140 : 200}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: isMobile ? '-80px' : '-60px',
                    left: isMobile ? '50%' : '40px',
                    transform: isMobile ? 'translateX(-50%)' : 'none',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: isMobile ? '16px' : '24px',
                    textAlign: isMobile ? 'center' : 'left',
                    width: isMobile ? '100%' : 'auto'
                  }}>
                    <div style={{
                      border: '6px solid #ffffff',
                      borderRadius: '50%',
                      padding: '2px',
                      background: '#ffffff',
                      boxShadow: shadows.lg,
                      overflow: 'hidden'
                    }}>
                      <ImageUpload
                        onUpload={handleAvatarUpload}
                        cropShape="round"
                        aspectRatio={1}
                      >
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                          <img
                            src={getImageUrl(profileData?.profileImage || user?.avatar)}
                            style={{
                              width: isMobile ? 100 : 130,
                              height: isMobile ? 100 : 130,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              background: colors.gray[100]
                            }}
                            alt="Avatar"
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 6,
                            right: 6,
                            background: colors.primary.gradient,
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #ffffff',
                            boxShadow: shadows.md
                          }}>
                            <Camera size={16} color="#fff" />
                          </div>
                        </div>
                      </ImageUpload>
                    </div>
                    <div style={{ marginBottom: isMobile ? '8px' : '20px' }}>
                      <Title level={isMobile ? 4 : 2} style={{ color: colors.text.primary, margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>{profileData?.displayName}</Title>
                      <Tag bordered={false} style={{
                        marginTop: '10px',
                        background: colors.primary.subtle,
                        color: colors.primary.solid,
                        fontWeight: 800,
                        borderRadius: '8px',
                        padding: '4px 12px',
                        fontSize: '12px'
                      }}>
                        {profileData?.category || 'Uncategorized Content'}
                      </Tag>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? 0 : spacing[6],
                  marginTop: isMobile ? '110px' : '60px'
                }}>
                  <Form.Item name="displayName" label={<span style={labelStyle}>Public Pseudonym</span>} rules={[{ required: true }]}>
                    <Input prefix={<User size={18} style={{ color: colors.primary.solid, marginRight: '8px' }} />} style={inputStyle} />
                  </Form.Item>
                  <Form.Item name="category" label={<span style={labelStyle}>Neural Domain</span>}>
                    <Select placeholder="Select niche" style={{ height: '48px' }} dropdownStyle={{ borderRadius: '12px' }}>
                      <Select.Option value="Fitness">Fitness & Performance</Select.Option>
                      <Select.Option value="Business">Business Engineering</Select.Option>
                      <Select.Option value="Technology">Deep Tech</Select.Option>
                      <Select.Option value="Lifestyle">Luxe Lifestyle</Select.Option>
                      <Select.Option value="Education">Applied Knowledge</Select.Option>
                      <Select.Option value="Entertainment">Pure Content</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item name="tagline" label={<span style={labelStyle}>Brand frequency</span>}>
                  <Input placeholder="Your strategic mission statement" prefix={<Sparkles size={18} style={{ color: colors.warning.solid, marginRight: '8px' }} />} style={inputStyle} />
                </Form.Item>

                <Form.Item name="tags" label={<span style={labelStyle}>Identity matrix tags</span>}>
                  <Select mode="tags" placeholder="Add identifiers for neural discovery" style={{ minHeight: '48px' }} tokenSeparators={[',']}>
                    <Select.Option value="AI">AI</Select.Option>
                    <Select.Option value="Growth">Growth</Select.Option>
                    <Select.Option value="Future">Future</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="bio" label={<span style={labelStyle}>Persona Narrative</span>}>
                  <TextArea rows={5} placeholder="Full identity context..." style={{ ...inputStyle, height: 'auto', paddingTop: '16px' }} />
                </Form.Item>
              </Card>

              {/* AI Personality */}
              <Card
                title={<span style={cardTitleStyle}>Neural Personality Configuration</span>}
                bordered={false}
                style={glassStyle}
                styles={{ body: { padding: isMobile ? '20px' : '40px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 40px' } }}
              >
                <Form.Item name="aiTone" label={<span style={labelStyle}>Communication Frequency</span>} rules={[{ required: true }]}>
                  <Select size="large" style={{ height: '48px' }} placeholder="Select AI behavior">
                    <Select.Option value="friendly">Empathetic & Warm</Select.Option>
                    <Select.Option value="professional">Surgical & Precise</Select.Option>
                    <Select.Option value="casual">Organic & Genuine</Select.Option>
                    <Select.Option value="inspiring">High-Vibration & Visionary</Select.Option>
                    <Select.Option value="educational">Logical & Analytical</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="aiPersonality" label={<span style={labelStyle}>Personality Core (System Instructions)</span>} rules={[{ required: true }]}>
                  <TextArea
                    rows={8}
                    placeholder="Define the core behavioral logic of your digital twin..."
                    style={{ ...inputStyle, height: 'auto', paddingTop: '16px' }}
                  />
                </Form.Item>

                <Form.Item name="welcomeMessage" label={<span style={labelStyle}>Genesis Greeting</span>} rules={[{ required: true }]}>
                  <Input size="large" placeholder="The first interaction vector" prefix={<Zap size={18} style={{ color: colors.primary.solid, marginRight: '8px' }} />} style={inputStyle} />
                </Form.Item>
              </Card>

              {/* Monetization */}
              <Card
                title={<span style={cardTitleStyle}>Commercial Strategic Layer</span>}
                bordered={false}
                style={glassStyle}
                styles={{ body: { padding: isMobile ? '20px' : '40px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 40px' } }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : spacing[6], marginBottom: '12px' }}>
                  <Form.Item name="pricePerMessage" label={<span style={labelStyle}>Interaction Unit Price (INR)</span>}>
                    <InputNumber
                      min={0}
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => (value ? value.replace(/₹\s?|(,*)/g, '') : '') as any}
                      style={{ ...inputStyle, width: '100%', paddingTop: '12px' }}
                    />
                  </Form.Item>
                  <Form.Item name="discountFirstFive" label={<span style={labelStyle}>Genesis Phase Discount (%)</span>}>
                    <InputNumber
                      min={0}
                      max={100}
                      formatter={value => `${value}%`}
                      parser={value => (value ? value.replace('%', '') : '') as any}
                      style={{ ...inputStyle, width: '100%', paddingTop: '12px' }}
                    />
                  </Form.Item>
                </div>

                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: colors.gray[50], borderRadius: '12px', border: `1px solid ${colors.gray[100]}` }}>
                  <Form.Item name="firstMessageFree" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Switch />
                  </Form.Item>
                  <div>
                    <Text style={{ fontWeight: 800, color: colors.text.primary, fontSize: '14px', display: 'block' }}>Genesis Unit Frictionless</Text>
                    <Text style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 500 }}>Permit the first neural interaction without commercial exchange.</Text>
                  </div>
                </div>

                <Alert
                  message={<span style={{ fontWeight: 800, color: colors.primary.solid, fontSize: '14px' }}>Secured Transaction Matrix</span>}
                  description={<span style={{ color: colors.text.secondary, fontSize: '12px', fontWeight: 500 }}>All financial units are synchronized via end-to-end encrypted commercial protocols.</span>}
                  type="info"
                  showIcon
                  icon={<ShieldCheck size={20} style={{ color: colors.primary.solid }} />}
                  style={{ background: colors.primary.subtle, border: `1px solid ${colors.primary.solid}15`, borderRadius: '16px', padding: '16px' }}
                />
              </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
              {/* Actions */}
              <Card bordered={false} style={glassStyle} styles={{ body: { padding: '32px' } }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  disabled={!isDirty || saving}
                  block
                  style={{
                    height: '44px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: colors.primary.solid,
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: isDirty ? shadows.md : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  Synchronize Matrix <RefreshCw size={16} className={saving ? 'spin-anim' : ''} />
                </Button>
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <div style={{ color: colors.text.tertiary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '12px' }}>Operational Status</div>
                  <Tag bordered={false} style={{
                    padding: '6px 20px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    fontSize: '13px',
                    background: profileData?.isVerified ? colors.success.subtle : colors.primary.subtle,
                    color: profileData?.isVerified ? colors.success.solid : colors.primary.solid
                  }}>
                    {profileData?.isVerified ? 'VERIFIED AGENT' : 'CALIBRATION PHASE'}
                  </Tag>
                </div>
              </Card>

              {/* Stats */}
              <Card
                title={<span style={cardTitleStyle}>Operations Matrix</span>}
                bordered={false}
                style={glassStyle}
                styles={{ body: { padding: '32px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 32px' } }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Followers', value: profileData?.followersCount || 0, icon: <User size={14} /> },
                    { label: 'Total Syncs', value: profileData?.totalChats || 0, icon: <Cpu size={14} /> },
                    { label: 'Discovery', value: profileData?.profileViews || 0, icon: <Globe size={14} /> },
                    { label: 'Rating', value: profileData?.rating ? `${profileData.rating}/5` : '4.9', icon: <Sparkles size={14} /> }
                  ].map((stat, i) => (
                    <div key={i} style={{ background: colors.gray[50], padding: '20px 12px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${colors.gray[100]}` }}>
                      <div style={{ color: colors.text.tertiary, fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                        {stat.icon} {stat.label}
                      </div>
                      <div style={{ color: colors.text.primary, fontSize: '20px', fontWeight: 900 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <Divider style={{ margin: '24px 0', borderColor: colors.gray[50] }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                  <Text style={{ color: colors.text.secondary, fontWeight: 700, fontSize: '14px' }}>Liquid Reserve</Text>
                  <Text style={{ color: colors.success.solid, fontWeight: 900, fontSize: '22px' }}>₹{profileData?.availableBalance || 0}</Text>
                </div>
              </Card>

              {/* Socials */}
              <Card
                title={<span style={cardTitleStyle}>Neural Link Matrix</span>}
                bordered={false}
                style={glassStyle}
                styles={{ body: { padding: '32px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 32px' } }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={24}>
                  <Form.Item name="youtubeUrl" label={<span style={labelStyle}>YouTube Vector</span>} style={{ marginBottom: 0 }}>
                    <Input placeholder="Channel ID" prefix={<Youtube size={18} color="#ef4444" style={{ marginRight: '8px' }} />} style={inputStyle} />
                  </Form.Item>
                  <Form.Item name="instagramUrl" label={<span style={labelStyle}>IG Protocol</span>} style={{ marginBottom: 0 }}>
                    <Input placeholder="Handle" prefix={<Instagram size={18} color="#ec4899" style={{ marginRight: '8px' }} />} style={inputStyle} />
                  </Form.Item>
                  <Form.Item name="twitterUrl" label={<span style={labelStyle}>X Dimension</span>} style={{ marginBottom: 0 }}>
                    <Input placeholder="Username" prefix={<Twitter size={18} color="#1D9BF0" style={{ marginRight: '8px' }} />} style={inputStyle} />
                  </Form.Item>
                  <Form.Item name="websiteUrl" label={<span style={labelStyle}>Private Domain</span>} style={{ marginBottom: 0 }}>
                    <Input placeholder="Primary URL" prefix={<Globe size={18} color={colors.primary.solid} style={{ marginRight: '8px' }} />} style={inputStyle} />
                  </Form.Item>
                </Space>
              </Card>

              {/* Content Integration */}
              <Card
                title={<span style={cardTitleStyle}>Knowledge Ingestion</span>}
                bordered={false}
                style={glassStyle}
                styles={{ body: { padding: '32px' }, header: { borderBottom: `1px solid ${colors.gray[50]}`, padding: '0 32px' } }}
              >
                <List
                  dataSource={profileData?.contents || []}
                  renderItem={(item: any) => (
                    <List.Item style={{ borderBottom: `1px solid ${colors.gray[50]}`, padding: '16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                        <div style={{ background: colors.gray[50], width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.gray[100]}`, color: colors.primary.solid }}>
                          {item.type === 'YOUTUBE_VIDEO' ? <Youtube size={20} color="#ef4444" /> : <Database size={20} />}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <Text style={{ color: colors.text.primary, fontSize: '13px', display: 'block', fontWeight: 800 }} ellipsis>{item.title}</Text>
                          <Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 600 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </div>
                        <div>
                          {item.status === 'COMPLETED' ? (
                            <CheckCircle2 size={18} style={{ color: colors.success.solid }} />
                          ) : item.status === 'FAILED' ? (
                            <XCircle size={18} style={{ color: colors.error.solid }} />
                          ) : (
                            <RefreshCw size={18} className="spin-anim" style={{ color: colors.primary.solid }} />
                          )}
                        </div>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: <Text style={{ color: colors.text.tertiary, fontSize: '13px', fontWeight: 600 }}>Zero neural data ingested.</Text> }}
                />
                <Button block onClick={() => (window.location.href = '/onboarding/creator')} style={{ marginTop: '24px', height: '44px', borderRadius: '8px', fontWeight: 600, color: colors.text.primary, border: `1px solid ${colors.gray[200]}`, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Manage Knowledge Base <ChevronRight size={16} />
                </Button>
              </Card>
            </div>
          </div>
        </Form>

        <style>{`
          .ant-form-item-label label { height: auto !important; margin-bottom: 4px; color: ${colors.text.secondary} !important; font-weight: 600 !important; }
          .ant-select-selector { border: 1px solid ${colors.gray[200]} !important; color: ${colors.text.primary} !important; border-radius: 8px !important; transition: all 0.3s ease !important; background: #ffffff !important; font-weight: 500 !important; height: 40px !important; }
          .ant-select-selector:hover { border-color: ${colors.primary.solid} !important; }
          .ant-select-selection-placeholder { color: ${colors.text.tertiary} !important; fontWeight: 400 !important; }
          .ant-card-head { min-height: 64px; }
          .ant-input-number { background: #ffffff !important; border: 1px solid ${colors.gray[200]} !important; border-radius: 8px !important; height: 40px !important; }
          .ant-input-number-input { font-weight: 600 !important; color: ${colors.text.primary} !important; }
          .ant-select-selection-item { background: ${colors.primary.subtle} !important; border: 1px solid ${colors.primary.solid}20 !important; color: ${colors.primary.solid} !important; font-weight: 700 !important; border-radius: 6px !important; }
          .ant-input, .ant-input-affix-wrapper { background: #ffffff !important; border: 1px solid ${colors.gray[200]} !important; border-radius: 8px !important; color: ${colors.text.primary} !important; }
          .ant-input:focus, .ant-input-affix-wrapper-focused { border-color: ${colors.primary.solid} !important; box-shadow: 0 0 0 2px ${colors.primary.subtle} !important; }
          
          .spin-anim { animation: spin 2s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default CreatorSettings;
