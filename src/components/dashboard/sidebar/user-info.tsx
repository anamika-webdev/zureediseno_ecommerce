"use client";

import { useState, useEffect } from 'react';

// Define proper User type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned?: boolean;
  locked?: boolean;
  privateMetadata?: any;
  lastActiveAt?: string;
  [key: string]: any; // Allow additional properties
}

interface UserInfoProps {
  userId?: string;
  className?: string;
}

export default function UserInfo({ userId, className = '' }: UserInfoProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`text-gray-500 ${className}`}>Loading user...</div>;
  }

  if (!user) {
    return <div className={`text-gray-500 ${className}`}>User not found</div>;
  }

  return (
    <div className={`${className}`}>
      <div className="text-sm font-medium">{user.name}</div>
      <div className="text-xs text-gray-500">{user.email}</div>
      {user.role && (
        <div className="text-xs text-blue-600">{user.role}</div>
      )}
    </div>
  );
}