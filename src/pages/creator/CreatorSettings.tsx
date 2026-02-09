import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, message, Spin, Divider, Space, Tag, List, Typography, Alert, Grid, InputNumber, Switch } from 'antd';
import {
  PictureOutlined,
  UserOutlined,
  ShareAltOutlined,
  RobotOutlined,
  BankOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  GlobalOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  TwitterOutlined,
  ThunderboltOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { ImageUpload } from '../../components/upload/ImageUpload';
import { CoverImageUpload } from '../../components/upload/CoverImageUpload';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { creatorApi, getImageUrl } from '../../services/api';
import { colors, spacing, shadows } from '../../styles/tokens';
import CustomButton from '../../components/common/Button/CustomButton';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const CreatorSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

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

      form.setFieldsValue(formValues);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
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
      message.success('Cover image updated!');
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
      message.success('Protocol configuration updated!');
      await fetchProfile();
    } catch (err) {
      message.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const glassStyle: React.CSSProperties = {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(24px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    color: '#ffffff',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '12px 16px',
    height: '48px'
  };

  const cardTitleStyle = { color: '#fff', fontSize: '18px', fontWeight: 700 };
  const labelStyle = { color: '#94a3b8', fontWeight: 600, fontSize: '14px', marginBottom: '8px', display: 'block' };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', margin: '-24px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: isMobile ? spacing[6] : spacing[8], padding: isMobile ? '0 16px' : 0 }}>
          <Title level={1} style={{ color: '#fff', margin: 0, fontSize: isMobile ? '32px' : '40px', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Creator Settings
          </Title>
          <Text style={{ color: '#64748b', fontSize: isMobile ? '16px' : '18px' }}>Refine your digital twin and identity matrix.</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
            gap: isMobile ? spacing[6] : spacing[8],
            padding: isMobile ? '0 12px' : 0
          }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
              {/* Visual Assets */}
              <Card
                title={<span style={cardTitleStyle}><PictureOutlined /> Visual Identity</span>}
                style={glassStyle}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ position: 'relative', marginBottom: '80px' }}>
                  <CoverImageUpload
                    currentCover={profileData?.coverImage}
                    onUploadSuccess={handleCoverUpload}
                    height={isMobile ? 140 : 200}
                  />
                  <div style={{
                    position: isMobile ? 'relative' : 'absolute',
                    bottom: isMobile ? 'auto' : '-50px',
                    left: isMobile ? '0' : '32px',
                    marginTop: isMobile ? '-40px' : 0,
                    padding: isMobile ? '0 16px' : 0,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: isMobile ? '12px' : '20px',
                    textAlign: isMobile ? 'center' : 'left'
                  }}>
                    <div style={{ border: '4px solid #020617', borderRadius: '50%', padding: '2px', background: '#020617', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                      <ImageUpload
                        onUpload={handleAvatarUpload}
                        cropShape="round"
                        aspectRatio={1}
                      >
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                          <img
                            src={getImageUrl(profileData?.profileImage || user?.avatar)}
                            style={{ width: isMobile ? 100 : 120, height: isMobile ? 100 : 120, borderRadius: '50%', objectFit: 'cover', background: '#1e293b' }}
                            alt="Avatar"
                          />
                          <div style={{ position: 'absolute', bottom: 4, right: 4, background: colors.primary.solid, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #020617', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                            <CameraOutlined style={{ color: '#fff', fontSize: '16px' }} />
                          </div>
                        </div>
                      </ImageUpload>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <Title level={3} style={{ color: '#fff', margin: 0, fontSize: '24px' }}>{profileData?.displayName}</Title>
                      <Tag color="blue" style={{ marginTop: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: colors.primary.light }}>
                        {profileData?.category || 'Uncategorized'}
                      </Tag>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? spacing[2] : spacing[6],
                  marginTop: isMobile ? '40px' : '20px'
                }}>
                  <Form.Item name="displayName" label={<span style={labelStyle}>Public Identity</span>} rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined style={{ color: colors.primary.light, opacity: 0.7 }} />} style={inputStyle} size="large" />
                  </Form.Item>
                  <Form.Item name="category" label={<span style={labelStyle}>Knowledge Domain</span>}>
                    <Select placeholder="Select niche" style={{ height: '48px' }} dropdownStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Select.Option value="Fitness">Fitness</Select.Option>
                      <Select.Option value="Business">Business</Select.Option>
                      <Select.Option value="Technology">Technology</Select.Option>
                      <Select.Option value="Lifestyle">Lifestyle</Select.Option>
                      <Select.Option value="Education">Education</Select.Option>
                      <Select.Option value="Entertainment">Entertainment</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item name="tagline" label={<span style={labelStyle}>Brand Tagline</span>}>
                  <Input placeholder="Your mission statement" style={inputStyle} size="large" />
                </Form.Item>

                <Form.Item name="tags" label={<span style={labelStyle}>Identity Tags</span>}>
                  <Select mode="tags" placeholder="Add tags to help fans find you" style={{ minHeight: '48px' }} dropdownStyle={{ background: '#0f172a' }} tokenSeparators={[',']}>
                    <Select.Option value="AI">AI</Select.Option>
                    <Select.Option value="Growth">Growth</Select.Option>
                    <Select.Option value="Startup">Startup</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="bio" label={<span style={labelStyle}>Persona Biography</span>}>
                  <TextArea rows={5} placeholder="Full narrative bio..." style={{ ...inputStyle, height: 'auto' }} />
                </Form.Item>
              </Card>

              {/* AI Configuration */}
              <Card
                title={<span style={cardTitleStyle}><RobotOutlined /> Neural Configuration</span>}
                style={glassStyle}
              >
                <Form.Item name="aiTone" label={<span style={labelStyle}>Communication Tone</span>} rules={[{ required: true }]}>
                  <Select size="large" style={{ height: '48px' }} placeholder="Select AI frequency" dropdownStyle={{ background: '#0f172a' }}>
                    <Select.Option value="friendly">Friendly & Approachable</Select.Option>
                    <Select.Option value="professional">Professional & Authoritative</Select.Option>
                    <Select.Option value="casual">Casual & Genuine</Select.Option>
                    <Select.Option value="inspiring">Inspiring & High-Energy</Select.Option>
                    <Select.Option value="educational">Educational & Methodical</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="aiPersonality" label={<span style={labelStyle}>Personality Core (System Prompt)</span>} rules={[{ required: true }]}>
                  <TextArea
                    rows={8}
                    placeholder="Describe your AI persona..."
                    style={{ ...inputStyle, height: 'auto' }}
                  />
                </Form.Item>

                <Form.Item name="welcomeMessage" label={<span style={labelStyle}>Genesis Message</span>} rules={[{ required: true }]}>
                  <Input size="large" placeholder="The first thing your AI says" style={inputStyle} />
                </Form.Item>
              </Card>

              {/* Bank Details */}
              <Card
                title={<span style={cardTitleStyle}><BankOutlined /> Monetization Matrix</span>}
                style={glassStyle}
              >
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : spacing[4] }}>
                  <Form.Item name="bankName" label={<span style={labelStyle}>Bank Name</span>}>
                    <Input placeholder="e.g. HDFC Bank" style={inputStyle} size="large" />
                  </Form.Item>
                  <Form.Item name="accountHolderName" label={<span style={labelStyle}>Account Holder</span>}>
                    <Input placeholder="Full legal name" style={inputStyle} size="large" />
                  </Form.Item>
                </div>
                <Form.Item name="accountNumber" label={<span style={labelStyle}>Account Number</span>}>
                  <Input placeholder="XXXX XXXX XXXX" style={inputStyle} size="large" type="password" />
                </Form.Item>
                <Form.Item name="ifscCode" label={<span style={labelStyle}>IFSC Code</span>}>
                  <Input placeholder="IFSC0001234" style={inputStyle} size="large" />
                </Form.Item>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />
                <Title level={5} style={{ color: '#fff', marginBottom: '20px' }}>Pricing Strategy</Title>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : spacing[4] }}>
                  <Form.Item name="pricePerMessage" label={<span style={labelStyle}>Price Per Message (INR)</span>}>
                    <InputNumber
                      min={0}
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => (value ? value.replace(/₹\s?|(,*)/g, '') : '') as any}
                      style={{ ...inputStyle, width: '100%', height: '48px', paddingTop: '8px' }}
                    />
                  </Form.Item>
                  <Form.Item name="discountFirstFive" label={<span style={labelStyle}>Discount on first 5 messages (%)</span>}>
                    <InputNumber
                      min={0}
                      max={100}
                      formatter={value => `${value}%`}
                      parser={value => (value ? value.replace('%', '') : '') as any}
                      style={{ ...inputStyle, width: '100%', height: '48px', paddingTop: '8px' }}
                    />
                  </Form.Item>
                </div>

                <Form.Item name="firstMessageFree" label={<span style={labelStyle}>First Message Free</span>} valuePropName="checked">
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>

                <Alert
                  message={<span style={{ fontWeight: 700, color: '#fff' }}>Encrypted Channel</span>}
                  description={<span style={{ color: '#94a3b8' }}>Payout details are secured via end-to-end encryption protocols.</span>}
                  type="info"
                  showIcon
                  icon={<ThunderboltOutlined style={{ color: colors.primary.light }} />}
                  style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px' }}
                />
              </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
              {/* Action Sidebar */}
              <Card style={glassStyle} styles={{ body: { padding: '24px' } }}>
                <CustomButton
                  variant="primary"
                  htmlType="submit"
                  loading={saving}
                  style={{ width: '100%', height: '56px', borderRadius: '14px', fontSize: '18px', fontWeight: 800, border: 'none', boxShadow: shadows.glow.primary }}
                >
                  Save Changes
                </CustomButton>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Account Status</Text>
                  <div style={{ marginTop: '12px' }}>
                    <Tag color={profileData?.isVerified ? 'success' : 'processing'} style={{ padding: '6px 16px', borderRadius: '20px', fontWeight: 600, border: 'none' }}>
                      {profileData?.isVerified ? 'Verified Creator' : 'Onboarding Phase'}
                    </Tag>
                  </div>
                </div>
              </Card>

              {/* Performance Stats */}
              <Card
                title={<span style={cardTitleStyle}><ThunderboltOutlined /> Performance Matrix</span>}
                style={glassStyle}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Followers', value: profileData?.followersCount || 0 },
                    { label: 'Total Chats', value: profileData?.totalChats || 0 },
                    { label: 'Profile Views', value: profileData?.profileViews || 0 },
                    { label: 'Rating', value: profileData?.rating ? `${profileData.rating}/5` : 'N/A' }
                  ].map((stat, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 12px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>{stat.label}</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <Divider style={{ margin: '24px 0', borderColor: 'rgba(255,255,255,0.05)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                  <Text style={{ color: '#64748b', fontWeight: 600 }}>Available Balance</Text>
                  <Text style={{ color: '#10B981', fontWeight: 800, fontSize: '20px' }}>₹{profileData?.availableBalance || 0}</Text>
                </div>
              </Card>

              {/* Social Links */}
              <Card
                title={<span style={cardTitleStyle}><ShareAltOutlined /> Social Matrix</span>}
                style={glassStyle}
              >
                <Form.Item name="youtubeUrl" label={<span style={labelStyle}><YoutubeOutlined /> YouTube Channel</span>}>
                  <Input placeholder="URL" style={inputStyle} />
                </Form.Item>
                <Form.Item name="instagramUrl" label={<span style={labelStyle}><InstagramOutlined /> Instagram Profile</span>}>
                  <Input placeholder="URL" style={inputStyle} />
                </Form.Item>
                <Form.Item name="twitterUrl" label={<span style={labelStyle}><TwitterOutlined /> Twitter (X)</span>}>
                  <Input placeholder="URL" style={inputStyle} />
                </Form.Item>
                <Form.Item name="websiteUrl" label={<span style={labelStyle}><GlobalOutlined /> Private Domain</span>}>
                  <Input placeholder="URL" style={inputStyle} />
                </Form.Item>
              </Card>

              {/* Content Status */}
              <Card
                title={<span style={cardTitleStyle}><DatabaseOutlined /> Knowledge Base</span>}
                style={glassStyle}
                styles={{ body: { padding: '16px 24px' } }}
              >
                <List
                  dataSource={profileData?.contents || []}
                  renderItem={(item: any) => (
                    <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {item.type === 'YOUTUBE_VIDEO' ? <YoutubeOutlined style={{ color: '#ef4444' }} /> : <DatabaseOutlined style={{ color: '#6366f1' }} />}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <Text style={{ color: '#fff', fontSize: '13px', display: 'block', fontWeight: 600 }} ellipsis>{item.title}</Text>
                          <Text style={{ color: '#64748b', fontSize: '11px' }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </div>
                        <div>
                          {item.status === 'COMPLETED' ? (
                            <CheckCircleOutlined style={{ color: '#10b981' }} />
                          ) : item.status === 'FAILED' ? (
                            <CloseCircleOutlined style={{ color: '#ef4444' }} title={item.errorMessage} />
                          ) : (
                            <SyncOutlined spin style={{ color: colors.primary.light }} />
                          )}
                        </div>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: <Text style={{ color: '#4b5563' }}>No neural data ingested yet.</Text> }}
                />
                <CustomButton variant="secondary" onClick={() => (window.location.href = '/onboarding/creator')} style={{ width: '100%', marginTop: '20px', height: '44px', borderRadius: '12px' }}>
                  Manage Knowledge
                </CustomButton>
              </Card>
            </div>
          </div>
        </Form>

        <style>{`
          .ant-form-item-label label { height: auto !important; margin-bottom: 4px; color: #94a3b8 !important; }
          .ant-select-selector { background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #fff !important; border-radius: 12px !important; transition: all 0.3s ease !important; }
          .ant-select-selector:hover { border-color: rgba(99, 102, 241, 0.5) !important; background: rgba(255, 255, 255, 0.05) !important; }
          .ant-select-selection-placeholder { color: #4b5563 !important; }
          .ant-card-head { border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; padding: 0 24px !important; min-height: 64px; display: flex; align-items: center; }
          .ant-input-affix-wrapper { background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; transition: all 0.3s ease !important; }
          .ant-input-affix-wrapper:hover { border-color: rgba(99, 102, 241, 0.5) !important; }
          .ant-input { background: transparent !important; color: #fff !important; }
          .ant-input-textarea-show-count::after { color: #64748b; }
          .ant-select-selection-item { background: rgba(99, 102, 241, 0.2) !important; border: 1px solid rgba(99, 102, 241, 0.3) !important; color: #fff !important; }
          .ant-select-selection-item-remove { color: #fff !important; }
        `}</style>
      </div>
    </div>
  );
};

export default CreatorSettings;
