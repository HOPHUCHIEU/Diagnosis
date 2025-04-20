import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    stepKey: "step1",
    image: "/landing/appointment.svg",
  },
  {
    stepKey: "step2",
    image: "/landing/tele.svg",
  },
  {
    stepKey: "step3",
    image: "/landing/dashboard.svg",
  },
  {
    stepKey: "step4",
    image: "/landing/quick_consultant.svg",
  },
] as const;

export default function HowItWorks() {
  const { t } = useTranslation();

  const getTranslation = (key: string) => {
    return t(key as any);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{getTranslation("howItWorks.title")}</h2>
        <p className="text-gray-600">{getTranslation("howItWorks.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step) => (
          <Card key={step.stepKey} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <img
                  src={step.image}
                  alt={getTranslation(`howItWorks.steps.${step.stepKey}.title`)}
                  className="w-24 h-24 mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  {getTranslation(`howItWorks.steps.${step.stepKey}.title`)}
                </h3>
                <p className="text-gray-600 text-center">
                  {getTranslation(`howItWorks.steps.${step.stepKey}.description`)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
