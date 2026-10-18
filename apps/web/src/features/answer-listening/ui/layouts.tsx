"use client";

import type {
  FlowChartShape,
  GapAnswer,
  TableShape,
} from "@/shared/content/shapes";
import { CompletionTable } from "@/shared/ui/CompletionTable";
import { FlowChart } from "@/shared/ui/FlowChart";
import { GapLine } from "./controls";

export function TableView({
  table,
  answer,
}: {
  table: TableShape;
  answer: GapAnswer;
}) {
  return (
    <CompletionTable
      table={table}
      cell={(segments) => <GapLine segments={segments} answer={answer} />}
    />
  );
}

export function FlowChartView({
  chart,
  answer,
}: {
  chart: FlowChartShape;
  answer: GapAnswer;
}) {
  return (
    <FlowChart
      chart={chart}
      line={(segments) => <GapLine segments={segments} answer={answer} />}
    />
  );
}
