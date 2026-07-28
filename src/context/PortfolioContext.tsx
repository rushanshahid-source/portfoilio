import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { config as defaultConfig } from "../config";

type ConfigType = typeof defaultConfig;

interface PortfolioContextType {
  config: ConfigType;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<ConfigType>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [bioRes, skillsRes, projectsRes, expRes] = await Promise.all([
        supabase.from("bio").select("*").single(),
        supabase.from("skills").select("*"),
        supabase.from("projects").select("*").order("id"),
        supabase.from("experiences").select("*").order("id"),
      ]);

      if (bioRes.data) {
        const bio = bioRes.data;
        setConfig((prev) => ({
          ...prev,
          developer: {
            name: bio.name,
            fullName: bio.full_name,
            title: bio.title,
            description: bio.description,
          },
          social: {
            github: bio.github,
            email: bio.email,
            location: bio.location,
          },
          about: {
            title: bio.about_title,
            description: bio.about_description,
          },
          contact: {
            email: bio.email,
            github: bio.github,
            linkedin: bio.linkedin,
            twitter: bio.twitter,
            facebook: bio.facebook,
            instagram: bio.instagram,
          },
        }));
      }

      if (skillsRes.data) {
        const develop = skillsRes.data.find((s: any) => s.id === "develop");
        const design = skillsRes.data.find((s: any) => s.id === "design");
        if (develop || design) {
          setConfig((prev) => ({
            ...prev,
            skills: {
              develop: develop || prev.skills.develop,
              design: design || prev.skills.design,
            },
          }));
        }
      }

      if (projectsRes.data) {
        setConfig((prev) => ({
          ...prev,
          projects: projectsRes.data,
        }));
      }

      if (expRes.data) {
        setConfig((prev) => ({
          ...prev,
          experiences: expRes.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <PortfolioContext.Provider value={{ config, loading, refreshData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
