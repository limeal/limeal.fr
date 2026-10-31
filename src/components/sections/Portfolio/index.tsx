"use client";

import { useEffect, useState } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { LuBot, LuKeyRound, LuUnlock, LuX } from "react-icons/lu";

import Project from "@/interfaces/project";
import {
  getConfidentialCount,
  getConfidentialProjects,
  getProjects,
  setConfidentialCount,
} from "@/firebase/store/project";
import { byMostRecent } from "@/utils/project";
import { useLangContext } from "@/contexts/LangContext";
import { useRecruiterAccess } from "@/contexts/RecruiterAccessContext";
import { toast } from "@/components/ui/Toaster";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import CollectionSection from "@/components/features/collection/CollectionSection";
import ProjectCard from "@/components/features/portfolio/ProjectCard";
import ProjectFormModal from "@/components/features/portfolio/ProjectFormModal";
import ConfidentialTeaser from "@/components/features/portfolio/ConfidentialTeaser";
import RecruiterCodeModal from "@/components/features/portfolio/RecruiterCodeModal";
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

  // Recruiters unlock confidential projects with a code; the admin reads it from Firestore
  const { recruiterCode, adminCode, setAdminCode, vaultCode, ready: codeReady, unlock, lock } =
    useRecruiterAccess();
  const [confidentialTotal, setConfidentialTotal] = useState(0);
  const [editingCode, setEditingCode] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  const { getTranslation } = useLangContext();

  const refreshProjects = async (isClick: boolean) => {
    setLoading(true);
    const [publicProjects, confidential, total] = await Promise.all([
      getProjects(),
      vaultCode ? getConfidentialProjects(vaultCode) : Promise.resolve([]),
      getConfidentialCount(),
    ]);

    // The admin view keeps the public counter of the teaser card in sync
    if (adminCode && confidential.length !== total) {
      await setConfidentialCount(confidential.length).catch(() => undefined);
    }

    setConfidentialTotal(adminCode ? confidential.length : total);
    setProjects([...publicProjects, ...confidential].sort(byMostRecent));

    if (isClick) {
      toast.success(getTranslation("portfolio--refresh-success"));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (codeReady) refreshProjects(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeReady, vaultCode]);

  const categories = [...new Set(projects.map((project) => project.category))];
  const showTeaser = !vaultCode && confidentialTotal > 0 && kind !== "personal";

  return (
    <>
      {editingNotes && adminCode && (
        <AssistantNotesModal vaultCode={adminCode} onClose={() => setEditingNotes(false)} />
      )}
      {editingCode && (
        <RecruiterCodeModal
          currentCode={adminCode}
          onChanged={setAdminCode}
          onClose={() => setEditingCode(false)}
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
            {recruiterCode && !adminCode && (
              <Pill accent icon={LuUnlock} pr="1.5">
                {getTranslation("portfolio--access-active")}
                <IconButton
                  aria-label={getTranslation("portfolio--access-leave")}
                  title={getTranslation("portfolio--access-leave")}
                  size="2xs"
                  variant="plain"
                  color="muted"
                  _hover={{ color: "white" }}
                  onClick={lock}
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
            <Button variant="ghost" h="9" px="3" fontSize="sm" onClick={() => setEditingCode(true)}>
              <LuKeyRound />
              {adminCode ? "Recruiter code" : "Set recruiter code"}
            </Button>
            {adminCode && (
              <Button variant="ghost" h="9" px="3" fontSize="sm" onClick={() => setEditingNotes(true)}>
                <LuBot />
                Assistant notes
              </Button>
            )}
          </>
        }
        after={
          showTeaser && <ConfidentialTeaser count={confidentialTotal} onUnlock={unlock} />
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
