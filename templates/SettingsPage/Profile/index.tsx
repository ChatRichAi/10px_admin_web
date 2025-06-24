"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Field from "@/components/Field";
import Image from "@/components/Image";
import Details from "../Details";
import { useUserProfile } from "@/hooks/useUserProfile";

type ProfileProps = {};

const Profile = ({}: ProfileProps) => {
    const { data: session } = useSession();
    const { profile, isLoading, isSaving, error, updateProfile, clearError } = useUserProfile();
    const [success, setSuccess] = useState<string | null>(null);

    // 表单状态
    const [displayName, setDisplayName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [website, setWebsite] = useState("");
    const [twitter, setTwitter] = useState("");
    const [avatar, setAvatar] = useState("");

    // 当profile数据更新时，填充表单
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.name || "");
            setFullName(profile.name || "");
            setEmail(profile.email || "");
            setLocation(profile.location || "");
            setBio(profile.bio || "");
            setWebsite(profile.website || "");
            setTwitter(profile.twitter || "");
            setAvatar(profile.image || "/images/avatar.jpg");
        }
    }, [profile]);

    // 保存用户信息
    const saveProfile = async () => {
        if (!displayName.trim()) {
            return;
        }

        const result = await updateProfile({
            name: displayName.trim(),
            image: avatar === "/images/avatar.jpg" ? null : avatar,
            location: location.trim(),
            bio: bio.trim(),
            website: website.trim(),
            twitter: twitter.trim(),
        });

        if (result.success) {
            setSuccess(result.message || '保存成功！');
            // 3秒后清除成功消息
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        }
    };

    if (isLoading) {
        return (
            <Details title="个人资料" image="/images/profile-main.png">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-theme-secondary">加载中...</p>
                    </div>
                </div>
            </Details>
        );
    }

    return (
        <Details title="个人资料" image="/images/profile-main.png">
            <div className="space-y-6">
                {/* 错误和成功消息 */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button 
                            onClick={clearError}
                            className="mt-2 text-xs text-red-500 underline"
                        >
                            关闭
                        </button>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm">{success}</p>
                    </div>
                )}

                <div className="">
                    <div className="mb-1 text-base-2">你好，{displayName || '用户'}</div>
                    <div className="mb-3 text-body-2s text-theme-secondary">
                        管理您的个人资料信息
                    </div>
                    <div className="flex items-center">
                        <div className="shrink-0 mr-5">
                            <Image
                                className="w-20 h-20 rounded-full object-cover"
                                src={avatar}
                                width={80}
                                height={80}
                                alt="头像"
                                onError={() => setAvatar("/images/avatar.jpg")}
                            />
                        </div>
                        <button 
                            className="btn-gray shrink-0 mr-12"
                            onClick={() => {
                                // TODO: 实现头像上传功能
                                alert('头像上传功能开发中...');
                            }}
                        >
                            更换头像
                        </button>
                        <div className="max-w-[calc(50%-0.75rem)] ml-auto text-caption-2m text-theme-tertiary md:hidden">
                            点击下方图像更新您的头像。
                            建议使用 288x288 像素的 PNG 或 JPG 格式图片。
                        </div>
                    </div>
                </div>

                <div className="flex space-x-6 md:block md:space-x-0 md:space-y-6">
                    <Field
                        className="flex-1"
                        label="显示名称"
                        placeholder="请输入显示名称"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                    />
                    <Field
                        className="flex-1"
                        label="全名"
                        placeholder="请输入全名"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="flex space-x-6 md:block md:space-x-0 md:space-y-6">
                    <Field
                        className="flex-1"
                        label="邮箱地址"
                        placeholder="邮箱地址"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled
                    />
                    <Field
                        className="flex-1"
                        label="位置"
                        placeholder="请输入位置"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <Field
                    label="个人简介"
                    placeholder="简单介绍一下您自己"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    textarea
                />

                <div className="flex space-x-6 md:block md:space-x-0 md:space-y-6">
                    <Field
                        className="flex-1"
                        label="个人网站"
                        placeholder="请输入网站地址"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                    <Field
                        className="flex-1"
                        label="Twitter"
                        placeholder="请输入 Twitter 用户名"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                    />
                </div>

                {/* 账号信息显示 */}
                <div className="pt-6 border-t border-theme-stroke">
                    <h4 className="mb-4 text-base-2">账号信息</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-theme-secondary">注册邮箱:</span>
                            <p className="mt-1 text-theme-primary">{profile?.email}</p>
                        </div>
                        <div>
                            <span className="text-theme-secondary">订阅计划:</span>
                            <p className="mt-1 text-theme-primary">
                                {profile?.subscription?.plan === 'pro' ? '专业版' : 
                                 profile?.subscription?.plan === 'standard' ? '标准版' : '免费版'}
                            </p>
                        </div>
                        <div>
                            <span className="text-theme-secondary">账号状态:</span>
                            <p className="mt-1 text-theme-primary">
                                {profile?.subscription?.status === 'active' ? '已激活' : '未激活'}
                            </p>
                        </div>
                        <div>
                            <span className="text-theme-secondary">注册时间:</span>
                            <p className="mt-1 text-theme-primary">
                                {profile?.createdAt ? 
                                    new Date(profile.createdAt).toLocaleDateString('zh-CN') : 
                                    '未知'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 mt-6">
                <button 
                    className="btn-secondary flex-1 md:w-full" 
                    onClick={saveProfile}
                    disabled={isSaving || !displayName.trim()}
                >
                    {isSaving ? '保存中...' : '保存更改'}
                </button>
                <button 
                    className="btn-stroke flex-1 md:w-full" 
                    onClick={() => window.location.reload()}
                    disabled={isSaving}
                >
                    刷新页面
                </button>
            </div>
        </Details>
    );
};

export default Profile;
