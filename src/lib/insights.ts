/**
 * Auto-generated insights derived from monthly aggregates.
 * Surfaces the "so what" of each chart so the reader doesn't have to infer it.
 *
 * Every function takes the data it needs as an argument: this module never
 * queries a database and never invents a number. With no data it returns an
 * empty list, and the page shows nothing rather than a hollow statement.
 */

import { paymentChannelLabels } from '@data/types';
import type { MonthlyAggregate, PaymentChannel } from '@data/types';
import { formatPercent } from './format';

export interface Insight {
  kind: 'positive' | 'negative' | 'neutral';
  text: string;
}

export function getCollectionsInsights(
  latest: MonthlyAggregate | null,
  previous: MonthlyAggregate | null,
): Insight[] {
  if (!latest || latest.byChannel.length === 0) return [];

  const insights: Insight[] = [];

  const topChannel = [...latest.byChannel].sort((a, b) => b.amount - a.amount)[0];
  if (topChannel && latest.collections.amount > 0) {
    const share = topChannel.amount / latest.collections.amount;
    insights.push({
      kind: 'positive',
      text: `${paymentChannelLabels[topChannel.channel]} concentra ${formatPercent(share)} del monto cobrado este mes.`,
    });
  }

  if (previous) {
    const growth = latest.byChannel.map((ch) => {
      const prev = previous.byChannel.find((c) => c.channel === ch.channel);
      if (!prev || prev.amount === 0) return { channel: ch.channel, delta: 0 };
      return { channel: ch.channel, delta: (ch.amount - prev.amount) / prev.amount };
    });

    const fastestGrowth = [...growth].sort((a, b) => b.delta - a.delta)[0];
    if (fastestGrowth && fastestGrowth.delta > 0.02) {
      insights.push({
        kind: 'positive',
        text: `${paymentChannelLabels[fastestGrowth.channel]} crece ${formatPercent(fastestGrowth.delta)} respecto al mes anterior.`,
      });
    }

    const slowest = [...growth].sort((a, b) => a.delta - b.delta)[0];
    if (slowest && slowest.delta < -0.02) {
      insights.push({
        kind: 'negative',
        text: `${paymentChannelLabels[slowest.channel]} retrocede ${formatPercent(Math.abs(slowest.delta))} este mes.`,
      });
    }
  }

  if (latest.collections.issuedAmount > 0) {
    insights.push({
      kind: latest.collections.amountCollectionRate >= 0.85 ? 'positive' : 'negative',
      text: `Se cobró ${formatPercent(latest.collections.amountCollectionRate)} de lo facturado en el período.`,
    });
  }

  const fastestTTC = [...latest.byChannel]
    .filter((c) => c.count > 0)
    .sort((a, b) => a.avgDaysToCollect - b.avgDaysToCollect)[0];
  if (fastestTTC) {
    const days = fastestTTC.avgDaysToCollect;
    insights.push({
      kind: 'neutral',
      text:
        days < 0
          ? `${paymentChannelLabels[fastestTTC.channel]} cobra ${Math.abs(days)} días antes del vencimiento: el canal más rápido.`
          : `${paymentChannelLabels[fastestTTC.channel]} cobra ${days} días después del vencimiento: el canal más rápido.`,
    });
  }

  return insights.slice(0, 4);
}

export function getMembershipInsights(
  latest: MonthlyAggregate | null,
  previous: MonthlyAggregate | null,
): Insight[] {
  if (!latest) return [];

  const insights: Insight[] = [];
  const netGrowth = latest.members.net;

  if (netGrowth > 0) {
    insights.push({
      kind: 'positive',
      text: `El padrón crece +${netGrowth} socios este mes (${latest.members.new} altas, ${latest.members.resigned} bajas).`,
    });
  } else if (netGrowth < 0) {
    insights.push({
      kind: 'negative',
      text: `El padrón retrocede ${netGrowth} socios este mes (${latest.members.new} altas, ${latest.members.resigned} bajas).`,
    });
  }

  if (previous && previous.members.active > 0) {
    const activeChange = (latest.members.active - previous.members.active) / previous.members.active;
    if (Math.abs(activeChange) > 0.005) {
      insights.push({
        kind: activeChange > 0 ? 'positive' : 'negative',
        text: `Padrón activo ${activeChange > 0 ? 'crece' : 'cae'} ${formatPercent(Math.abs(activeChange))} respecto al mes anterior.`,
      });
    }
  }

  if (latest.members.familyGroups > 0) {
    insights.push({
      kind: 'neutral',
      text: `${latest.members.familyGroups} grupos familiares activos con un promedio de ${latest.members.avgFamilySize} integrantes.`,
    });
  }

  return insights;
}

/**
 * Best-performing channel per club, by amount collected.
 * Clubs with no classified payments in the period are left out.
 */
export function bestChannelByClub(
  monthAggregates: MonthlyAggregate[],
): Array<{ clubId: string; channel: PaymentChannel; share: number }> {
  return monthAggregates
    .map((agg) => {
      const top = [...agg.byChannel].sort((a, b) => b.amount - a.amount)[0];
      if (!top || agg.collections.amount === 0) return null;
      return {
        clubId: agg.clubId,
        channel: top.channel,
        share: top.amount / agg.collections.amount,
      };
    })
    .filter((v): v is { clubId: string; channel: PaymentChannel; share: number } => v !== null);
}
