"use client";

import { useState } from "react";
import { Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { LuPlus, LuRefreshCcw } from "react-icons/lu";

import useIsAdmin from "@/hooks/useIsAdmin";
import { useLangContext } from "@/contexts/LangContext";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Pill from "@/components/ui/Pill";
import Loader from "@/components/ui/Loader";
import Reveal, { RevealGroup, RevealItem } from "@/components/ui/Reveal";

type CollectionSectionProps<T> = {
  id: string;
  title: string;
  description?: string;
  emptyText: string;

  filters: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;

  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  // When set, the first item gets this full-width treatment above the grid
  renderFeatured?: (item: T) => React.ReactNode;
  columns?: Record<string, number>;

  loading: boolean;
  onRefresh: () => void;
  // Extra controls shown before the filters (e.g. a second filter dimension)
  toolbar?: React.ReactNode;
  // Extra admin-only buttons next to "Add"
  adminActions?: React.ReactNode;
  // Rendered under the cards (and instead of the empty message)
  after?: React.ReactNode;
  // Changing it replays the entrance of the cards (defaults to the selected filter)
  viewKey?: string;
  // Admin-only creation dialog, mounted while open
  renderAddModal?: (close: () => void) => React.ReactNode;
};

// Titled, filterable grid of cards loaded from Firestore (portfolio, blog)
export const CollectionSection = <T,>({
  id,
  title,
  description,
  emptyText,
  filters,
  selectedFilter,
  onFilterChange,
  items,
  getKey,
  renderItem,
  renderFeatured,
  columns = { base: 1, md: 2 },
  loading,
  onRefresh,
  renderAddModal,
  toolbar,
  adminActions,
  after,
  viewKey = selectedFilter,
}: CollectionSectionProps<T>) => {
  const [adding, setAdding] = useState(false);
  const isAdmin = useIsAdmin();
  const { getTranslation } = useLangContext();

  const featured = renderFeatured ? items[0] : undefined;
  const gridItems = renderFeatured ? items.slice(1) : items;
  const gridColumns = Object.fromEntries(
    Object.entries(columns).map(([bp, n]) => [bp, `repeat(${n}, minmax(0, 1fr))`])
  );

  const iconStyle = { variant: "plain", color: "muted", _hover: { color: "lime" } } as const;

  return (
    <Section id={id}>
      {adding && renderAddModal?.(() => setAdding(false))}
      <SectionHeader
        title={title}
        description={description}
        actions={
          <HStack gap="1">
            <IconButton aria-label="Refresh" {...iconStyle} onClick={onRefresh}>
              <LuRefreshCcw />
            </IconButton>
            {isAdmin && renderAddModal && (
              <Button variant="outline" h="9" px="4" fontSize="sm" onClick={() => setAdding(true)}>
                <LuPlus />
                {getTranslation("collection--add")}
              </Button>
            )}
            {isAdmin && adminActions}
          </HStack>
        }
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          {(filters.length > 0 || toolbar) && (
            <Reveal>
              <Flex gap="2" wrap="wrap" align="center" mb={{ base: 8, md: 10 }}>
                {toolbar}
                {filters.map((name) => (
                  <Pill
                    key={name}
                    active={selectedFilter === name}
                    activeLayoutId={`${id}-filter`}
                    onClick={() => onFilterChange(selectedFilter === name ? "" : name)}
                  >
                    {name.replace(/_/g, " ")}
                  </Pill>
                ))}
              </Flex>
            </Reveal>
          )}
          {items.length === 0 ? (
            !after && <Text color="muted">{emptyText}</Text>
          ) : (
            <>
              {featured !== undefined && renderFeatured && (
                <Reveal key={`featured-${viewKey}`} mb={{ base: 6, xl: 8 }} amount={0.15}>
                  {renderFeatured(featured)}
                </Reveal>
              )}
              <RevealGroup
                key={viewKey}
                stagger={0.1}
                amount={0.05}
                element="ul"
                display="grid"
                gridTemplateColumns={gridColumns}
                gap={{ base: 6, xl: 8 }}
                listStyleType="none"
              >
                {gridItems.map((item) => (
                  <RevealItem key={getKey(item)} element="li">
                    {renderItem(item)}
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
          {after}
        </>
      )}
    </Section>
  );
};

export default CollectionSection;
