'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Heading,
  HStack,
  List,
  ListItem,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { apiGet } from '../../api.js';

function sessionErrorMessage(error) {
  return error?.response?.data?.detail || error?.message || 'Unable to initialize chat session.';
}

export default function RocketChatEmbeddedClient({ title, description }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiGet('chat/rocket/session/');
        if (!isMounted) return;
        setSession(data);
      } catch (err) {
        if (!isMounted) return;
        setError(sessionErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const iframeUrl = useMemo(() => {
    const base = session?.rocket_chat_url;
    if (!base) return '';
    return `${base.replace(/\/+$/, '')}/home?layout=embedded`;
  }, [session]);

  const targetOrigin = useMemo(() => {
    if (!session?.rocket_chat_url) return '*';
    try {
      return new URL(session.rocket_chat_url).origin;
    } catch {
      return '*';
    }
  }, [session]);

  const loginToken = session?.login_token;
  const handleIframeLoad = () => {
    if (!loginToken || !iframeRef.current?.contentWindow) return;
    const win = iframeRef.current.contentWindow;
    win.postMessage({ event: 'login-with-token', loginToken }, targetOrigin);
    win.postMessage({ externalCommand: 'login-with-token', token: loginToken }, targetOrigin);
  };

  return (
    <VStack align="stretch" spacing={4} maxW="1200px" mx="auto" pb={8}>
      <Box>
        <Heading size="md" color="#2E2E2E">
          {title || 'Secure Messages'}
        </Heading>
        <Text color="gray.600" mt={1}>
          {description ||
            'Rocket.Chat workspace for therapist-client communication. Your login is provisioned automatically from your MLC profile.'}
        </Text>
      </Box>

      {loading ? (
        <HStack bg="white" borderRadius="2xl" p={8} border="1px solid" borderColor="gray.100">
          <Spinner size="sm" />
          <Text color="gray.600">Loading chat session…</Text>
        </HStack>
      ) : null}

      {!loading && error ? (
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          <Box>
            <AlertTitle>Chat is unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      ) : null}

      {!loading && !error && session && !session.enabled ? (
        <Alert status="warning" borderRadius="xl">
          <AlertIcon />
          <Box>
            <AlertTitle>Rocket.Chat is not configured</AlertTitle>
            <AlertDescription>
              Set backend env vars: `ROCKET_CHAT_URL`, `ROCKET_CHAT_ADMIN_USER_ID`, and `ROCKET_CHAT_ADMIN_AUTH_TOKEN`.
            </AlertDescription>
          </Box>
        </Alert>
      ) : null}

      {!loading && !error && session?.enabled ? (
        <>
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="teal" px={3} py={1} borderRadius="full">
              Signed in as {session?.current_user?.username}
            </Badge>
            <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
              {session?.peers?.length || 0} connected {session?.role === 'therapist' ? 'clients' : 'therapists'}
            </Badge>
          </HStack>

          {Array.isArray(session?.peers) && session.peers.length > 0 ? (
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
              <Text fontWeight="600" fontSize="sm" color="gray.700" mb={2}>
                Active relationships in chat
              </Text>
              <List spacing={1}>
                {session.peers.map((peer) => (
                  <ListItem key={`${peer.relationship_id}-${peer.peer_id}`} fontSize="sm" color="gray.600">
                    • {peer.peer_name} ({peer.peer_role})
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Alert status="info" borderRadius="xl">
              <AlertIcon />
              <AlertDescription>
                No active therapist-client relationships found. Chat rooms appear once an active relationship exists.
              </AlertDescription>
            </Alert>
          )}

          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
            minH={{ base: '600px', md: '760px' }}
          >
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              onLoad={handleIframeLoad}
              title="MLC Rocket.Chat"
              style={{ border: 'none', width: '100%', height: '760px', minHeight: '70vh' }}
              allow="clipboard-read; clipboard-write"
            />
          </Box>
        </>
      ) : null}
    </VStack>
  );
}
