import React, { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Form, Input, Button, Switch, List, message, Spin, Tag } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { userApi, authApi, notificationApi, getImageUrl } from '../../services/api';
import AvatarUpload from '../../components/upload/AvatarUpload';
import { motion } from 'framer-motion';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';

const { Title, Text } = Typography;

const UserSettings = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('1');
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // Profile State
    const [profile, setProfile] = useState<{ name?: string; avatar?: string; email?: string }>({
        name: user?.name,
        avatar: user?.avatar,
        email: user?.email
    });

    // Interests State
    const [interests, setInterests] = useState<string[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [categories, setCategories] = useState<any[]>([]);
    const [interestsLoading, setInterestsLoading] = useState(false);

    // Notification State
    const [notifSettings, setNotifSettings] = useState({
        emailEnabled: true,
        emailChat: true,
        emailDeals: true,
        emailPayments: true,
        emailModeration: true,
        pushEnabled: false,
        soundEnabled: true
    });

    useEffect(() => {
        const bootstrap = async () => {
            try {
                await Promise.all([fetchProfile(), fetchNotificationSettings()]);
            } finally {
                setPageLoading(false);
            }
        };
        bootstrap();
    }, []);

    useEffect(() => {
        if (profile?.name) {
            profileForm.setFieldsValue({ name: profile.name });
        }
    }, [profile?.name, profileForm]);

    useEffect(() => {
        if (activeTab === '2') fetchInterests();
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const response = await userApi.getProfile();
            const data = response.data.data || {};
            const nextProfile = {
                name: data.name ?? user?.name,
                avatar: data.avatar ?? user?.avatar,
                email: data.email ?? user?.email
            };
            setProfile(nextProfile);
            if (data.name || data.avatar) {
                dispatch(updateUser({ name: data.name, avatar: data.avatar }));
            }
        } catch (err) {
            logger.error('Failed to fetch profile:', err);
            setProfile({
                name: user?.name,
                avatar: user?.avatar,
                email: user?.email
            });
        }
    };

    const fetchNotificationSettings = async () => {
        try {
            const response = await notificationApi.getSettings();
            const settings = response.data.data || {};
            setNotifSettings(prev => ({ ...prev, ...settings }));
        } catch (err) {
            logger.error('Failed to fetch notification settings:', err);
        }
    };

    const fetchInterests = async () => {
        try {
            setInterestsLoading(true);
            const [intRes, catRes] = await Promise.all([
                userApi.getInterests(),
                userApi.getCategories()
            ]);
            setInterests(intRes.data.data.interests || []);
            setCategories(catRes.data.data.categories || []);
        } catch (err) {
            logger.error(err as string);
        } finally {
            setInterestsLoading(false);
        }
    };

    const handleProfileUpdate = async (values: Record<string, string>) => {
        try {
            setLoading(true);
            const payload = {
                name: values.name?.trim(),
                avatar: profile?.avatar
            };
            const response = await userApi.updateProfile(payload);
            const updated = response.data.data || payload;
            setProfile(prev => ({
                ...prev,
                name: updated.name ?? payload.name,
                avatar: updated.avatar ?? payload.avatar
            }));
            dispatch(updateUser({
                name: updated.name ?? payload.name,
                avatar: updated.avatar ?? payload.avatar
            }));
            message.success('Profile updated successfully');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__err) {
            message.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = async (url: string) => {
        try {
            setLoading(true);
            const response = await userApi.updateProfile({ avatar: url });
            const updated = response.data.data || { avatar: url };
            setProfile(prev => ({
                ...prev,
                avatar: updated.avatar ?? url
            }));
            dispatch(updateUser({ avatar: updated.avatar ?? url }));
            message.success('Avatar updated successfully');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__err) {
            message.error('Failed to update avatar');
        } finally {
            setLoading(false);
        }
    };

    const handleInterestsUpdate = async () => {
        try {
            setLoading(true);
            await userApi.updateInterests(interests);
            message.success('Interests updated successfully');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__err) {
            message.error('Failed to update interests');
        } finally {
            setLoading(false);
        }
    };

    const handleNotifUpdate = async (key: string, value: boolean) => {
        const previous = { ...notifSettings };
        try {
            const newSettings = { ...notifSettings, [key]: value };
            setNotifSettings(newSettings);
            await notificationApi.updateSettings(newSettings);
            message.success('Settings updated');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__err) {
            setNotifSettings(previous);
            message.error('Failed to update settings');
        }
    };

    const handlePasswordChange = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        try {
            setLoading(true);
            await authApi.changePassword(values.currentPassword, values.newPassword);
            message.success('Password changed successfully');
            passwordForm.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            message.error(e.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const items = [
        {
            key: '1',
            label: 'Profile',
            children: (
                <div style={{ maxWidth: 600 }}>
                    <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
                        <div style={{ marginBottom: '24px' }}>
                            <AvatarUpload
                                currentAvatar={profile?.avatar ? getImageUrl(profile.avatar) : undefined}
                                userId={user?.id}
                                onUploadSuccess={handleAvatarUpdate}
                                disabled={loading}
                            />
                        </div>
                        <Form.Item label={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Display Name</span>} name="name">
                            <Input size="large" placeholder="Enter your display name" />
                        </Form.Item>
                        <Form.Item label={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Email Address</span>}>
                            <Input size="large" value={profile?.email || user?.email} disabled style={{ color: colors.text.tertiary, fontWeight: 500 }} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            Save Changes
                        </Button>
                    </Form>
                </div>
            )
        },
        {
            key: '2',
            label: 'Interests',
            children: (
                <div>
                    <Text style={{ color: colors.text.tertiary, display: 'block', marginBottom: '24px', fontSize: '15px', fontWeight: 500 }}>
                        Select topics you are interested in to get better recommendations.
                    </Text>
                    {interestsLoading ? <Spin /> : (
                        <>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
                                {categories.map(cat => (
                                    <Tag.CheckableTag
                                        key={cat.value}
                                        checked={interests.includes(cat.value)}
                                        onChange={checked => {
                                            if (checked) setInterests([...interests, cat.value]);
                                            else setInterests(interests.filter(i => i !== cat.value));
                                        }}
                                        style={{
                                            padding: '8px 20px',
                                            fontSize: '14px',
                                            borderRadius: '24px',
                                            border: interests.includes(cat.value) ? 'none' : `1px solid ${colors.gray[200]}`,
                                            fontWeight: 600,
                                            margin: '4px'
                                        }}
                                    >
                                        {cat.label}
                                    </Tag.CheckableTag>
                                ))}
                            </div>
                            <Button type="primary" onClick={handleInterestsUpdate} loading={loading}>
                                Save Interests
                            </Button>
                        </>
                    )}
                </div>
            )
        },
        {
            key: '3',
            label: 'Notifications',
            children: (
                <div style={{ maxWidth: 600 }}>
                    <List itemLayout="horizontal">
                        <List.Item extra={<Switch checked={notifSettings.emailEnabled} onChange={v => handleNotifUpdate('emailEnabled', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Email Notifications</span>}
                                description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>Receive daily summaries and important updates</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailChat} onChange={v => handleNotifUpdate('emailChat', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Chat Messages</span>}
                                description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>Get notified when creators reply</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailDeals} onChange={v => handleNotifUpdate('emailDeals', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Promotions & Deals</span>}
                                description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>Updates on discounts and new features</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailPayments} onChange={v => handleNotifUpdate('emailPayments', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Payments & Billing</span>}
                                description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>Receipts, renewals, and billing alerts</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailModeration} onChange={v => handleNotifUpdate('emailModeration', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Safety & Moderation</span>}
                                description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>Reports and account safety updates</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.pushEnabled} onChange={v => handleNotifUpdate('pushEnabled', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Push Notifications</span>}
                                description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>Instant alerts on your device</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.soundEnabled} onChange={v => handleNotifUpdate('soundEnabled', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Sound Alerts</span>}
                                description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>Play a sound for important events</span>}
                            />
                        </List.Item>
                    </List>
                </div>
            )
        },
        {
            key: '4',
            label: 'Security',
            children: (
                <div style={{ maxWidth: 600 }}>
                    <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
                        <Form.Item
                            label={<span style={{ color: colors.text.primary, fontWeight: 700 }}>Current Password</span>}
                            name="currentPassword"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>
                        <Form.Item
                            label={<span style={{ color: colors.text.primary, fontWeight: 700 }}>New Password</span>}
                            name="newPassword"
                            rules={[{ required: true, message: 'Required' }, { min: 6, message: 'Min 6 chars' }]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Update Password
                        </Button>
                    </Form>
                </div>
            )
        }
    ];

    if (pageLoading) {
        return <DashboardContentLoader />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '32px' }}
        >
            <div style={{ marginBottom: '32px' }}>
                <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</Title>
                <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>Manage your account preferences and security.</Text>
            </div>

            <Card
                bordered={false}
                style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: `1px solid ${colors.gray[100]}`,
                    boxShadow: shadows.md,
                    padding: '24px'
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    tabBarStyle={{ color: colors.text.tertiary, fontWeight: 700 }}
                />
            </Card>

            <style>{`
                .ant-tabs-tab {
                    padding: 12px 16px !important;
                }
                .ant-tabs-tab-btn {
                    color: ${colors.text.tertiary} !important;
                    font-weight: 700 !important;
                    font-size: 15px !important;
                    transition: all 0.3s ease !important;
                }
                .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: ${colors.primary.solid} !important;
                }
                .ant-tabs-ink-bar {
                    background: ${colors.primary.solid} !important;
                    height: 3px !important;
                    border-radius: 3px 3px 0 0 !important;
                }
                .ant-input, .ant-input-password, .ant-input-affix-wrapper {
                    background-color: #ffffff !important;
                    color: ${colors.text.primary} !important;
                    border: 1px solid ${colors.gray[200]} !important;
                    border-radius: 12px !important;
                }
                .ant-input:focus, .ant-input-focused, .ant-input-affix-wrapper-focused {
                    border-color: ${colors.primary.solid} !important;
                    box-shadow: 0 0 0 2px ${colors.primary.subtle} !important;
                }
                .ant-input::placeholder {
                    color: ${colors.text.tertiary} !important;
                    opacity: 0.7;
                }
                .ant-input-disabled {
                    background-color: ${colors.gray[50]} !important;
                    color: ${colors.text.tertiary} !important;
                    border-color: ${colors.gray[100]} !important;
                }
                .ant-input-password input {
                    background-color: transparent !important;
                    color: ${colors.text.primary} !important;
                }
                .ant-form-item-label label {
                    color: ${colors.text.primary} !important;
                }
            `}</style>
        </motion.div>
    );
};

export default UserSettings;
