import React, { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Form, Input, Button, Switch, List, message, Spin, Tag } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { userApi, authApi, notificationApi, getImageUrl } from '../../services/api';
import AvatarUpload from '../../components/upload/AvatarUpload';
import { motion } from 'framer-motion';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';

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
            console.error('Failed to fetch profile:', err);
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
            console.error('Failed to fetch notification settings:', err);
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
            console.error(err);
        } finally {
            setInterestsLoading(false);
        }
    };

    const handleProfileUpdate = async (values: any) => {
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
        } catch (err) {
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
        } catch (err) {
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
        } catch (err) {
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
        } catch (err) {
            setNotifSettings(previous);
            message.error('Failed to update settings');
        }
    };

    const handlePasswordChange = async (values: any) => {
        try {
            setLoading(true);
            await authApi.changePassword(values.currentPassword, values.newPassword);
            message.success('Password changed successfully');
            passwordForm.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Failed to change password');
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
                        <Form.Item label={<span style={{ color: '#fff' }}>Display Name</span>} name="name">
                            <Input size="large" />
                        </Form.Item>
                        <Form.Item label={<span style={{ color: '#fff' }}>Email</span>}>
                            <Input size="large" value={profile?.email || user?.email} disabled style={{ color: '#94A3B8' }} />
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
                    <Text style={{ color: '#94A3B8', display: 'block', marginBottom: '24px' }}>
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
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            borderRadius: '20px',
                                            border: interests.includes(cat.value) ? 'none' : '1px solid rgba(255,255,255,0.2)'
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
                                title={<span style={{ color: '#fff' }}>Email Notifications</span>}
                                description={<span style={{ color: '#94A3B8' }}>Receive daily summaries and important updates</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailChat} onChange={v => handleNotifUpdate('emailChat', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: '#fff' }}>Chat Messages</span>}
                                description={<span style={{ color: '#94A3B8' }}>Get notified when creators reply</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailDeals} onChange={v => handleNotifUpdate('emailDeals', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: '#fff' }}>Promotions & Deals</span>}
                                description={<span style={{ color: '#94A3B8' }}>Updates on discounts and new features</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailPayments} onChange={v => handleNotifUpdate('emailPayments', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: '#fff' }}>Payments & Billing</span>}
                                description={<span style={{ color: '#94A3B8' }}>Receipts, renewals, and billing alerts</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.emailModeration} onChange={v => handleNotifUpdate('emailModeration', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: '#fff' }}>Safety & Moderation</span>}
                                description={<span style={{ color: '#94A3B8' }}>Reports and account safety updates</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.pushEnabled} onChange={v => handleNotifUpdate('pushEnabled', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: '#fff' }}>Push Notifications</span>}
                                description={<span style={{ color: '#94A3B8' }}>Instant alerts on your device</span>}
                            />
                        </List.Item>
                        <List.Item extra={<Switch checked={notifSettings.soundEnabled} onChange={v => handleNotifUpdate('soundEnabled', v)} />}>
                            <List.Item.Meta
                                title={<span style={{ color: '#fff' }}>Sound Alerts</span>}
                                description={<span style={{ color: '#94A3B8' }}>Play a sound for important events</span>}
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
                            label={<span style={{ color: '#fff' }}>Current Password</span>}
                            name="currentPassword"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>
                        <Form.Item
                            label={<span style={{ color: '#fff' }}>New Password</span>}
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
                <Title level={2} style={{ color: '#fff', marginBottom: '4px', fontWeight: 800 }}>Settings</Title>
                <Text style={{ color: '#94A3B8', fontSize: '16px' }}>Manage your account preferences and security.</Text>
            </div>

            <Card
                style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '24px'
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    tabBarStyle={{ color: '#94A3B8' }}
                />
            </Card>
        </motion.div>
    );
};

export default UserSettings;
