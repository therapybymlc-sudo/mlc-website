'use client';
import { useState, useEffect } from "react";
import ClientResources from '../../../../../legacy_pages/dashboards/resources/ClientResources';

export default function ResourcesClient() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <ClientResources />;
}
