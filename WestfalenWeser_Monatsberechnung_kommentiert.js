/**
 * @file WestfalenWeser_Monatsberechnung_kommentiert.js
 * @brief Berechnet den monatlichen Stromverbrauch und die Einspeisung auf Basis von Zeit-Wert-Paaren.
 * 
 * Dieses Skript nimmt zwei Arrays mit Zählerständen (consumption und feed) entgegen und filtert diese nach Jahr und Monat.
 * Anschließend wird die Differenz (Delta) zwischen dem ersten und letzten Wert des Monats berechnet.
 *
 * @author [Daniel Westphal]
 * @date 2025-05-04
 */

/**
 * @typedef {Object} Messpunkt
 * @property {number} ts - Zeitstempel im UNIX-Format (Millisekunden seit 1970)
 * @property {number} value - Zählerstand in kWh
 */

const feed = [
  { ts: 1740785107000, value: 1578.45 }, { ts: 1740786007000, value: 1578.45 },
  { ts: 1740786908000, value: 1578.45 }, { ts: 1740787508000, value: 1578.45 },
  { ts: 1743464710000, value: 2156.43 }, { ts: 1743465610000, value: 2156.43 },
  { ts: 1743466510000, value: 2156.43 }, { ts: 1743467410000, value: 2156.43 }
];

const consumption = [
  { ts: 1740785107000, value: 93709.83 }, { ts: 1740786007000, value: 93716.39 },
  { ts: 1740786908000, value: 93723.98 }, { ts: 1740787508000, value: 93726.74 },
  { ts: 1743464710000, value: 116790.68 }, { ts: 1743465610000, value: 116803.95 },
  { ts: 1743466510000, value: 116807.26 }, { ts: 1743467410000, value: 116815.18 }
];

/**
 * Berechnet den monatlichen Energieverbrauch und die Einspeisung.
 *
 * @param {Messpunkt[]} feed - Array mit Einspeisewerten (Zeit-Wert-Paare)
 * @param {Messpunkt[]} consumption - Array mit Verbrauchswerten (Zeit-Wert-Paare)
 * @param {number} year - Das gewünschte Jahr (z. B. 2025)
 * @param {number} month - Der gewünschte Monat (0-basiert: 0 = Januar, ..., 11 = Dezember)
 *
 * @returns {{feed_monthly: number, consumption_monthly: number}} Differenz (kWh) von feed und consumption innerhalb des Monats
 */

function calculateMonthlyConsumption(feed, consumption, year, month) {
  function getDeltaMeasures(timestampedValues) {
    if (!timestampedValues || timestampedValues.length < 2) return 0;

    let filtered = timestampedValues;
    if (typeof year === "number" && typeof month === "number") {
      filtered = timestampedValues.filter(entry => {
        const date = new Date(entry.ts);
        return date.getUTCFullYear() === year && date.getUTCMonth() === month;
      });
    }

    if (filtered.length < 2) return 0;

    const sorted = [...filtered].sort((a, b) => a.ts - b.ts);
    const first = sorted[0].value;
    const last = sorted[sorted.length - 1].value;
    return parseFloat((last - first).toFixed(2));
  }

  const feed_monthly = getDeltaMeasures(feed);
  const consumption_monthly = getDeltaMeasures(consumption);

  return { feed_monthly, consumption_monthly };
}

// Eingabe Jahr und Monat, für den Verbrauch.
// Monat ist 0-basiert (0 = Januar, 1 = Februar, 2 = März, ..., 11 = Dezember)
// Beispiel ist März 2025
const result = calculateMonthlyConsumption(feed, consumption, 2025, 2);

console.log("Monatlicher Verbrauch:");
console.log("Einspeisung (EPm):", result.feed_monthly, "kWh");
console.log("Verbrauch (EPp):", result.consumption_monthly, "kWh");
