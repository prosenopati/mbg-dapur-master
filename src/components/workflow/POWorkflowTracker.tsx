"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  FileText,
  Send,
  Truck,
  Package,
  ClipboardCheck,
  FileCheck,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { POWorkflow, WorkflowStep } from "@/lib/types/workflow";
import { cn } from "@/lib/utils";

interface POWorkflowTrackerProps {
  workflow: POWorkflow;
  compact?: boolean;
}

export function POWorkflowTracker({ workflow, compact = false }: POWorkflowTrackerProps) {
  const getStepIcon = (stepId: string) => {
    const icons: Record<string, any> = {
      draft: FileText,
      approval: ClipboardCheck,
      sent_to_supplier: Send,
      supplier_accept: CheckCircle2,
      proforma_invoice: FileCheck,
      shipment: Truck,
      receiving: Package,
      qc: ClipboardCheck,
      final_invoice: FileCheck,
      payment: DollarSign,
    };
    return icons[stepId] || Circle;
  };

  const getStepColor = (status: WorkflowStep['status']) => {
    const colors = {
      completed: "text-green-600 bg-green-100 border-green-300",
      in_progress: "text-blue-600 bg-blue-100 border-blue-300",
      pending: "text-gray-400 bg-gray-100 border-gray-300",
      failed: "text-red-600 bg-red-100 border-red-300",
      skipped: "text-yellow-600 bg-yellow-100 border-yellow-300",
    };
    return colors[status];
  };

  const getStatusBadge = (status: WorkflowStep['status']) => {
    const config: Record<WorkflowStep['status'], { variant: any; icon: any }> = {
      completed: { variant: "default", icon: CheckCircle2 },
      in_progress: { variant: "secondary", icon: Clock },
      pending: { variant: "outline", icon: Circle },
      failed: { variant: "destructive", icon: XCircle },
      skipped: { variant: "outline", icon: AlertCircle },
    };

    const { variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress Workflow</span>
          <span className="text-sm font-bold text-primary">{workflow.overallProgress}%</span>
        </div>
        <Progress value={workflow.overallProgress} className="h-2" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Step {workflow.currentStepIndex + 1} of {workflow.steps.length}</span>
          <span className="ml-auto">{workflow.steps[workflow.currentStepIndex]?.name}</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{workflow.overallProgress}%</span>
          </div>
        </div>
        <Progress value={workflow.overallProgress} className="h-3 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {workflow.steps.map((step, index) => {
            const Icon = getStepIcon(step.id);
            const isActive = index === workflow.currentStepIndex;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-l-4 transition-all",
                  isActive && "bg-primary/5 border-l-primary shadow-sm",
                  !isActive && "border-l-transparent"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0",
                    getStepColor(step.status)
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      "font-medium text-sm",
                      isActive && "text-primary"
                    )}>
                      {step.name}
                    </h4>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {step.completedAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(step.completedAt)}</span>
                      {step.completedBy && (
                        <>
                          <span>•</span>
                          <span>oleh {step.completedBy}</span>
                        </>
                      )}
                    </div>
                  )}
                  {step.notes && (
                    <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                      {step.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {workflow.completedAt && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Workflow Selesai</span>
              <span className="ml-auto text-xs">{formatDate(workflow.completedAt)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
