"use client";

import { useState } from "react";
import { Box, Flex, HStack, IconButton, Input, Stack, Tabs, Text } from "@chakra-ui/react";
import { LuChevronDown, LuCopy, LuEye, LuMessageCircle, LuPlus } from "react-icons/lu";

import { AccessRequest, AccessSettings, AccessStatus, randomToken } from "@/firebase/store/access";
import {
  useAccessEvents,
  useAccessRequests,
  useAccessSettings,
  useSaveAccessSettings,
  useSetRequestStatus,
  useTraffic,
} from "@/hooks/queries/access";
import { changeVaultCode } from "@/firebase/store/project";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import Pill from "@/components/ui/Pill";
import { fieldStyles } from "@/components/ui/FormField";
import { toast } from "@/components/ui/Toaster";

const formatDate = (date: Date | null) =>
  date ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

const EVENT_ICON = { visit: LuEye, chat: LuMessageCircle };
const EVENT_LABEL = { visit: "Visit", chat: "Chat" };

const STATUS_STYLE: Record<AccessStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "lime" },
  approved: { label: "Approved", color: "white" },
  refused: { label: "Refused", color: "rose" },
};

// Suggested channels, on top of the ones already configured
const DEFAULT_CHANNELS = ["linkedin", "github", "discord", "cv", "email", "malt", "wttj", "indeed", "x"];

const trackingLink = (channel: string) => `${window.location.origin}/?ref=${encodeURIComponent(channel)}`;

// One request and, on demand, the recruiter's activity
const RequestRow = ({ request }: { request: AccessRequest }) => {
  const [open, setOpen] = useState(false);
  // Activity is only fetched once the row is expanded
  const { data: events, isError } = useAccessEvents(request.uid, open);
  const updateStatus = useSetRequestStatus();

  const setStatus = (status: AccessStatus) =>
    updateStatus.mutate(
      { uid: request.uid, status },
      { onSuccess: () => toast.success(status === "approved" ? "Access granted" : "Access refused") }
    );

  const style = STATUS_STYLE[request.status];
  const who = [request.name, request.company].filter(Boolean).join(" · ");

  return (
    <Box borderWidth="1px" borderColor="line" borderRadius="12px">
      <Flex align="center" gap="3" p="3" wrap="wrap">
        <Box flex="1" minW="200px">
          <Text fontWeight="bold" truncate>
            {who || request.email}
          </Text>
          <Text color="muted" fontSize="xs" truncate>
            {who ? `${request.email} · ` : ""}
            {request.ref ? `via ${request.ref}` : "no channel"} · {formatDate(request.createdAt)}
          </Text>
        </Box>
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.1em" style={{ color: `var(--chakra-colors-${style.color})` }}>
          {style.label}
        </Text>
        {request.status !== "approved" && (
          <Button h="8" px="3" fontSize="xs" onClick={() => setStatus("approved")}>
            Approve
          </Button>
        )}
        {request.status !== "refused" && (
          <Button variant="ghost" h="8" px="3" fontSize="xs" onClick={() => setStatus("refused")}>
            {request.status === "approved" ? "Revoke" : "Refuse"}
          </Button>
        )}
        <IconButton aria-label="Activity" variant="plain" size="sm" color="muted" onClick={() => setOpen(!open)} transform={open ? "rotate(180deg)" : undefined}>
          <LuChevronDown />
        </IconButton>
      </Flex>

      {open && (
        <Box borderTopWidth="1px" borderColor="line" p="3">
          {!events && !isError ? (
            <Loader py="4" />
          ) : !events?.length ? (
            <Text color="muted" fontSize="sm">
              No activity yet.
            </Text>
          ) : (
            <Stack gap="2">
              {events.map((event) => {
                const Icon = EVENT_ICON[event.type];
                return (
                  <HStack key={event.id} gap="3" align="flex-start" fontSize="sm">
                    <Box color="lime" pt="0.5">
                      <Icon />
                    </Box>
                    <Box flex="1" minW="0">
                      <Text>
                        {EVENT_LABEL[event.type]}
                        <Text as="span" color="muted" fontSize="xs">
                          {" "}
                          · {formatDate(event.at)}
                        </Text>
                      </Text>
                      {event.text && (
                        <Text color="muted" fontSize="xs">
                          « {event.text} »
                        </Text>
                      )}
                    </Box>
                  </HStack>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

const RequestsTab = () => {
  const { data: requests, isError } = useAccessRequests();

  if (!requests && !isError) return <Loader py="6" />;

  return (
    <Stack gap="3">
      <Text color="muted" fontSize="sm">
        Recruiters ask for access with a verified e-mail. You get an e-mail for each new request.
      </Text>
      {!requests?.length ? (
        <Text color="muted" fontSize="sm">
          No request yet.
        </Text>
      ) : (
        requests.map((request) => <RequestRow key={request.uid} request={request} />)
      )}
    </Stack>
  );
};

type Policy = "auto" | "manual" | "blocked";

const ChannelsTab = () => {
  const { data, isError } = useAccessSettings();
  if (!data && !isError) return <Loader py="6" />;
  return <ChannelsForm initial={data ?? { autoApprove: [], blocked: [] }} />;
};

// Mounted once the settings are loaded, so the choices start from them
const ChannelsForm = ({ initial }: { initial: AccessSettings }) => {
  const [settings, setSettings] = useState(initial);
  const [extra, setExtra] = useState<string[]>([]);
  const [newChannel, setNewChannel] = useState("");
  const saveSettings = useSaveAccessSettings();

  const channels = [...new Set([...DEFAULT_CHANNELS, ...settings.autoApprove, ...settings.blocked, ...extra])];
  const policy = (channel: string): Policy =>
    settings.blocked.includes(channel) ? "blocked" : settings.autoApprove.includes(channel) ? "auto" : "manual";

  const setPolicy = (channel: string, value: Policy) => {
    const without = (list: string[]) => list.filter((c) => c !== channel);
    setSettings({
      autoApprove: value === "auto" ? [...without(settings.autoApprove), channel] : without(settings.autoApprove),
      blocked: value === "blocked" ? [...without(settings.blocked), channel] : without(settings.blocked),
    });
  };

  const addChannel = () => {
    const slug = newChannel.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (slug) setExtra([...extra, slug]);
    setNewChannel("");
  };

  const save = () => saveSettings.mutate(settings, { onSuccess: () => toast.success("Channels saved") });

  return (
    <Stack gap="4">
      <Text color="muted" fontSize="sm">
        <b>Immediate</b>: verified e-mail = access. <b>Manual</b>: waits for your approval (also for visitors with
        no channel). <b>Hidden</b>: the access request is not even shown.
      </Text>
      <Stack gap="2">
        {channels.map((channel) => (
          <Flex key={channel} align="center" gap="3" wrap="wrap" py="1">
            <Box flex="1" minW="160px">
              <Text fontWeight="bold">{channel}</Text>
              <HStack gap="1" color="muted" fontSize="xs">
                <Text fontFamily="mono">?ref={channel}</Text>
                <IconButton
                  aria-label="Copy link"
                  size="2xs"
                  variant="plain"
                  color="muted"
                  _hover={{ color: "lime" }}
                  onClick={() => {
                    navigator.clipboard.writeText(trackingLink(channel));
                    toast.success("Link copied");
                  }}
                >
                  <LuCopy />
                </IconButton>
              </HStack>
            </Box>
            <HStack gap="1.5">
              {(["auto", "manual", "blocked"] as Policy[]).map((value) => (
                <Pill
                  key={value}
                  active={policy(channel) === value}
                  onClick={() => setPolicy(channel, value)}
                  fontSize="xs"
                  px="3"
                  py="1"
                >
                  {value === "auto" ? "Immediate" : value === "manual" ? "Manual" : "Hidden"}
                </Pill>
              ))}
            </HStack>
          </Flex>
        ))}
      </Stack>
      <Flex gap="2">
        <Input
          placeholder="Another channel (e.g. school)"
          value={newChannel}
          onChange={(e) => setNewChannel(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addChannel();
            }
          }}
          css={fieldStyles}
        />
        <Button variant="outline" h="10" px="3" aria-label="Add channel" onClick={addChannel}>
          <LuPlus />
        </Button>
      </Flex>
      <Box>
        <Button loading={saveSettings.isPending} onClick={save}>
          Save
        </Button>
      </Box>
    </Stack>
  );
};

const TrafficTab = () => {
  const { data: events = [], isPending } = useTraffic(30);

  if (isPending) return <Loader py="6" />;

  const bySource = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.source]: (acc[e.source] ?? 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1]);
  const max = bySource[0]?.[1] ?? 1;

  return (
    <Stack gap="4">
      <Text color="muted" fontSize="sm">
        {events.length} visit(s) in the last 30 days, one per browser session: ?ref= or utm_source, otherwise the
        referring site, otherwise « direct ».
      </Text>
      {bySource.length === 0 ? (
        <Text color="muted" fontSize="sm">
          No visit recorded yet.
        </Text>
      ) : (
        <Stack gap="2">
          {bySource.map(([source, count]) => (
            <Box key={source}>
              <Flex justify="space-between" fontSize="sm" mb="1">
                <Text>{source}</Text>
                <Text color="muted">{count}</Text>
              </Flex>
              <Box h="1.5" borderRadius="pill" bg="surface.raised" overflow="hidden">
                <Box h="full" w={`${(count / max) * 100}%`} bg="lime" borderRadius="pill" />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const VaultTab = ({ vaultCode, onChanged }: { vaultCode: string | null; onChanged: (code: string) => void }) => {
  const [loading, setLoading] = useState(false);

  const create = async () => {
    setLoading(true);
    try {
      const code = randomToken();
      await changeVaultCode(code, vaultCode);
      onChanged(code);
      toast.success("Private space ready");
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <Stack gap="4">
      <Text color="muted" fontSize="sm">
        Company names, real project names, links, images and assistant notes are stored in a private space that
        only you and approved recruiters can read.
      </Text>
      {vaultCode ? (
        <Text fontSize="sm">✓ The private space is ready.</Text>
      ) : (
        <Box>
          <Button loading={loading} onClick={create}>
            Create the private space
          </Button>
        </Box>
      )}
    </Stack>
  );
};

// Admin: access requests, channel policies, visit sources, private space
const AccessDashboardModal = ({
  vaultCode,
  onVaultChanged,
  onClose,
}: {
  vaultCode: string | null;
  onVaultChanged: (code: string) => void;
  onClose: () => void;
}) => (
  <Modal title="Access & tracking" onClose={onClose} size="lg">
    <Tabs.Root defaultValue={vaultCode ? "requests" : "vault"} variant="line" colorPalette="yellow">
      <Tabs.List>
        <Tabs.Trigger value="requests">Requests</Tabs.Trigger>
        <Tabs.Trigger value="channels">Channels</Tabs.Trigger>
        <Tabs.Trigger value="traffic">Sources</Tabs.Trigger>
        <Tabs.Trigger value="vault">Private space</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="requests">
        <RequestsTab />
      </Tabs.Content>
      <Tabs.Content value="channels">
        <ChannelsTab />
      </Tabs.Content>
      <Tabs.Content value="traffic">
        <TrafficTab />
      </Tabs.Content>
      <Tabs.Content value="vault">
        <VaultTab vaultCode={vaultCode} onChanged={onVaultChanged} />
      </Tabs.Content>
    </Tabs.Root>
  </Modal>
);

export default AccessDashboardModal;
