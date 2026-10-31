import { Box, HStack, Text } from "@chakra-ui/react";

import { skillsByName } from "@/data/skills";

// A project's technologies, as the same icons as the Skills section
const StackIcons = ({ stack, max = 8, size = "lg" }: { stack?: string[]; max?: number; size?: "md" | "lg" | "xl" }) => {
  const skills = (stack ?? []).map((name) => skillsByName.get(name)).filter((s) => s?.icon);
  if (skills.length === 0) return null;

  const hidden = skills.length - max;

  return (
    <HStack gap="2.5" wrap="wrap" color="muted" fontSize={size}>
      {skills.slice(0, max).map((skill) => {
        const Icon = skill!.icon!;
        return (
          <Box
            key={skill!.name}
            as="span"
            role="img"
            aria-label={skill!.name}
            title={skill!.name}
            display="inline-flex"
            transition="color 0.2s ease, transform 0.2s ease"
            _hover={{ color: "lime", transform: "translateY(-2px)" }}
          >
            <Icon />
          </Box>
        );
      })}
      {hidden > 0 && (
        <Text as="span" fontSize="xs" fontWeight="bold">
          +{hidden}
        </Text>
      )}
    </HStack>
  );
};

export default StackIcons;
