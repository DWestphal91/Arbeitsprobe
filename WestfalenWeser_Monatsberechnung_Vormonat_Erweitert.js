/**
 * @file WestfalenWeser_Monatsberechnung_Vormonat_Einzelwert.js
 * @brief Berechnet den monatlichen Stromverbrauch und die Einspeisung. Behandelt auch Erstmessungen korrekt.
 * 
 * Dieses Skript nimmt zwei Arrays mit Zählerständen entgegen und berechnet die Differenz über den Monatswechsel.
 * Bei nur einem Wert im Monat wird dieser direkt zurückgegeben.
 * Wenn keine früheren Daten im Monat existieren, wird der letzte Monatswert als Gesamtdifferenz interpretiert (Erstmessung).
 *
 * @author Daniel Westphal
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
 * Berechnet den Energieverbrauch für einen Monat. Behandelt Erstmessungen, Einzelwerte und konstante Werte.
 *
 * @param {Messpunkt[]} timestampedValues - Messdatenreihe (z. B. feed oder consumption)
 * @returns {number|Object} - Delta-Wert oder erklärendes Objekt
 */
function getDeltaWithFallback(timestampedValues) {
  if (!timestampedValues || timestampedValues.length === 0) return 0;

  const timestampedValuesWithDate = timestampedValues.map(entry => ({
    ...entry,
    date: new Date(entry.ts)
  }));

  const sorted = timestampedValuesWithDate.sort((a, b) => a.ts - b.ts);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const lastOfPrev = [...sorted]
    .filter(e => e.date.getUTCFullYear() === prevYear && e.date.getUTCMonth() === prevMonth)
    .pop();

  const currentMonthtimestampedValues = [...sorted]
    .filter(e => e.date.getUTCFullYear() === year && e.date.getUTCMonth() === month);

  const firstOfCurrent = currentMonthtimestampedValues[0];
  const lastOfCurrent = currentMonthtimestampedValues[currentMonthtimestampedValues.length - 1];

  if (!lastOfCurrent) return 0;

  if (currentMonthtimestampedValues.length === 1) {
    return {
      info: "Nur ein Messwert im Monat vorhanden",
      value: currentMonthtimestampedValues[0].value,
      timestamp: currentMonthtimestampedValues[0].ts
    };
  }

  // Sonderfall: keine früheren Daten im Monat → Erstmessung
  if (!lastOfPrev) {
    return {
      info: "Erstmessung – vollständiger Monatswert übernommen",
      value: lastOfCurrent.value
    };
  }

  const delta = parseFloat((lastOfCurrent.value - lastOfPrev.value).toFixed(2));
  // Wenn der Delta-Wert 0 ist, wird eine Erklärung zurückgegeben
  if (delta === 0) {
    return {
      info: "Keine Änderung im Zeitraum festgestellt"
    };
  }

  return delta;
}

/**
 * Hauptfunktion zur Monatsberechnung für Einspeisung und Verbrauch.
 *
 * @param {Messpunkt[]} feed - Einspeisung
 * @param {Messpunkt[]} consumption - Verbrauch
 * @param {number} year - Jahr (z. B. 2025)
 * @param {number} month - Monat (0-basiert)
 *
 * @returns {{feed_monthly: number|Object, consumption_monthly: number|Object}} Ergebnis
 */
function calculateMonthlyConsumption(feed, consumption, year, month) {
  return {
    feed_monthly: getDeltaWithFallback(feed),
    consumption_monthly: getDeltaWithFallback(consumption)
  };
}

// Beispiel: März 2025 (Monat = 2)
const year = 2025;
const month = 2;

const result = calculateMonthlyConsumption(feed, consumption, year, month);

console.log("Monatlicher Verbrauch:");
console.log("Einspeisung (EPm):", result.feed_monthly);
console.log("Verbrauch (EPp):", result.consumption_monthly);
