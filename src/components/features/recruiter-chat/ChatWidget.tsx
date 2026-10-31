"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Box, chakra, Flex, HStack, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { LuArrowUp, LuMessageCircle, LuRotateCcw, LuSquare, LuX } from "react-icons/lu";

import { auth } from "@/firebase/firebase";
import { useLangContext } from "@/contexts/LangContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import { fieldStyles } from "@/components/ui/FormField";
import { EASE_OUT } from "@/components/ui/Reveal";

const SUGGESTIONS = ["chat--suggestion-1", "chat--suggestion-2", "chat--suggestion-3"];

const transport = new DefaultChatTransport({ api: "/api/recruiter-chat" });

const Bubble = ({ fromUser, children }: { fromUser: boolean; children: React.ReactNode }) => (
  <Box
    alignSelf={fromUser ? "flex-end" : "flex-start"}
    maxW="85%"
    px="4"
    py="2.5"
    borderRadius="16px"
    borderBottomRightRadius={fromUser ? "4px" : "16px"}
    borderBottomLeftRadius={fromUser ? "16px" : "4px"}
    bg={fromUser ? "lime" : "surface.raised"}
    color={fromUser ? "ink" : "white"}
    fontSize="sm"
    lineHeight="tall"
    whiteSpace="pre-wrap"
  >
    {children}
  </Box>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const { getTranslation } = useLangContext();
  const { logChat } = useRecruiterAccess();

  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    // The server checks the visitor's access with this token before calling the model
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;
    sendMessage({ text: trimmed }, { body: { idToken } });
    // Recorded under the access link, so the admin sees what interests recruiters
    logChat(trimmed);
    setInput("");
  };

  const reset = () => {
    stop();
    setMessages([]);
    clearError();
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <Box asChild position="fixed" bottom={{ base: 4, md: 6 }} right={{ base: 4, md: 6 }} zIndex="1300">
            <motion.button
              type="button"
              aria-label={getTranslation("chat--open")}
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <HStack
                gap="2"
                h="14"
                px={{ base: 4, md: 5 }}
                borderRadius="pill"
                bg="lime"
                color="ink"
                fontWeight="bold"
                boxShadow="0 16px 40px -12px rgba(251, 213, 43, 0.6)"
              >
                <Box fontSize="xl">
                  <LuMessageCircle />
                </Box>
                <Text display={{ base: "none", md: "block" }}>{getTranslation("chat--open")}</Text>
              </HStack>
            </motion.button>
          </Box>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <Box
            asChild
            position="fixed"
            zIndex="1300"
            bottom={{ base: 0, md: 6 }}
            right={{ base: 0, md: 6 }}
            w={{ base: "100vw", md: "400px" }}
            h={{ base: "85dvh", md: "600px" }}
            maxH={{ md: "calc(100dvh - 48px)" }}
            display="flex"
            flexDirection="column"
            bg="surface"
            borderWidth="1px"
            borderColor="line"
            borderRadius={{ base: "20px 20px 0 0", md: "20px" }}
            boxShadow="0 24px 64px -16px rgba(0, 0, 0, 0.9)"
            overflow="hidden"
          >
            <motion.div
              role="dialog"
              aria-label={getTranslation("chat--title")}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              style={{ transformOrigin: "bottom right" }}
            >
              <HStack px="4" py="3" gap="3" borderBottomWidth="1px" borderColor="line">
                <Image src="/assets/images/logo.png" alt="" width={32} height={32} />
                <Box flex="1" minW="0">
                  <Text fontWeight="black" fontSize="sm">
                    {getTranslation("chat--title")}
                  </Text>
                  <Text color="muted" fontSize="xs" truncate>
                    {getTranslation("chat--subtitle")}
                  </Text>
                </Box>
                {messages.length > 0 && (
                  <IconButton aria-label={getTranslation("chat--reset")} title={getTranslation("chat--reset")} variant="plain" size="sm" color="muted" _hover={{ color: "white" }} onClick={reset}>
                    <LuRotateCcw />
                  </IconButton>
                )}
                <IconButton aria-label={getTranslation("chat--close")} variant="plain" size="sm" color="muted" _hover={{ color: "white" }} onClick={() => setOpen(false)}>
                  <LuX />
                </IconButton>
              </HStack>

              <Stack flex="1" overflowY="auto" px="4" py="4" gap="3">
                {messages.length === 0 && (
                  <Stack gap="3">
                    <Bubble fromUser={false}>{getTranslation("chat--welcome")}</Bubble>
                    <Flex gap="2" wrap="wrap" pt="1">
                      {SUGGESTIONS.map((tid) => (
                        <Box
                          key={tid}
                          as="button"
                          px="3"
                          py="1.5"
                          borderRadius="pill"
                          borderWidth="1px"
                          borderColor="line"
                          color="muted"
                          fontSize="xs"
                          textAlign="start"
                          cursor="pointer"
                          _hover={{ borderColor: "lime", color: "white" }}
                          onClick={() => send(getTranslation(tid))}
                        >
                          {getTranslation(tid)}
                        </Box>
                      ))}
                    </Flex>
                  </Stack>
                )}

                {messages.map((message) => (
                  <Bubble key={message.id} fromUser={message.role === "user"}>
                    {message.parts.map((part, i) => (part.type === "text" ? <span key={i}>{part.text}</span> : null))}
                  </Bubble>
                ))}

                {status === "submitted" && (
                  <Bubble fromUser={false}>
                    <HStack gap="1" h="5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                          style={{ width: 6, height: 6, borderRadius: 9999, background: "currentColor" }}
                        />
                      ))}
                    </HStack>
                  </Bubble>
                )}

                {error && (
                  <Text color="rose" fontSize="xs" textAlign="center">
                    {getTranslation("chat--error")}
                  </Text>
                )}
                <div ref={endRef} />
              </Stack>

              <chakra.form
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  send(input);
                }}
                display="flex"
                gap="2"
                p="3"
                borderTopWidth="1px"
                borderColor="line"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  placeholder={getTranslation("chat--placeholder")}
                  maxLength={1000}
                  css={fieldStyles}
                  h="11"
                />
                {busy ? (
                  <IconButton aria-label={getTranslation("chat--stop")} h="11" w="11" borderRadius="12px" bg="surface.raised" color="white" onClick={() => stop()}>
                    <LuSquare />
                  </IconButton>
                ) : (
                  <IconButton type="submit" aria-label={getTranslation("chat--send")} h="11" w="11" borderRadius="12px" bg="lime" color="ink" disabled={!input.trim()}>
                    <LuArrowUp />
                  </IconButton>
                )}
              </chakra.form>
              <Text color="whiteAlpha.400" fontSize="2xs" textAlign="center" pb="2">
                {getTranslation("chat--disclaimer")}
              </Text>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
