// Digitaler Reifegrad-Fragenkatalog, übernommen aus WS_SWFL_Management_Cockpit.xlsx
// Struktur: 5 Dimensionen -> je 3 Kriterien -> 31 Fragen insgesamt

export interface QuestionSeed {
  number: number;
  text: string;
}

export interface CriterionSeed {
  name: string;
  questions: QuestionSeed[];
}

export interface DimensionSeed {
  name: string;
  criteria: CriterionSeed[];
}

export const dimensions: DimensionSeed[] = [
  {
    name: "Technologie",
    criteria: [
      {
        name: "Technologiebasis",
        questions: [
          { number: 1, text: "Alle eingehenden Informationen für den Prozess sind vollständig digital." },
          { number: 2, text: "Alle ausgehenden Informationen für den Prozess sind vollständig digital." },
        ],
      },
      {
        name: "Tools im Prozess",
        questions: [
          { number: 3, text: "Es wird eine Software-Lösung (SIGNAVIO) zur vollständigen Modellierung und Analyse des Prozesses eingesetzt." },
          { number: 4, text: "Der Prozess ist mit einer Software-Lösung vollständig automatisiert." },
        ],
      },
      {
        name: "Systemintegration",
        questions: [
          { number: 5, text: "Alle im Prozess verwendeten Software-Lösungen sind vollständig integriert." },
          { number: 6, text: "Der Prozess läuft vollständig ohne unnötige Medienbrüche." },
        ],
      },
    ],
  },
  {
    name: "Prozessdaten",
    criteria: [
      {
        name: "Datenerhebung",
        questions: [
          { number: 7, text: "Prozessdurchläufe (z. B. Logdaten) im Prozess werden vollständig automatisiert erhoben." },
          { number: 8, text: "Prozessdurchläufe (z. B. Logdaten) im Prozess werden vollständig digital archiviert." },
        ],
      },
      {
        name: "Datenbereitstellung",
        questions: [
          { number: 9, text: "Die Bereitstellung von Daten für das Berichtswesen (Reporting) im Prozess ist automatisiert und vollständig digital." },
          { number: 10, text: "Die visuelle Darstellung von Daten im Prozess erfolgt strukturiert und nutzerfreundlich." },
        ],
      },
      {
        name: "Datenverwendung",
        questions: [
          { number: 11, text: "Daten können vollständig durch eine Schnittstelle für die externe Nutzung durch weitere Anwendungen wie z.B. BI bereitgestellt werden." },
          { number: 12, text: "Daten sind immer Grundlage zur Verbesserung des Prozesses." },
        ],
      },
    ],
  },
  {
    name: "Prozessqualität",
    criteria: [
      {
        name: "Beschreibung",
        questions: [
          { number: 13, text: "Der Prozess ist mithilfe von Standards (z.B. BPMN, EPK oder UML) vollständig dokumentiert (Fokus: Dokumentation)." },
          { number: 14, text: "Der Prozess ist mithilfe von Standards vollständig beschrieben (Fokus: Arbeitsablaufbeschreibung)." },
        ],
      },
      {
        name: "Ausführung",
        questions: [
          { number: 15, text: "Der Status des Prozesses ist jederzeit aus Sicht eines anderen Bereiches (falls gewünscht) einsehbar." },
          { number: 16, text: "Die Stabilität der Prozessdurchläufe ist auch bei Lastspitzen zu jeder Zeit sichergestellt." },
        ],
      },
      {
        name: "Compliance",
        questions: [
          { number: 17, text: "Der Prozess beinhaltet wirksame Kontrollen und Prüfinstanzen, um die Einhaltung der regulatorischen Anforderungen sicherzustellen (intern)." },
          { number: 18, text: "Der Prozess stellt die regulatorischen Anforderungen an Datenschutz und Datensicherheit vollständig sicher (extern)." },
        ],
      },
    ],
  },
  {
    name: "Kundinnen und Kunden",
    criteria: [
      {
        name: "Zentrierung",
        questions: [
          { number: 19, text: "Der Prozess sieht die kontinuierliche Dokumentation der Kundenbedürfnisse vor." },
          { number: 20, text: "Der Prozess sieht (zugeschnittene) Produkt- bzw. Serviceangebote für Kundinnen und Kunden vor." },
        ],
      },
      {
        name: "Nutzen",
        questions: [
          { number: 21, text: "Der Status des Prozesses ist jederzeit von außen (d. h. aus Kundensicht) einsehbar." },
          { number: 22, text: "Die Kundinnen und Kunden erkennen den Nutzen des digitalen Prozesses und wenden diesen an." },
        ],
      },
      {
        name: "Partizipation",
        questions: [
          { number: 23, text: "Der Prozess sieht verbindliche Beteiligungsformate für Kundinnen und Kunden wie z. B. Zufriedenheitsbefragungen, Feedback- und Ideenmanagement vor." },
          { number: 24, text: "Es werden wirksame Maßnahmen (z. B. Barrierefreiheit, responsive Design) ergriffen, um digitale Zugangsbarrieren im Prozess abzuschaffen." },
        ],
      },
    ],
  },
  {
    name: "Skills und Kultur",
    criteria: [
      {
        name: "Digital Skills",
        questions: [
          { number: 25, text: "Die im Prozess involvierten Mitarbeitenden besitzen die Kompetenzen, um den Ist-Prozess erfolgreich durchzuführen." },
          { number: 26, text: "Es steht vollständige digitale Kompetenz (intern oder extern) zur Verfügung, um den Prozess erfolgreich weiterzuentwickeln." },
        ],
      },
      {
        name: "Digital Leadership",
        questions: [
          { number: 27, text: "Die im Prozess beteiligten Führungskräfte denken selbst vorrangig in digitalen Lösungen." },
          { number: 28, text: "In der Organisation werden für die Beschäftigten wirksame Maßnahmen ergriffen, um Leistungen/Services im digitalisierten Umfeld zu fördern (Veränderungsmanagement)." },
        ],
      },
      {
        name: "Digital Mindset",
        questions: [
          { number: 29, text: "Die im Prozess beteiligten Mitarbeitenden wirken in einem Umfeld, in der eine Fehlerkultur (Experimentalkultur) gefördert wird." },
          { number: 30, text: "Digitale Ansätze sind im Prozess bei der Lösung von Problemen stets erste Wahl (Digital First)." },
          { number: 31, text: "Digitale Ansätze sind im Unternehmen bei der Lösung von Problemen stets erste Wahl (Digital First)." },
        ],
      },
    ],
  },
];

// Bewertungsskala aus dem Excel-Fragenkatalog
export const ratingScale = [
  { value: 1, label: "nicht digital", description: "trifft überhaupt nicht zu (0 %)" },
  { value: 2, label: "überwiegend nicht digital", description: "trifft eher nicht zu (> 0 % - 40 %)" },
  { value: 3, label: "teilweise digital", description: "teils, teils (> 40 % - 50 %)" },
  { value: 4, label: "überwiegend digital", description: "trifft eher zu (> 50 % - 95 %)" },
  { value: 5, label: "vollständig digital", description: "trifft vollständig zu (> 95 %)" },
];
