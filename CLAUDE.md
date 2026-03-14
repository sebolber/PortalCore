# CLAUDE.md - Health Portal (PortalCore)
## Code Standards (Clean Code)

### Naming
- Klassen: PascalCase, fachlich sprechend — NICHT Manager, Helper, Utils, Data, Info
- Methoden: Verb-Prefix (calculate, validate, fetch, resolve), max 20 Zeilen
- Variablen: Intention-Revealing, KEINE Abkürzungen (versichertenNummer NICHT vsnr, arbeitgeberKonto NICHT agKto)
- Booleans: is/has/can/should-Prefix (isVersichert, hasRueckstand, canMeldungSend)
- Konstanten: UPPER_SNAKE_CASE mit fachlichem Kontext (MAX_MELDUNG_RETRY_COUNT, DEFAULT_BEITRAGSSATZ)
- Packages: Fachliche Schnitte (meldung, beitrag, arbeitgeber), NICHT technische (util, helper, common)

### Methoden & Funktionen
- Max 3 Parameter. Mehr → Parameter-Objekt / Record einführen
- Eine Methode = eine Aufgabe. Wenn du "und" brauchst, splitten
- Max 2 Ebenen Verschachtelung — Early Return statt tiefer if/else
- Keine Flag-Parameter (boolean als Steuerung). Stattdessen: zwei klar benannte Methoden
- Keine Seiteneffekte: Methode tut was der Name sagt, nicht mehr

### Klassen & Struktur
- Single Responsibility: Eine Klasse = eine Verantwortung
- Favor Composition over Inheritance
- Interfaces für Connector-Anbindungen, konkrete Implementierung pro Kassensystem
- DTOs sind reine Datenträger — keine Logik, keine Vererbungshierarchien
- Records für immutable DTOs bevorzugen (Java 16+)
- Kein auskommentierter Code. Gelöschter Code lebt im Git
- Keine Wildcard-Imports (import java.util.*)

### Error Handling
- Keine leeren catch-Blöcke — NIEMALS
- Fachliche Exceptions mit Kontext: MeldungVerarbeitungException("Meldung {id} konnte nicht an {kasse} übermittelt werden: {grund}")
- Keine generischen RuntimeExceptions werfen
- Checked Exceptions nur an Systemgrenzen (Connector-Schicht)
- Fehler so nah wie möglich am Entstehungsort behandeln
- Logging bei jedem catch: mindestens WARN mit Kontext

### Logging
- SLF4J mit strukturierten Parametern: log.info("Meldung verarbeitet: meldungId={}, kasse={}", id, kasse)
- NICHT: log.info("Meldung " + id + " verarbeitet für " + kasse)
- Log-Level korrekt verwenden: ERROR = Systemfehler, WARN = fachlicher Fehler, INFO = relevante Geschäftsvorgänge, DEBUG = technische Details

### Tests
- Jede öffentliche Methode hat mindestens einen Unit-Test
- Testname: should_ExpectedBehavior_When_StateUnderTest (should_RejectMeldung_When_BetriebsnummerInvalid)
- Arrange-Act-Assert Struktur, mit Leerzeilen getrennt
- Ein Assert pro Test (logisch zusammenhängende Asserts sind OK)
- Mocking nur an Systemgrenzen (Connector, Repository), NICHT innerhalb der eigenen Service-Schicht
- Testdaten über Builder-Pattern oder ObjectMother, NICHT inline-Konstruktion mit 15 Parametern

### Kommentare
- Code soll sich selbst erklären. Kommentare nur für das WARUM, nie für das WAS
- Javadoc für öffentliche API-Methoden der Service-Schicht
- TODO-Kommentare immer mit Ticket-Referenz: // TODO PORTAL-1234: Retry-Logik für Oscare-Timeout implementieren

## Befehle

- `mvn clean verify`: Build + Tests
- `mvn test -pl <modul>`: Einzelnes Modul testen
- `mvn spotless:apply`: Code formatieren
- `mvn checkstyle:check`: Style prüfen

## Regeln für Claude

- IMMER nach Änderungen `mvn compile` laufen lassen um Compile-Fehler früh zu finden
- NIEMALS Credentials, Tokens oder Passwörter in Code oder Konfiguration hartcoden
- Bei neuen Klassen: prüfe ob es schon eine ähnliche Abstraktion gibt bevor du eine neue erstellst
- Bei Connector-Änderungen: alle Kassensystem-Implementierungen konsistent anpassen
- Commit-Messages: Konventionelle Commits (feat:, fix:, refactor:, docs:, test:)
