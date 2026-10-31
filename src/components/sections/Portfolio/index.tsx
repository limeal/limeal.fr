"use client";

import { useEffect, useState } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { LuBot, LuBarChart3, LuUnlock, LuX } from "react-icons/lu";

import Project from "@/interfaces/project";
import { getProjects } from "@/firebase/store/project";
import { byMostRecent } from "@/utils/project";
import { useLangContext } from "@/contexts/LangContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import { toast } from "@/components/ui/Toaster";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import CollectionSection from "@/components/features/collection/CollectionSection";
import ProjectCard from "@/components/features/portfolio/ProjectCard";
import ProjectFormModal from "@/components/features/portfolio/ProjectFormModal";
import AccessDashboardModal from "@/components/features/portfolio/AccessDashboardModal";
import AssistantNotesModal from "@/components/features/recruiter-chat/AssistantNotesModal";

const KINDS = [
  { value: "", tid: "portfolio--kind-all" },
  { value: "personal", tid: "portfolio--kind-personal" },
  { value: "pro", tid: "portfolio--kind-pro" },
];

const Portfolio = () => {
  const [kind, setKind] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  // Pro projects are public but anonymous; an approved access adds their identifying details
  const { request, adminCode, setAdminCode, vaultCode, ready, leave } = useRecruiterAccess();
  const { getTranslation } = useLangContext();

  const refreshProjects = async (isClick: boolean) => {
    setLoading(true);
    setProjects((await getProjects(vaultCode)).sort(byMostRecent));

    if (isClick) {
      toast.success(getTranslation("portfolio--refresh-success"));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ready) refreshProjects(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, vaultCode]);

  const categories = [...new Set(projects.map((project) => project.category))];
  // Never shown to blocked channels (e.g. Discord): not even the existence of an access
  return (
    <>
      {editingNotes && adminCode && (
        <AssistantNotesModal vaultCode={adminCode} onClose={() => setEditingNotes(false)} />
      )}
      {dashboardOpen && (
        <AccessDashboardModal
          vaultCode={adminCode}
          onVaultChanged={setAdminCode}
          onClose={() => setDashboardOpen(false)}
        />
      )}
      <CollectionSection
        id="portfolio"
        title={getTranslation("portfolio--title")}
        description={getTranslation("portfolio--description")}
        emptyText={getTranslation("portfolio--error")}
        filters={categories}
        selectedFilter={category}
        onFilterChange={setCategory}
        loading={loading}
        items={projects.filter(
          (p) => (kind === "" || p.kind === kind) && (category === "" || p.category === category)
        )}
        viewKey={`${kind}-${category}-${vaultCode ?? ""}`}
        toolbar={
          <>
            {KINDS.map((k) => (
              <Pill
                key={k.value}
                active={kind === k.value}
                activeLayoutId="portfolio-kind"
                onClick={() => setKind(k.value)}
                fontWeight="bold"
              >
                {getTranslation(k.tid)}
              </Pill>
            ))}
            {request?.status === "approved" && (
              <Pill accent icon={LuUnlock} pr="1.5">
                {getTranslation("portfolio--access-active")}
                <IconButton
                  aria-label={getTranslation("portfolio--access-leave")}
                  title={getTranslation("portfolio--access-leave")}
                  size="2xs"
                  variant="plain"
                  color="muted"
                  _hover={{ color: "white" }}
                  onClick={leave}
                >
                  <LuX />
                </IconButton>
              </Pill>
            )}
            {categories.length > 0 && <Box w="1px" h="6" bg="line" mx="2" />}
          </>
        }
        adminActions={
          <>
            <Button variant="ghost" h="9" px="3" fontSize="sm" onClick={() => setDashboardOpen(true)}>
              <LuBarChart3 />
              Access & tracking
            </Button>
            {adminCode && (
              <Button variant="ghost" h="9" px="3" fontSize="sm" onClick={() => setEditingNotes(true)}>
                <LuBot />
                Assistant notes
              </Button>
            )}
          </>
        }
        getKey={(project) => project.id ?? project.name}
        onRefresh={() => refreshProjects(true)}
        renderItem={(project) => (
          <ProjectCard project={project} vaultCode={adminCode} refresh={() => refreshProjects(false)} />
        )}
        renderFeatured={(project) => (
          <ProjectCard
            project={project}
            vaultCode={adminCode}
            variant="featured"
            refresh={() => refreshProjects(false)}
          />
        )}
        columns={{ base: 1, md: 2, xl: 3 }}
        renderAddModal={(close) => (
          <ProjectFormModal vaultCode={adminCode} onClose={close} refresh={() => refreshProjects(false)} />
        )}
      />
    </>
  );
};

export default Portfolio;
