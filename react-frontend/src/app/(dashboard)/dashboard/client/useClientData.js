'use client'

import { useState, useEffect } from 'react';
import { apiGet } from '../../../../api.js';

export function useClientData() {
  const [data, setData] = useState({
    goals: [],
    appointments: [],
    journals: [],
    checkins: [],
    resources: [],
    relationships: [],
    loading: true,
  });

  const refreshData = async () => {
    try {
      const [goals, appts, journals, checkins, resources, relations] = await Promise.all([
        apiGet("client-goals/"),
        apiGet("client-appointments/"),
        apiGet("client-journals/"),
        apiGet("client-checkins/"),
        apiGet("client-resource-assignments/"),
        apiGet("therapist-relationships/"),
      ]);

      setData({
        goals: Array.isArray(goals) ? goals : (goals.results || []),
        appointments: Array.isArray(appts) ? appts : (appts.results || []),
        journals: Array.isArray(journals) ? journals : (journals.results || []),
        checkins: Array.isArray(checkins) ? checkins : (checkins.results || []),
        resources: Array.isArray(resources) ? resources : (resources.results || []),
        relationships: Array.isArray(relations) ? relations : (relations.results || []),
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch client data", err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return { ...data, refreshData };
}
