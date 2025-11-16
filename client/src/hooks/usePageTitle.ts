/**
 * usePageTitle Hook
 * Manages page titles for accessibility and SEO
 * WCAG 2.4.2 (Level A) - Page Titled
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { APP_TITLE } from "@/const";

export function usePageTitle(title: string) {
  const [location] = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} - ${APP_TITLE}` : APP_TITLE;
    document.title = fullTitle;

    // Update meta description if needed
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      `${title} page in ${APP_TITLE} application`
    );
  }, [title, location]);
}

