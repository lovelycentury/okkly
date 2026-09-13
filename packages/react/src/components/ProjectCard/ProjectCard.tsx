"use client";

import type { HTMLAttributes } from "react";
import "@okkly/design-system/components/ProjectCard/ProjectCard.scss";
import type { ProjectCardProps } from "./ProjectCard.types";

/** Portfolio/case-study card. No MUI equivalent — this design has no reference API to mirror. */
export function ProjectCard({
  image,
  logo,
  title,
  description,
  tags = [],
  device = false,
  href,
  className,
  ...rest
}: ProjectCardProps) {
  const classes = ["okkly-component", "okkly-project-card", className].filter(Boolean).join(" ");

  const content = (
    <>
      {image && <img className="okkly-project-card__background" src={image} alt="" />}
      <div className="okkly-project-card__scrim" aria-hidden="true" />
      {device && (
        <div className="okkly-project-card__device" aria-hidden="true">
          <div className="okkly-project-card__device-screen" />
          <div className="okkly-project-card__device-notch" />
          <div className="okkly-project-card__device-line okkly-project-card__device-line--1" />
          <div className="okkly-project-card__device-line okkly-project-card__device-line--2" />
          <div className="okkly-project-card__device-line okkly-project-card__device-line--3" />
          <div className="okkly-project-card__device-line okkly-project-card__device-line--4" />
        </div>
      )}
      <div className="okkly-project-card__header">
        {logo && <div className="okkly-project-card__logo">{logo}</div>}
        <div className="okkly-project-card__action" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </div>
      </div>
      <div className="okkly-project-card__body">
        {tags.length > 0 && (
          <div className="okkly-project-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="okkly-project-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="okkly-project-card__title">{title}</h3>
        {description && <p className="okkly-project-card__description">{description}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  return (
    <div className={classes} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {content}
    </div>
  );
}
