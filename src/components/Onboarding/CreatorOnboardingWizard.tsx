// ===========================================
// CREATOR ONBOARDING WIZARD
// Flagship 7-step onboarding flow with Socials & Media
// ===========================================

import { useState, useEffect } from 'react';
import { Steps, Button, Card, Form, Input, Select, message as antMessage, Space, Divider, Alert, Tooltip, Modal, Avatar, Switch, InputNumber } from 'antd';
import {
  User,
  FileText,
  CircleDollarSign,
  Bot,
  Rocket,
  CheckCircle,
  Youtube,
  Plus,
  Trash2,
  Info,
  Globe,
  Zap,
  Instagram,
  Twitter,
  Share2,
  Image,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../common/Button/CustomButton';
import CustomCard from '../common/Card/CustomCard';
import CustomModal from '../common/Modal/CustomModal';
import CustomInput from '../common/Form/CustomInput';
import { colors, spacing, shadows, borderRadius, typography } from '../../styles/tokens';
import api, { creatorApi, contentApi, getImageUrl } from '../../services/api';
import { RootState } from '../../store';
import { updateUser, setProfileComplete } from '../../store/slices/authSlice';
import OnboardingProcessing from './OnboardingProcessing';
import { ImageUpload } from '../upload/ImageUpload';
import { CoverImageUpload } from '../upload/CoverImageUpload';
import AnimatedBackground from './AnimatedBackground';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

interface WizardStep {
  title: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  { title: 'Identity', icon: <User size={20} /> },
  { title: 'Knowledge', icon: <FileText size={20} /> },
  { title: 'Economics', icon: <CircleDollarSign size={20} /> },
  { title: 'Intelligence', icon: <Bot size={20} /> },
  { title: 'Launch', icon: <Rocket size={20} /> },
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
        antMessage.success({ content: 'Identity Decoded', icon: <CheckCircle size={16} /> });
      } else if (current === 1) {
        const validYoutube = youtubeUrls.filter(url => url.trim() !== '');
        for (const url of validYoutube) {
          await contentApi.addYouTube(url);
        }
        if (manualText.text.length >= 10) {
          await contentApi.addManual(manualText.title || 'Untitled Knowledge', manualText.text);
        }
        antMessage.success({ content: 'Knowledge Base Synced', icon: <FileText size={16} /> });
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
        antMessage.success({ content: 'Economics Synchronized', icon: <CircleDollarSign size={16} /> });
      } else if (current === 3) {
        const values = await form.validateFields(['aiPersonality', 'aiTone', 'welcomeMessage']);
        await creatorApi.updateProfile(values);
        dispatch(updateUser({ creator: { ...user?.creator, ...values } } as any));
        antMessage.success({ content: 'Intelligence Configured', icon: <Bot size={16} /> });
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
    background: '#ffffff',
    borderRadius: '24px',
    color: colors.text.primary,
    boxShadow: shadows.lg,
    border: `1px solid ${colors.gray[100]}`,
  };

  const inputStyle: React.CSSProperties = {
    height: '48px',
    borderRadius: '10px',
    border: `1px solid ${colors.gray[200]}`,
    color: colors.text.primary,
    background: '#ffffff', // Force white background
    boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
  };

  const renderStepContent = () => {
    const profileImg = user?.creator?.profileImage || user?.avatar;

    switch (current) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em', marginBottom: spacing[2] }}>Establish Identity</h2>
              <p style={{ color: colors.text.secondary, fontSize: '16px' }}>Define your digital persona and reach.</p>
            </div>

            <Form form={form} layout="vertical" requiredMark={false}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6], marginBottom: spacing[6] }}>
                <Form.Item name="displayName" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Identity</span>} rules={[{ required: true }]}>
                  <Input size="large" placeholder="Name" style={inputStyle} prefix={<User size={18} style={{ color: colors.primary.solid }} />} />
                </Form.Item>
                <Form.Item name="category" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Knowledge Domain</span>} rules={[{ required: true }]}>
                  <Select size="large" placeholder="Select niche" className="premium-select" style={{ height: '48px' }}>
                    <Option value="Technology">Technology</Option>
                    <Option value="Fitness">Fitness</Option>
                    <Option value="Business">Business</Option>
                    <Option value="Lifestyle">Lifestyle</Option>
                    <Option value="Education">Education</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item name="tagline" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Tagline</span>} rules={[{ required: true }]}>
                <Input size="large" placeholder="Your mission statement" style={inputStyle} />
              </Form.Item>

              <Form.Item name="bio" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Persona Biography</span>} rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Tell your fans who you are..." style={{ ...inputStyle, height: 'auto', padding: '12px 16px' }} />
              </Form.Item>

              <Form.Item name="tags" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Tags</span>}>
                <Select mode="tags" className="premium-select" style={{ width: '100%', height: '48px' }} placeholder="Add tags (e.g. Cooking, Chef, Healthy)" tokenSeparators={[',']}>
                </Select>
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6], marginTop: spacing[6] }}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: shadows.md }}
                  onClick={() => setIsMediaModalVisible(true)}
                  style={{ background: '#fff', padding: spacing[5], cursor: 'pointer', borderRadius: '16px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar
                        size={56}
                        src={profileImg ? getImageUrl(profileImg) : undefined}
                        icon={<User style={{ color: colors.gray[400] }} />}
                        style={{ background: colors.gray[50], border: `2px solid ${colors.gray[100]}` }}
                      />
                      <div style={{ position: 'absolute', bottom: -2, right: -2, background: (profileImg && user?.creator?.coverImage) ? colors.success.solid : colors.primary.solid, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '2px solid #fff', boxShadow: shadows.sm }}>
                        {(profileImg && user?.creator?.coverImage) ? <CheckCircle size={14} /> : <Camera size={14} />}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Visual Assets {(profileImg && user?.creator?.coverImage) && <CheckCircle size={16} style={{ color: colors.success.solid }} />}
                      </div>
                      <div style={{ fontSize: '13px', color: colors.text.tertiary }}>Configure Avatar & Cover</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, boxShadow: shadows.md }}
                  onClick={() => setIsSocialModalVisible(true)}
                  style={{ background: '#fff', padding: spacing[5], cursor: 'pointer', borderRadius: '16px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                    <div style={{ background: colors.primary.subtle, width: 56, height: 56, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary.solid }}>
                      {(user?.creator?.youtubeUrl || user?.creator?.instagramUrl || user?.creator?.twitterUrl || user?.creator?.websiteUrl) ? <CheckCircle size={24} style={{ color: colors.success.solid }} /> : <Share2 size={24} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Social Matrix {(user?.creator?.youtubeUrl || user?.creator?.instagramUrl || user?.creator?.twitterUrl || user?.creator?.websiteUrl) && <CheckCircle size={16} style={{ color: colors.success.solid }} />}
                      </div>
                      <div style={{ fontSize: '13px', color: colors.text.tertiary }}>Connect Profiles</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Form>

            <CustomModal
              title="Social Connectivity Matrix"
              open={isSocialModalVisible}
              onCancel={() => setIsSocialModalVisible(false)}
              footer={null}
              centered
              width={500}
              icon={<Share2 />}
            >
              <Form form={socialForm} layout="vertical">
                <Form.Item name="youtubeUrl" label={<span style={{ color: colors.text.secondary }}><Youtube size={16} style={{ marginRight: 8 }} /> YouTube</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <Form.Item name="instagramUrl" label={<span style={{ color: colors.text.secondary }}><Instagram size={16} style={{ marginRight: 8 }} /> Instagram</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <Form.Item name="twitterUrl" label={<span style={{ color: colors.text.secondary }}><Twitter size={16} style={{ marginRight: 8 }} /> Twitter (X)</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <Form.Item name="websiteUrl" label={<span style={{ color: colors.text.secondary }}><Globe size={16} style={{ marginRight: 8 }} /> Website</span>}><Input placeholder="URL" style={inputStyle} /></Form.Item>
                <CustomButton variant="primary" onClick={handleSocialSave} loading={loading} style={{ width: '100%', marginTop: spacing[4] }}>Save Connections</CustomButton>
              </Form>
            </CustomModal>

            <CustomModal
              title="Visual Identity protocol"
              open={isMediaModalVisible}
              onCancel={() => setIsMediaModalVisible(false)}
              footer={null}
              centered
              width={680}
              icon={<Image />}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
                <div>
                  <h4 style={{ color: colors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Image size={18} /> Profile cover {user?.creator?.coverImage && <CheckCircle style={{ color: colors.success.solid, fontSize: '14px' }} />}
                  </h4>
                  <CoverImageUpload currentCover={user?.creator?.coverImage} onUploadSuccess={handleCoverUploadSuccess} height={160} />
                </div>
                <Divider style={{ borderColor: colors.gray[200], margin: 0 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[6] }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: colors.text.primary, marginBottom: spacing[1], display: 'flex', alignItems: 'center', gap: 8 }}>
                      Avatar Image {profileImg && <CheckCircle size={18} style={{ color: colors.success.solid }} />}
                    </h4>
                    <p style={{ color: colors.text.tertiary, fontSize: '13px', marginBottom: spacing[4] }}>Headshot for your AI digital twin.</p>
                    <ImageUpload onUpload={handleAvatarUpload} cropShape="round" aspectRatio={1}>
                      <Button icon={<Camera size={16} />} type="primary" size="large" style={{ borderRadius: '8px' }}>Upload headshot</Button>
                    </ImageUpload>
                  </div>
                  <Avatar
                    size={100}
                    src={profileImg ? getImageUrl(profileImg) : undefined}
                    icon={<User size={40} style={{ color: colors.gray[400] }} />}
                    style={{ border: `3px solid ${colors.primary.light}`, boxShadow: shadows.sm, background: colors.gray[50] }}
                  />
                </div>
              </div>
            </CustomModal>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: colors.text.primary, marginBottom: spacing[4] }}>Knowledge Ingestion</h2>
            <CustomCard depth={1} style={{ marginBottom: spacing[4] }}>
              <h4 style={{ color: colors.text.primary, marginBottom: spacing[4], fontWeight: 700 }}>Content Streams (YouTube)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {youtubeUrls.map((url, idx) => (
                  <Input key={idx} value={url} onChange={e => { const u = [...youtubeUrls]; u[idx] = e.target.value; setYoutubeUrls(u); }} placeholder="Paste video link" style={inputStyle} prefix={<Youtube size={16} style={{ color: colors.gray[400] }} />} />
                ))}
              </div>
              <Button type="dashed" block icon={<Plus size={16} />} onClick={() => setYoutubeUrls([...youtubeUrls, ''])} style={{ marginTop: spacing[3], height: '44px', borderRadius: '8px', borderStyle: 'dashed' }}>Link Another Stream</Button>
            </CustomCard>
            <TextArea value={manualText.text} onChange={e => setManualText({ ...manualText, text: e.target.value })} rows={6} placeholder="Paste articles or scripts here..." style={{ ...inputStyle, height: 'auto', padding: '12px 16px' }} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em', marginBottom: spacing[2] }}>Monetization Matrix</h2>
              <p style={{ color: colors.text.secondary, fontSize: '16px' }}>Configure your bank identity for seamless payouts.</p>
            </div>

            <Form form={form} layout="vertical" requiredMark={false}>
              <CustomCard depth={1} style={{ marginBottom: spacing[6] }}>
                <h4 style={{ color: colors.text.primary, marginBottom: spacing[4], display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  <Zap size={18} style={{ color: colors.primary.solid }} /> Pricing Strategy
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6] }}>
                  <Form.Item name="pricePerMessage" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Price Per Message (₹)</span>} rules={[{ required: true }]}>
                    <InputNumber size="large" style={{ ...inputStyle, width: '100%' }} min={0} placeholder="100" />
                  </Form.Item>
                  <Form.Item name="discountFirstFive" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>First 5 Msgs Discount (%)</span>}>
                    <InputNumber size="large" style={{ ...inputStyle, width: '100%' }} min={0} max={100} placeholder="15.5" />
                  </Form.Item>
                </div>
                <Form.Item name="firstMessageFree" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>First Message Free</span>} valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch />
                </Form.Item>
              </CustomCard>

              <div style={{ marginBottom: spacing[4] }}>
                <h4 style={{ color: colors.text.primary, marginBottom: spacing[4], display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  <Globe size={18} style={{ color: colors.primary.solid }} /> Settlement Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6], marginBottom: spacing[4] }}>
                  <Form.Item name="bankName" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Bank Name</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="e.g. HDFC Bank" style={inputStyle} />
                  </Form.Item>
                  <Form.Item name="accountHolderName" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Account Holder</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="Full legal name" style={inputStyle} />
                  </Form.Item>
                </div>
              </div>

              <Form.Item name="accountNumber" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Account Number</span>} rules={[{ required: true }]}>
                <Input size="large" placeholder="0000 0000 0000" style={inputStyle} type="password" />
              </Form.Item>

              <Form.Item name="ifscCode" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>IFSC Code</span>} rules={[{ required: true }]}>
                <Input size="large" placeholder="IFSC0001234" style={inputStyle} />
              </Form.Item>

              <Alert
                message={<span style={{ color: '#fff', fontWeight: 700 }}>Security Protocol Active</span>}
                description={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>Your bank credentials are encrypted with AES-256 and never stored in plain text.</span>}
                type="info"
                showIcon
                icon={<Zap size={18} style={{ color: '#fff' }} />}
                style={{
                  background: colors.primary.solid,
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 4px 12px rgba(18, 104, 255, 0.2)'
                }}
              />
            </Form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em', marginBottom: spacing[2] }}>Neural Configuration</h2>
              <p style={{ color: colors.text.secondary, fontSize: '16px' }}>Calibrate your AI digital twin's persona and core logic.</p>
            </div>

            <Form form={form} layout="vertical" requiredMark={false}>
              <Form.Item name="aiTone" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Communication Tone</span>} rules={[{ required: true }]}>
                <Select size="large" placeholder="Select AI frequency" style={{ ...inputStyle, height: '48px' }}>
                  <Option value="friendly">Friendly & Approachable</Option>
                  <Option value="professional">Professional & Authoritative</Option>
                  <Option value="casual">Casual & Genuine</Option>
                  <Option value="inspiring">Inspiring & High-Energy</Option>
                  <Option value="educational">Educational & Methodical</Option>
                </Select>
              </Form.Item>

              <Form.Item name="aiPersonality" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Personality Core (System Prompt)</span>} rules={[{ required: true }]}>
                <TextArea
                  rows={4}
                  placeholder="Describe your AI persona... (e.g., 'You are a tech expert who explains complex topics with simple metaphors.')"
                  style={{ ...inputStyle, height: 'auto', padding: '12px 16px' }}
                />
              </Form.Item>

              <Form.Item name="welcomeMessage" label={<span style={{ color: colors.gray[600], fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Genesis Message</span>} rules={[{ required: true }]}>
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
                style={{ fontSize: '64px', color: colors.success.solid, marginBottom: spacing[4] }}
              >
                <Rocket size={64} />
              </motion.div>
              <h2 style={{ fontSize: '40px', fontWeight: 900, color: colors.text.primary, letterSpacing: '-0.03em' }}>Genesis Protocol Ready</h2>
              <p style={{ color: colors.text.secondary, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                Your digital twin has been successfully encoded with your knowledge and visual identity.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4], marginBottom: spacing[8] }}>
              {[
                { label: 'Identity', color: '#6366f1', status: 'Established' },
                { label: 'Knowledge', color: '#a855f7', status: 'Ingested' },
                { label: 'Intelligence', color: '#3b82f6', status: 'Calibrated' }
              ].map((item, idx) => (
                <div key={idx} style={{ background: colors.surface, padding: spacing[4], borderRadius: '16px', textAlign: 'center', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
                  <div style={{ color: item.color, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: colors.text.primary, fontWeight: 700 }}>{item.status}</div>
                </div>
              ))}
            </div>

            <Alert
              message="Final Deployment"
              description="Hitting 'Complete' will finalize your ingestion into the network. Your AI twin will be live and ready for interactions."
              type="success"
              showIcon
              style={{ background: colors.success.light, border: `1px solid ${colors.success.light}`, color: colors.success.solid, borderRadius: '16px', textAlign: 'left' }}
            />
          </motion.div>
        );
      default: return null;
    }
  };

  if (processingStatus !== 'none') {
    return (
      <AnimatedBackground>
        <div style={{ width: '100%', maxWidth: '800px', padding: '0 20px' }}>
          <CustomCard depth={3}>
            <OnboardingProcessing
              status={processingStatus === 'completed' ? 'completed' : (processingStatus === 'training' ? 'training' : 'processing')}
              onComplete={() => {
                dispatch(setProfileComplete(true));
                navigate('/creator-dashboard');
              }}
            />
          </CustomCard>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: spacing[10], padding: '60px 20px' }}>
        <CustomCard depth={3} style={{ border: 'none' }}>
          <div style={{ padding: `${spacing[8]} ${spacing[10]}` }}>
            <Steps
              size="small"
              current={current}
              className="flagship-steps"
              style={{ marginBottom: spacing[12] }}
              labelPlacement="vertical"
            >
              {steps.map((item, idx) => (
                <Step
                  key={idx}
                  title={<span style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.title}</span>}
                  icon={item.icon}
                />
              ))}
            </Steps>

            <AnimatePresence mode="wait">
              <div key={current} style={{ minHeight: '520px' }}>
                {renderStepContent() || <div style={{ color: colors.text.primary, textAlign: 'center', padding: '100px' }}>Configuring Protocol...</div>}
              </div>
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${colors.gray[100]}`, paddingTop: spacing[8], marginTop: spacing[6] }}>
              <CustomButton
                variant="secondary"
                disabled={current === 0 || loading}
                onClick={() => setCurrent(current - 1)}
                size="large"
                style={{ borderRadius: '12px', height: '52px', width: '130px', fontWeight: 600 }}
              >
                Back
              </CustomButton>
              {current < steps.length - 1 ? (
                <CustomButton variant="primary" onClick={handleNext} loading={loading} size="large" style={{ width: '240px', height: '52px', borderRadius: '12px', fontSize: '16px' }}>Save & Continue →</CustomButton>
              ) : (
                <CustomButton variant="primary" onClick={handleFinish} loading={loading} size="large" style={{ width: '280px', height: '52px', borderRadius: '12px', fontSize: '16px' }}>Finalize & Launch</CustomButton>
              )}
            </div>
          </div>
        </CustomCard>
      </div>
      <style>{`
        .flagship-steps .ant-steps-item-icon { 
          background: #fcfdfe !important; 
          border-color: ${colors.gray[200]} !important; 
          width: 44px !important; 
          height: 44px !important; 
          line-height: 44px !important; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.text.tertiary} !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .flagship-steps .ant-steps-item-active .ant-steps-item-icon { 
          background: ${colors.primary.gradient} !important; 
          border-color: transparent !important; 
          box-shadow: 0 8px 16px rgba(18, 104, 255, 0.2);
          transform: scale(1.15); 
          color: #fff !important;
        }
        .flagship-steps .ant-steps-item-finish .ant-steps-item-icon {
          background: ${colors.success.subtle} !important;
          border-color: ${colors.success.solid} !important;
          color: ${colors.success.solid} !important;
        }
        .flagship-steps .ant-steps-item-finish .ant-steps-icon {
          color: ${colors.success.solid} !important;
        }
        .flagship-steps .ant-steps-item-active .ant-steps-icon {
          color: #fff !important;
        }
        .flagship-steps .ant-steps-item-title {
          color: ${colors.text.tertiary} !important;
          margin-top: 8px !important;
        }
        .flagship-steps .ant-steps-item-active .ant-steps-item-title {
          color: ${colors.primary.solid} !important;
        }
        .flagship-steps .ant-steps-item-finish .ant-steps-item-title {
          color: ${colors.success.solid} !important;
        }
        .ant-input, .ant-input-affix-wrapper, .ant-input-number, .ant-input-number-input, .ant-select-selector {
          background-color: #ffffff !important;
          border-color: ${colors.gray[200]} !important;
          color: ${colors.text.primary} !important;
        }
        .ant-select-selection-item {
          color: ${colors.text.primary} !important;
          font-weight: 500 !important;
        }
        .ant-select-selection-placeholder {
          color: ${colors.text.tertiary} !important;
        }
        .ant-input:focus, .ant-input-affix-wrapper-focused, .ant-input-number-focused, .ant-select-focused .ant-select-selector {
          border-color: ${colors.primary.solid} !important;
          box-shadow: 0 0 0 4px rgba(18, 104, 255, 0.1) !important;
        }
        .ant-select-dropdown {
          background-color: #ffffff !important;
          border-radius: 12px !important;
          padding: 8px !important;
          box-shadow: ${shadows.lg} !important;
          border: 1px solid ${colors.gray[100]} !important;
        }
        .ant-select-item {
          border-radius: 8px !important;
          margin-bottom: 4px !important;
          padding: 8px 12px !important;
          transition: all 0.2s ease !important;
          color: ${colors.text.primary} !important;
        }
        .ant-select-item-option-active {
          background-color: ${colors.gray[50]} !important;
        }
        .ant-select-item-option-selected {
          background-color: ${colors.primary.subtle} !important;
          color: ${colors.primary.solid} !important;
          font-weight: 600 !important;
        }
        .ant-form-item-label > label {
          color: ${colors.text.secondary} !important;
          font-weight: 600 !important;
          font-size: 13px !important;
        }
        .premium-select .ant-select-selector { 
          border: 1px solid ${colors.gray[200]} !important; 
          border-radius: 10px !important; 
          height: 48px !important;
          display: flex;
          align-items: center;
          background: #fff !important;
        }
        .hover-glow:hover { 
          transform: translateY(-4px); 
          box-shadow: ${shadows.lg} !important; 
          border-color: ${colors.primary.solid} !important; 
        }
      `}</style>
    </AnimatedBackground>
  );
};

export default CreatorOnboardingWizard;
