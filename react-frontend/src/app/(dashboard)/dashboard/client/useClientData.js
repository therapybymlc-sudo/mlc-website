'use client'

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../../api.js';
import { useAuth } from '../../../../context/AuthContext';

export function useClientData() {
  const { loading: authLoading, isAuthenticated, isClient, clientProfile } = useAuth();
  const [data, setData] = useState({
    goals: [],
    appointments: [],
    journals: [],
    checkins: [],
    resources: [],
    relationships: [],
    loading: true,
  });

  const refreshData = useCallback(async () => {
    if (!isAuthenticated || !isClient || !clientProfile) {
      if (!authLoading) setData(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      const [goals, appts, journals, checkins, resources, relations] = await Promise.all([
        apiGet("client-goals/").catch(() => []),
        apiGet("client-appointments/").catch(() => []),
        apiGet("client-journals/").catch(() => []),
        apiGet("client-checkins/").catch(() => []),
        apiGet("client-resource-assignments/").catch(() => []),
        apiGet("therapist-relationships/").catch(() => []),
      ]);

      setData({
        goals: Array.isArray(goals) ? goals : (goals?.results || []),
        appointments: Array.isArray(appts) ? appts : (appts?.results || []),
        journals: Array.isArray(journals) ? journals : (journals?.results || []),
        checkins: Array.isArray(checkins) ? checkins : (checkins?.results || []),
        resources: Array.isArray(resources) ? resources : (resources?.results || []),
        relationships: Array.isArray(relations) ? relations : (relations?.results || []),
        loading: false,
      });
    } catch (err) {
      console.warn("Client data partial load", err);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [isAuthenticated, isClient, clientProfile, authLoading]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isClient && clientProfile) {
      refreshData();
    } else if (!authLoading) {
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [authLoading, isAuthenticated, isClient, clientProfile, refreshData]);

  return { ...data, refreshData };
}
