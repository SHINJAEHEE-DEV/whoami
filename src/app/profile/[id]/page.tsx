'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ListViewer } from '@/components/records/ListViewer';
import { BookViewer } from '@/components/records/BookViewer';
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
  const [viewMode, setViewMode] = useState<'book' | 'list'>('book');

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
        <div className="space-y-10">
          {/* Profile Header */}
          <header className="bg-white rounded-[48px] p-8 border border-brand-border shadow-mongle flex flex-col items-center space-y-6">
            <div className="w-24 h-28 bg-brand-warm rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative">
              <div className="w-24 h-24 flex items-center justify-center">
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
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-brand-primary tracking-tighter">@{profile.username}</h1>
              <div className="flex items-center justify-center space-x-2">
                {relationship === 'mutual' ? (
                  <div className="flex items-center space-x-1.5 px-3.5 py-1 bg-brand-accent/10 border-2 border-brand-accent/20 rounded-full">
                    <span className="text-sm">✨</span>
                    <span className="text-[11px] font-black text-brand-accent tracking-tight">서로 팔로우 중</span>
                  </div>
                ) : relationship === 'following' ? (
                  <div className="px-3.5 py-1 bg-brand-warm border-2 border-brand-border rounded-full">
                    <span className="text-[11px] font-black text-brand-secondary tracking-tight">내가 팔로우 중</span>
                  </div>
                ) : null}
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <button
                onClick={handleFollowToggle}
                disabled={isActionLoading}
                className={`px-10 py-3 rounded-full font-black text-base shadow-lg hover-mongle transition-all disabled:opacity-50 ${
                  relationship === 'none'
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-brand-primary border-2 border-brand-border hover:bg-brand-warm'
                }`}
              >
                {isActionLoading ? '잠시만요...' : relationship === 'none' ? '팔로우하기' : '팔로잉'}
              </button>
            )}
          </header>

          {/* View Toggle */}
          <div className="flex justify-center -mb-2">
            <div className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-brand-border flex shadow-mongle">
              <button 
                onClick={() => setViewMode('book')}
                className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${viewMode === 'book' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
              >
                📖 책으로 보기
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
              >
                📜 목록으로 보기
              </button>
            </div>
          </div>

          {/* Records List */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-brand-primary px-2 flex items-center space-x-2">
              <span>📖</span>
              <span>자서전 기록</span>
              <span className="text-xs font-bold text-brand-secondary ml-1">({records.length})</span>
            </h2>
            
            {records.length > 0 ? (
              viewMode === 'book' ? (
                <BookViewer records={records} />
              ) : (
                <ListViewer records={records} />
              )
            ) : (
              <div className="text-center py-16 bg-white rounded-[32px] border border-brand-border mx-2">
                <p className="text-brand-secondary font-bold">표시할 수 있는 기록이 없습니다.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
