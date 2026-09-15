"use client";

import "@okkly/design-system/components/Stepper/Stepper.scss";
import type { StepperStep, StepperProps, StepState } from "./Stepper.types";

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function getStepState(index: number, activeStep: number): StepState {
  if (index < activeStep) return "done";
  if (index === activeStep) return "active";
  return "pending";
}

function StepLabel({ step }: { step: StepperStep }) {
  return (
    <>
      <div className="okkly-stepper__label">
        {step.label}
        {step.optional && <span className="okkly-stepper__optional">(optional)</span>}
      </div>
      {step.description && <div className="okkly-stepper__description">{step.description}</div>}
    </>
  );
}

export function Stepper({
  steps,
  activeStep,
  orientation = "horizontal",
  alternativeLabel = true,
  color = "primary",
  className,
  ...rest
}: StepperProps) {
  const classes = [
    "okkly-component",
    "okkly-stepper",
    `okkly-stepper--${orientation}`,
    alternativeLabel && orientation === "horizontal" && "okkly-stepper--alternative-label",
    color !== "primary" && `okkly-stepper--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="list" {...rest}>
      {steps.map((step, index) => {
        const state = getStepState(index, activeStep);
        const isLast = index === steps.length - 1;
        const connectorActive = index < activeStep;

        const dot = (
          <span
            className={[
              "okkly-stepper__dot",
              state === "done" && "okkly-stepper__dot--done",
              state === "active" && "okkly-stepper__dot--active",
              state === "pending" && "okkly-stepper__dot--pending",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            {state === "done" ? (
              <span className="okkly-stepper__check-icon">
                <CheckIcon />
              </span>
            ) : (
              index + 1
            )}
          </span>
        );

        return (
          <div
            key={index}
            className={[
              "okkly-stepper__step",
              state === "done" && "okkly-stepper__step--done",
              state === "active" && "okkly-stepper__step--active",
            ]
              .filter(Boolean)
              .join(" ")}
            role="listitem"
            aria-current={state === "active" ? "step" : undefined}
          >
            <div className="okkly-stepper__step-inner">
              {orientation === "vertical" ? (
                <>
                  <div className="okkly-stepper__track">
                    {dot}
                    {!isLast && (
                      <span
                        className={[
                          "okkly-stepper__connector",
                          connectorActive && "okkly-stepper__connector--active",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="okkly-stepper__content">
                    <StepLabel step={step} />
                  </div>
                </>
              ) : alternativeLabel ? (
                <>
                  <div className="okkly-stepper__track">
                    {dot}
                    {!isLast && (
                      <span
                        className={[
                          "okkly-stepper__connector",
                          connectorActive && "okkly-stepper__connector--active",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="okkly-stepper__content">
                    <StepLabel step={step} />
                  </div>
                </>
              ) : (
                <div className="okkly-stepper__inline-row">
                  {dot}
                  <div className="okkly-stepper__content okkly-stepper__content--inline">
                    <StepLabel step={step} />
                  </div>
                  {!isLast && (
                    <span
                      className={[
                        "okkly-stepper__connector",
                        connectorActive && "okkly-stepper__connector--active",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
