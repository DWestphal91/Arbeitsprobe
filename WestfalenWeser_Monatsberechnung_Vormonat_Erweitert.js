
/**
 * @file WestfalenWeser_Monatsberechnung_Vormonat_Einzelwert.js
 * @brief Berechnet den monatlichen Stromverbrauch und die Einspeisung. Gibt bei nur einem Monatswert diesen direkt zurück.
 * 
 * Dieses Skript nimmt zwei Arrays mit Zählerständen entgegen und berechnet die Differenz über den Monatswechsel.
 * Wenn nur ein Wert im Monat vorhanden ist, wird dieser mit Zeitstempel zurückgegeben.
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
 * Berechnet den Energieverbrauch für einen Monat. Nutzt den letzten Wert des Vormonats oder fällt zurück auf den ersten Monatswert.
 * Gibt bei nur einem Wert im Monat diesen direkt zurück.
 *
 * @param {Messpunkt[]} timestampedValues - Messdatenreihe (z. B. feed oder consumption)
 * @returns {number|Object} - Delta-Wert oder Einzelwertobjekt
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

  if (currentMonthtimestampedValues.length === 1) {
    return {
      info: "Nur ein Messwert vorhanden",
      value: currentMonthtimestampedValues[0].value,
      timestamp: currentMonthtimestampedValues[0].ts
    };
  }

  if (!lastOfCurrent) return 0;

  const start = lastOfPrev || firstOfCurrent;

  return parseFloat((lastOfCurrent.value - start.value).toFixed(2));
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
