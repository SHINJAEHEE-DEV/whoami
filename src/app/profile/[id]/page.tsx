'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ListViewer } from '@/components/records/ListViewer';
import { memberService, Profile } from '@/services/memberService';
import { recordService, Record } from '@/services/recordService';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [relationship, setRelationship] = useState<'none' | 'following' | 'mutual'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const targetProfile = await memberService.getProfileById(id);
        if (!targetProfile) {
          setIsLoading(false);
          return;
        }
        setProfile(targetProfile);

        const [userRecords, relStatus] = await Promise.all([
          recordService.getUserRecords(id),
          memberService.checkRelationship(id)
        ]);

        setRecords(userRecords);
        setRelationship(relStatus);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile || !currentUser) return;
    
    setIsActionLoading(true);
    try {
      if (relationship === 'none') {
        await memberService.followUser(profile.id);
      } else {
        await memberService.unfollowUser(profile.id);
      }
      
      // Update relationship status after action
      const newStatus = await memberService.checkRelationship(profile.id);
      setRelationship(newStatus);
      
      // Refresh records as following might grant more access
      const updatedRecords = await recordService.getUserRecords(profile.id);
      setRecords(updatedRecords);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-warm pb-20">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-brand-warm pb-20">
        <Navbar />
        <div className="max-w-4xl mx-auto py-20 px-4 text-center">
          <h1 className="text-2xl font-bold text-brand-primary">사용자를 찾을 수 없습니다.</h1>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-brand-accent font-bold"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-brand-warm pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-12">
          {/* Profile Header */}
          <header className="bg-white rounded-[40px] p-8 border border-brand-border shadow-sm flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-brand-warm rounded-full flex items-center justify-center border-2 border-brand-border overflow-hidden relative">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-brand-secondary">
                  {profile.username[0].toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-brand-primary">@{profile.username}</h1>
              <div className="flex items-center justify-center space-x-2">
                {relationship !== 'none' && (
                  <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-full">
                    {relationship === 'mutual' ? '서로 팔로우 중' : '팔로잉'}
                  </span>
                )}
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <button
                onClick={handleFollowToggle}
                disabled={isActionLoading}
                className={`px-12 py-3 rounded-2xl font-black transition-all transform active:scale-95 disabled:opacity-50 ${
                  relationship === 'none'
                    ? 'bg-brand-primary text-white hover:bg-opacity-90'
                    : 'bg-brand-warm text-brand-primary border border-brand-border hover:bg-brand-border'
                }`}
              >
                {isActionLoading ? '처리 중...' : relationship === 'none' ? '팔로우' : '팔로잉'}
              </button>
            )}
          </header>

          {/* Records List */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-brand-primary px-4 flex items-center space-x-2">
              <span>📖</span>
              <span>자서전 기록</span>
              <span className="text-sm font-bold text-brand-secondary ml-2">({records.length})</span>
            </h2>
            
            {records.length > 0 ? (
              <ListViewer records={records} />
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] border border-brand-border mx-4">
                <p className="text-brand-secondary font-bold">표시할 수 있는 기록이 없습니다.</p>
                {relationship === 'none' && !isOwnProfile && (
                  <p className="text-sm text-brand-secondary mt-2">팔로우하면 더 많은 기록을 볼 수 있을지도 몰라요!</p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
