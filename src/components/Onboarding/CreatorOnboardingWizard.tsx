// ===========================================
// CREATOR ONBOARDING WIZARD
// Flagship 7-step onboarding flow with Socials & Media
// ===========================================

import { useState, useEffect } from 'react';
import { Steps, Button, Card, Form, Input, Select, message as antMessage, Space, Divider, Alert, Tooltip, Modal, Avatar, Switch, InputNumber } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  RobotOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  YoutubeOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  InstagramOutlined,
  TwitterOutlined,
  ShareAltOutlined,
  PictureOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../common/Button/CustomButton';
import { colors, spacing, typography } from '../../styles/tokens';
import api, { creatorApi, contentApi, getImageUrl } from '../../services/api';
import { RootState } from '../../store';
import { updateUser, setProfileComplete } from '../../store/slices/authSlice';
import OnboardingProcessing from './OnboardingProcessing';
import AnimatedBackground from './AnimatedBackground';
import { ImageUpload } from '../upload/ImageUpload';
import { CoverImageUpload } from '../upload/CoverImageUpload';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

interface WizardStep {
  title: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  { title: 'Identity', icon: <UserOutlined /> },
  { title: 'Knowledge', icon: <FileTextOutlined /> },
  { title: 'Economics', icon: <DollarOutlined /> },
  { title: 'Intelligence', icon: <RobotOutlined /> },
  { title: 'Launch', icon: <RocketOutlined /> },
];

export const CreatorOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [current, setCurrent] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'none' | 'processing' | 'training' | 'completed'>('none');
  const [form] = Form.useForm();
  const [socialForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Modal states
  const [isSocialModalVisible, setIsSocialModalVisible] = useState(false);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);

  // Content state
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['']);
  const [manualText, setManualText] = useState({ title: '', text: '' });

  useEffect(() => {
    if (user && !isInitialized) {
      form.setFieldsValue({
        displayName: user.creator?.displayName || user.name,
        bio: user.creator?.bio,
        tagline: user.creator?.tagline,
        category: user.creator?.category,
        aiPersonality: user.creator?.aiPersonality,
        aiTone: user.creator?.aiTone,
        welcomeMessage: user.creator?.welcomeMessage,
        bankName: user.creator?.bankAccount?.bankName,
        accountHolderName: user.creator?.bankAccount?.accountHolderName,
        accountNumber: user.creator?.bankAccount?.accountNumber,
        ifscCode: user.creator?.bankAccount?.ifscCode,
        pricePerMessage: user.creator?.pricePerMessage || 50,
        firstMessageFree: user.creator?.firstMessageFree ?? true,
        discountFirstFive: user.creator?.discountFirstFive || 0,
        tags: user.creator?.tags || [],
      });
      socialForm.setFieldsValue({
        youtubeUrl: user.creator?.youtubeUrl,
        instagramUrl: user.creator?.instagramUrl,
        twitterUrl: user.creator?.twitterUrl,
        websiteUrl: user.creator?.websiteUrl,
      });
      setIsInitialized(true);
    }
  }, [user, form, socialForm, isInitialized]);

  const handleNext = async () => {
    try {
      setLoading(true);
      if (current === 0) {
        const values = await form.validateFields(['displayName', 'category', 'tagline', 'bio', 'tags']);
        await creatorApi.updateProfile(values);
        // We logicially update the creator part of the user
        dispatch(updateUser({ creator: { ...user?.creator, ...values } } as any));
        antMessage.success({ content: 'Identity Decoded', icon: <CheckCircleOutlined style={{ color: colors.primary.solid }} /> });
      } else if (current === 1) {
        const validYoutube = youtubeUrls.filter(url => url.trim() !== '');
        for (const url of validYoutube) {
          await contentApi.addYouTube(url);
        }
        if (manualText.text.length >= 10) {
          await contentApi.addManual(manualText.title || 'Untitled Knowledge', manualText.text);
        }
        antMessage.success({ content: 'Knowledge Base Synced', icon: < FileTextOutlined style={{ color: colors.primary.solid }} /> });
      } else if (current === 2) {
        // Economics - Pricing & Bank Details
        const pricingValues = await form.validateFields(['pricePerMessage', 'firstMessageFree', 'discountFirstFive']);
        const bankValues = await form.validateFields(['bankName', 'accountHolderName', 'accountNumber', 'ifscCode']);

        // Update top-level creator fields (pricing)
        await creatorApi.updateProfile(pricingValues);

        // Update nested bank account
        await api.put('/creators/profile', { bankAccount: bankValues });

        dispatch(updateUser({
          creator: {
            ...user?.creator,
            ...pricingValues,
            bankAccount: bankValues
          }
        } as any));
        antMessage.success({ content: 'Economics Synchronized', icon: <DollarOutlined style={{ color: colors.primary.solid }} /> });
      } else if (current === 3) {
        const values = await form.validateFields(['aiPersonality', 'aiTone', 'welcomeMessage']);
        await creatorApi.updateProfile(values);
        dispatch(updateUser({ creator: { ...user?.creator, ...values } } as any));
        antMessage.success({ content: 'Intelligence Configured', icon: <RobotOutlined style={{ color: colors.primary.solid }} /> });
      }
      setCurrent(current + 1);
    } catch (error: any) {
      antMessage.error(error.response?.data?.error || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      // Formalize onboarding completion on backend
      await creatorApi.updateProfile({ isProfileComplete: true });

      setProcessingStatus('processing');
      setTimeout(() => {
        setProcessingStatus('training');
        setTimeout(() => {
          setProcessingStatus('completed');
        }, 5000);
      }, 4000);
    } catch (error: any) {
      antMessage.error(error.response?.data?.error || 'Failed to finalize profile protocol');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSave = async () => {
    try {
      setLoading(true);
      const values = await socialForm.validateFields();
      await creatorApi.updateProfile(values);
      dispatch(updateUser({ creator: { ...user?.creator, ...values } } as any));
      antMessage.success('Social connectivity updated');
      setIsSocialModalVisible(false);
    } catch (error) {
      // Handled by antd
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (croppedImage: Blob, fileName: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      // Using 'avatar' as the field name as expected by the backend routes
      formData.append('avatar', croppedImage, fileName);

      // CRITICAL: Do not set Content-Type manually with Axios & FormData
      const response = await api.post('/upload/avatar', formData);

      if (response.data.success) {
        const url = response.data.data.url;
        // Synchronize both user.avatar and creator.profileImage
        await creatorApi.updateProfile({ profileImage: url });
        dispatch(updateUser({
          avatar: url,
          creator: { ...user?.creator, profileImage: url }
        } as any));
        antMessage.success('Neural avatar mapping successful');

        // Auto-close if both visuals are now established
        if (user?.creator?.coverImage) {
          setTimeout(() => setIsMediaModalVisible(false), 800);
        }
      }
      return response.data;
    } catch (error: any) {
      antMessage.error(error.response?.data?.error || 'Avatar upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUploadSuccess = async (url: string) => {
    // The CoverImageUpload component already does the POST /upload/cover
    // and it uses 'cover' as the field name. 
    // We just need to sync the state here.
    dispatch(updateUser({
      creator: { ...user?.creator, coverImage: url }
    } as any));
    antMessage.success('Cover Identity Established');

    // Auto-close if both visuals are now established
    if (user?.creator?.profileImage || user?.avatar) {
      setTimeout(() => setIsMediaModalVisible(false), 800);
    }
  };

  const glassStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '32px',
    color: '#ffffff',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '12px 16px',
  };

  const renderStepContent = () => {
    const profileImg = user?.creator?.profileImage || user?.avatar;

    switch (current) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: spacing[2] }}>Establish Identity</h2>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>Define your digital persona and reach.</p>
            </div>

            <Form form={form} layout="vertical" requiredMark={false}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6], marginBottom: spacing[6] }}>
                <Form.Item name="displayName" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Public Identity</span>} rules={[{ required: true }]}>
                  <Input size="large" placeholder="Name" style={inputStyle} prefix={<UserOutlined style={{ color: colors.primary.solid }} />} />
                </Form.Item>
                <Form.Item name="category" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Knowledge Domain</span>} rules={[{ required: true }]}>
                  <Select size="large" placeholder="Select niche" dropdownStyle={{ background: '#0f172a' }}>
                    <Option value="Technology">Technology</Option>
                    <Option value="Fitness">Fitness</Option>
                    <Option value="Business">Business</Option>
                    <Option value="Lifestyle">Lifestyle</Option>
                    <Option value="Education">Education</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item name="tagline" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Brand Tagline</span>} rules={[{ required: true }]}>
                <Input size="large" placeholder="Your mission statement" style={inputStyle} />
              </Form.Item>

              <Form.Item name="bio" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Persona Biography</span>} rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Tell your fans who you are..." style={inputStyle} />
              </Form.Item>

              <Form.Item name="tags" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Search Tags</span>}>
                <Select mode="tags" style={{ width: '100%' }} placeholder="Add tags (e.g. Cooking, Chef, Healthy)" tokenSeparators={[',']} dropdownStyle={{ background: '#0f172a' }}>
                </Select>
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginTop: spacing[4] }}>
                <div onClick={() => setIsMediaModalVisible(true)} style={{ ...glassStyle, padding: spacing[4], cursor: 'pointer', borderRadius: '20px', border: (profileImg && user?.creator?.coverImage) ? '1px solid #10b981' : '1px solid rgba(99, 102, 241, 0.2)' }} className="hover-glow">
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar size={48} src={getImageUrl(profileImg)} icon={<UserOutlined />} style={{ background: '#1e293b' }} />
                      <div style={{ position: 'absolute', bottom: -5, right: -5, background: (profileImg && user?.creator?.coverImage) ? '#10b981' : colors.primary.solid, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}>
                        {(profileImg && user?.creator?.coverImage) ? <CheckCircleOutlined /> : <CameraOutlined />}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Visual Assets {(profileImg && user?.creator?.coverImage) && <CheckCircleOutlined style={{ color: '#10b981' }} />}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Configure Avatar & Cover</div>
                    </div>
                  </div>
                </div>

                <div onClick={() => setIsSocialModalVisible(true)} style={{ ...glassStyle, padding: spacing[4], cursor: 'pointer', borderRadius: '20px', border: (user?.creator?.youtubeUrl || user?.creator?.instagramUrl || user?.creator?.twitterUrl || user?.creator?.websiteUrl) ? '1px solid #10b981' : '1px solid rgba(168, 85, 247, 0.2)' }} className="hover-glow">
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{ background: (user?.creator?.youtubeUrl || user?.creator?.instagramUrl || user?.creator?.twitterUrl || user?.creator?.websiteUrl) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(168, 85, 247, 0.1)', width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (user?.creator?.youtubeUrl || user?.creator?.instagramUrl || user?.creator?.twitterUrl || user?.creator?.websiteUrl) ? '#10b981' : '#a855f7', fontSize: 24 }}>
                      {(user?.creator?.youtubeUrl || user?.creator?.instagramUrl || user?.creator?.twitterUrl || user?.creator?.websiteUrl) ? <CheckCircleOutlined /> : <ShareAltOutlined />}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Social Matrix {(user?.creator?.youtubeUrl || user?.creator?.instagramUrl || user?.creator?.twitterUrl || user?.creator?.websiteUrl) && <CheckCircleOutlined style={{ color: '#10b981' }} />}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Connect Profiles</div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>

            <Modal
              title={<span style={{ color: '#fff' }}>Social Connectivity Matrix</span>}
              open={isSocialModalVisible} onCancel={() => setIsSocialModalVisible(false)} footer={null} centered width={500}
              styles={{ content: { ...glassStyle, padding: 0 }, header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }, body: { padding: '24px' } }}
            >
              <Form form={socialForm} layout="vertical">
                <Form.Item name="youtubeUrl" label={<span style={{ color: '#94a3b8' }}><YoutubeOutlined /> YouTube</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <Form.Item name="instagramUrl" label={<span style={{ color: '#94a3b8' }}><InstagramOutlined /> Instagram</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <Form.Item name="twitterUrl" label={<span style={{ color: '#94a3b8' }}><TwitterOutlined /> Twitter (X)</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <Form.Item name="websiteUrl" label={<span style={{ color: '#94a3b8' }}><GlobalOutlined /> Website</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <CustomButton variant="primary" onClick={handleSocialSave} loading={loading} style={{ width: '100%', marginTop: spacing[4] }}>Save Connections</CustomButton>
              </Form>
            </Modal>

            <Modal title={<span style={{ color: '#fff' }}>Visual Identity protocol</span>} open={isMediaModalVisible} onCancel={() => setIsMediaModalVisible(false)} footer={null} centered width={680}
              styles={{ content: { ...glassStyle, padding: 0 }, header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }, body: { padding: '24px' } }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
                <div>
                  <h4 style={{ color: '#fff', marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PictureOutlined /> Profile cover {user?.creator?.coverImage && <CheckCircleOutlined style={{ color: '#10b981', fontSize: '14px' }} />}
                  </h4>
                  <CoverImageUpload currentCover={user?.creator?.coverImage} onUploadSuccess={handleCoverUploadSuccess} height={160} />
                </div>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.05)', margin: 0 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[6] }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#fff', marginBottom: spacing[1], display: 'flex', alignItems: 'center', gap: 8 }}>
                      Avatar Image {profileImg && <CheckCircleOutlined style={{ color: '#10b981', fontSize: '14px' }} />}
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: spacing[4] }}>Headshot for your AI digital twin.</p>
                    <ImageUpload onUpload={handleAvatarUpload} cropShape="round" aspectRatio={1}>
                      <Button icon={<CameraOutlined />} type="primary" size="large">Upload headshot</Button>
                    </ImageUpload>
                  </div>
                  <Avatar size={100} src={getImageUrl(profileImg)} icon={<UserOutlined />} style={{ border: '3px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }} />
                </div>
              </div>
            </Modal>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: spacing[4] }}>Knowledge Ingestion</h2>
            <Card style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', marginBottom: spacing[4] }}>
              <h4 style={{ color: '#fff', marginBottom: spacing[4] }}>Content Streams (YouTube)</h4>
              {youtubeUrls.map((url, idx) => (
                <Input key={idx} value={url} onChange={e => { const u = [...youtubeUrls]; u[idx] = e.target.value; setYoutubeUrls(u); }} placeholder="Paste video link" style={{ ...inputStyle, marginBottom: spacing[2] }} />
              ))}
              <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setYoutubeUrls([...youtubeUrls, ''])} style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: '#94a3b8' }}>Link Another Stream</Button>
            </Card>
            <TextArea value={manualText.text} onChange={e => setManualText({ ...manualText, text: e.target.value })} rows={6} placeholder="Paste articles or scripts here..." style={inputStyle} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: spacing[2] }}>Monetization Matrix</h2>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>Configure your bank identity for seamless payouts.</p>
            </div>

            <Form form={form} layout="vertical" requiredMark={false}>
              <div style={{ ...glassStyle, padding: spacing[6], marginBottom: spacing[6], background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ color: '#fff', marginBottom: spacing[4], display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ThunderboltOutlined style={{ color: colors.primary.solid }} /> Pricing Strategy
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6] }}>
                  <Form.Item name="pricePerMessage" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Price Per Message (₹)</span>} rules={[{ required: true }]}>
                    <InputNumber size="large" style={{ ...inputStyle, width: '100%' }} min={0} placeholder="100" />
                  </Form.Item>
                  <Form.Item name="discountFirstFive" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>First 5 Msgs Discount (%)</span>}>
                    <InputNumber size="large" style={{ ...inputStyle, width: '100%' }} min={0} max={100} placeholder="15.5" />
                  </Form.Item>
                </div>
                <Form.Item name="firstMessageFree" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>First Message Free</span>} valuePropName="checked">
                  <Switch />
                </Form.Item>
              </div>

              <div style={{ marginBottom: spacing[4] }}>
                <h4 style={{ color: '#fff', marginBottom: spacing[4], display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GlobalOutlined style={{ color: colors.primary.solid }} /> Settlement Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6], marginBottom: spacing[4] }}>
                  <Form.Item name="bankName" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Bank Name</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="e.g. HDFC Bank" style={inputStyle} />
                  </Form.Item>
                  <Form.Item name="accountHolderName" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Account Holder</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="Full legal name" style={inputStyle} />
                  </Form.Item>
                </div>
              </div>

              <Form.Item name="accountNumber" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Account Number</span>} rules={[{ required: true }]}>
                <Input size="large" placeholder="0000 0000 0000" style={inputStyle} type="password" />
              </Form.Item>

              <Form.Item name="ifscCode" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>IFSC Code</span>} rules={[{ required: true }]}>
                <Input size="large" placeholder="IFSC0001234" style={inputStyle} />
              </Form.Item>

              <Alert
                message="Security Protocol Active"
                description="Your bank credentials are encrypted with AES-256 and never stored in plain text."
                type="info"
                showIcon
                icon={<ThunderboltOutlined />}
                style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#94a3b8', borderRadius: '12px' }}
              />
            </Form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: spacing[2] }}>Neural Configuration</h2>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>Calibrate your AI digital twin's persona and core logic.</p>
            </div>

            <Form form={form} layout="vertical" requiredMark={false}>
              <Form.Item name="aiTone" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Communication Tone</span>} rules={[{ required: true }]}>
                <Select size="large" placeholder="Select AI frequency" dropdownStyle={{ background: '#0f172a' }}>
                  <Option value="friendly">Friendly & Approachable</Option>
                  <Option value="professional">Professional & Authoritative</Option>
                  <Option value="casual">Casual & Genuine</Option>
                  <Option value="inspiring">Inspiring & High-Energy</Option>
                  <Option value="educational">Educational & Methodical</Option>
                </Select>
              </Form.Item>

              <Form.Item name="aiPersonality" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Personality Core (System Prompt)</span>} rules={[{ required: true }]}>
                <TextArea
                  rows={4}
                  placeholder="Describe your AI persona... (e.g., 'You are a tech expert who explains complex topics with simple metaphors.')"
                  style={inputStyle}
                />
              </Form.Item>

              <Form.Item name="welcomeMessage" label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Genesis Message</span>} rules={[{ required: true }]}>
                <Input size="large" placeholder="The first thing your AI says to new fans" style={inputStyle} />
              </Form.Item>
            </Form>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: spacing[8] }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '64px', color: '#10b981', marginBottom: spacing[4] }}
              >
                <RocketOutlined />
              </motion.div>
              <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>Genesis Protocol Ready</h2>
              <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                Your digital twin has been successfully encoded with your knowledge and visual identity.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4], marginBottom: spacing[8] }}>
              {[
                { label: 'Identity', color: '#6366f1', status: 'Established' },
                { label: 'Knowledge', color: '#a855f7', status: 'Ingested' },
                { label: 'Intelligence', color: '#3b82f6', status: 'Calibrated' }
              ].map((item, idx) => (
                <div key={idx} style={{ ...glassStyle, padding: spacing[4], borderRadius: '20px', textAlign: 'center' }}>
                  <div style={{ color: item.color, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{item.status}</div>
                </div>
              ))}
            </div>

            <Alert
              message="Final Deployment"
              description="Hitting 'Complete' will finalize your ingestion into the AntiGravity network. Your AI twin will be live and ready for interactions."
              type="success"
              showIcon
              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#94a3b8', borderRadius: '16px', textAlign: 'left' }}
            />
          </motion.div>
        );
      default: return null;
    }
  };

  if (processingStatus !== 'none') {
    return (
      <AnimatedBackground>
        <div style={{ width: '100%', maxWidth: '900px', padding: '0 20px' }}>
          <div style={glassStyle}>
            <OnboardingProcessing
              status={processingStatus === 'completed' ? 'completed' : (processingStatus === 'training' ? 'training' : 'processing')}
              onComplete={() => {
                dispatch(setProfileComplete(true));
                navigate('/creator-dashboard');
              }}
            />
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: spacing[8], padding: '40px 20px' }}>
        <div style={glassStyle}>
          <div style={{ padding: spacing[10] }}>
            <Steps size="small" current={current} className="flagship-steps" style={{ marginBottom: spacing[12] }}>
              {steps.map((item, idx) => (
                <Step key={idx} title={<span style={{ fontWeight: 600, fontSize: '13px' }}>{item.title}</span>} icon={item.icon} />
              ))}
            </Steps>

            <AnimatePresence mode="wait">
              <div key={current} style={{ minHeight: '480px' }}>
                {renderStepContent() || <div style={{ color: '#fff' }}>Configuring Protocol...</div>}
              </div>
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: spacing[8], marginTop: spacing[4] }}>
              <Button disabled={current === 0 || loading} onClick={() => setCurrent(current - 1)} size="large" ghost style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', height: '56px', width: '120px' }}>Back</Button>
              {current < steps.length - 1 ? (
                <CustomButton variant="primary" onClick={handleNext} loading={loading} size="large" style={{ width: '220px', height: '56px', borderRadius: '12px', fontSize: '16px', fontWeight: 700 }}>Save & Continue →</CustomButton>
              ) : (
                <CustomButton variant="primary" onClick={handleFinish} loading={loading} size="large" style={{ width: '280px', height: '56px', borderRadius: '12px', fontSize: '18px', fontWeight: 800 }}>Complete</CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .flagship-steps .ant-steps-item-icon { background: rgba(255, 255, 255, 0.03) !important; border-color: rgba(255, 255, 255, 0.08) !important; width: 40px !important; height: 40px !important; line-height: 40px !important; transition: all 0.4s ease; }
        .flagship-steps .ant-steps-item-active .ant-steps-item-icon { background: ${colors.primary.gradient} !important; border-color: transparent !important; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); transform: scale(1.1); }
        .hover-glow:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(99, 102, 241, 0.2) !important; border-color: rgba(99, 102, 241, 0.5) !important; }
        .ant-select-selector { background: rgba(255, 255, 255, 0.03) !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; color: #fff !important; border-radius: 12px !important; height: 48px !important; }
      `}</style>
    </AnimatedBackground>
  );
};

export default CreatorOnboardingWizard;
